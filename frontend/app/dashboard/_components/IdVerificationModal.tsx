"use client";

import { useState, useRef } from "react";
import { submitVerification } from "@/lib/api/auth";

interface IdVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  user: {
    email?: string;
    firstName?: string;
    lastName?: string;
    college?: string;
  };
}

// Phone photos base64-encode to several megabytes, which is slow to upload and
// bloats the stored record. Downscale to a size where an ID card is still legible.
const MAX_IMAGE_EDGE = 1400;
const JPEG_QUALITY = 0.82;
// Keeps the scan animation from flashing past when the upload is quick, without
// putting a fixed delay in front of errors the way the old flow did.
const MIN_SCAN_MS = 2600;

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      response?: { data?: { message?: unknown } };
      message?: unknown;
    };

    const serverMessage = candidate.response?.data?.message;
    if (typeof serverMessage === "string" && serverMessage.trim()) return serverMessage;
    if (typeof candidate.message === "string" && candidate.message.trim()) return candidate.message;
  }

  return fallback;
}

function downscaleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const image = new window.Image();

      image.onerror = () => reject(new Error("That file is not a readable image."));
      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
        if (scale === 1 && dataUrl.length < 1_500_000) {
          resolve(dataUrl);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        if (!context) {
          resolve(dataUrl);
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      image.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

export default function IdVerificationModal({ isOpen, onClose, onSubmitted, user }: IdVerificationModalProps) {
  const [step, setStep] = useState<"upload" | "scanning" | "success">("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanText, setScanText] = useState("Extracting text...");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      setImagePreview(await downscaleImage(file));
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Could not load that image. Try a different file."));
    }
  };

  const startScan = async () => {
    if (!imagePreview) return;

    setError(null);
    setStep("scanning");

    // Simulate AI scanning phases
    setTimeout(() => setScanText("Validating college database..."), 1500);
    setTimeout(() => setScanText("Verifying student status..."), 3000);
    const startedAt = Date.now();

    try {
      await submitVerification(imagePreview);

      const remaining = MIN_SCAN_MS - (Date.now() - startedAt);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      setStep("success");
      onSubmitted();
    } catch (err: unknown) {
      // Surface the server's reason - a silent failure here used to leave the
      // coordinator's queue empty with no indication anything went wrong.
      setError(
        extractErrorMessage(err, "Could not submit your ID. Check your connection and try again.")
      );
      setStep("upload");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={step !== "scanning" ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl transition-all">
        {step === "upload" && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="M15 8h2M15 12h2M7 16h10" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900">Verify Student ID</h3>
            <p className="mt-2 text-sm text-slate-500 mb-6">
              Upload a clear photo of your college ID card. Our AI will automatically verify your student status.
            </p>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-600">Click to upload image</span>
                  <span className="text-xs text-slate-400">JPG, PNG up to 5MB</span>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 h-48 w-full bg-slate-100 flex items-center justify-center">
                <img src={imagePreview} alt="ID Preview" className="h-full w-full object-cover" />
                <button 
                  onClick={() => { setImagePreview(null); setError(null); }}
                  className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-slate-600 shadow hover:text-red-500 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {error && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-xs font-medium text-red-700">
                {error}
              </p>
            )}

            <div className="mt-8 flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={startScan}
                disabled={!imagePreview}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none"
              >
                Start Verification
              </button>
            </div>
          </div>
        )}

        {step === "scanning" && (
          <div className="animate-in fade-in zoom-in duration-300 py-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6">AI Scanning in Progress</h3>
            
            <div className="relative mx-auto h-48 w-full max-w-sm overflow-hidden rounded-2xl border-2 border-blue-100 bg-slate-100 shadow-inner">
              <img src={imagePreview!} alt="Scanning" className="h-full w-full object-cover opacity-60" />
              
              {/* Laser animation */}
              <div className="absolute inset-0 z-10 animate-[scan_2s_ease-in-out_infinite]">
                <div className="h-0.5 w-full bg-blue-500 shadow-[0_0_15px_3px_rgba(59,130,246,0.6)]" />
                <div className="h-16 w-full bg-gradient-to-b from-blue-500/20 to-transparent" />
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-3 text-blue-600">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="text-sm font-semibold animate-pulse">{scanText}</span>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="animate-in fade-in zoom-in duration-500 py-6">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-500 ring-8 ring-green-50/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Submitted for Review!</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-[280px] mx-auto">
              Your college ID has been sent to your event coordinator. You&apos;ll be notified once approved.
            </p>
            
            <button 
              onClick={onClose}
              className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-700"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { transform: translateY(-10%); }
          50% { transform: translateY(100%); }
        }
      `}} />
    </div>
  );
}
