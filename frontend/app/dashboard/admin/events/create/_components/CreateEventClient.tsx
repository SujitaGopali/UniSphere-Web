"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { generateEventDescription } from "@/lib/actions/ai-action";
import { handleCreateEvent } from "@/lib/actions/event-action";

interface CreateEventClientProps {
  user: Record<string, any>;
}

export default function CreateEventClient({ user }: CreateEventClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [aiValidationError, setAiValidationError] = useState<string | null>(null);
  const [showReplacePrompt, setShowReplacePrompt] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [brochureImage, setBrochureImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const organizerCollege = (user?.college || "").trim();

  const [formData, setFormData] = useState({
    title: "",
    category: "Technical",
    eventType: "Intercollegiate",
    college: organizerCollege,
    date: "",
    location: "",
    capacity: "",
    cashPrize: "",
    description: "",
    aiKeywords: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrochureFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setBrochureImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleBrochureFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleBrochureFile(file);
  };

  const runGenerateAI = async () => {
    setAiValidationError(null);
    setAiMessage(null);
    setIsGenerating(true);

    try {
      const result = await generateEventDescription({
        title: formData.title,
        category: formData.category,
        keywords: formData.aiKeywords,
        eventType: formData.eventType,
        college: formData.college,
        date: formData.date,
        location: formData.location,
        capacity: formData.capacity,
        cashPrize: formData.cashPrize,
      });

      if (!result.success) {
        setAiMessage({ type: "error", text: result.message });
        return;
      }

      setFormData((prev) => ({ ...prev, description: result.description }));
      setAiMessage({
        type: result.source === "ai" ? "success" : "info",
        text: result.message,
      });
    } catch (error) {
      console.error(error);
      setAiMessage({
        type: "error",
        text: "Something went wrong while generating the description. Please try again.",
      });
    } finally {
      setIsGenerating(false);
      setShowReplacePrompt(false);
    }
  };

  const handleGenerateAI = () => {
    setAiValidationError(null);
    setAiMessage(null);

    if (!formData.title.trim()) {
      setAiValidationError("Add an event title before generating a description.");
      return;
    }

    if (!formData.aiKeywords.trim()) {
      setAiValidationError("Add a few keywords or details for the AI to work with.");
      return;
    }

    if (formData.description.trim()) {
      setShowReplacePrompt(true);
      return;
    }

    void runGenerateAI();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!organizerCollege) {
      setSubmitError("Please set your college in your admin profile before creating an event.");
      return;
    }

    startTransition(async () => {
      const result = await handleCreateEvent({
        title: formData.title,
        category: formData.category as
          | "Sports"
          | "Technical"
          | "Cultural"
          | "Workshop"
          | "Other"
          | "Literary"
          | "Management"
          | "Others",
        eventType: formData.eventType as "Intercollegiate" | "Intracollegiate",
        college: formData.college,
        date: formData.date,
        location: formData.location,
        capacity: Number(formData.capacity) || 100,
        cashPrize: formData.cashPrize.trim() || undefined,
        description: formData.description,
        brochureImage: brochureImage || undefined,
      });

      if (!result.success) {
        alert(result.message || "Failed to create event.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/admin/events");
        router.refresh();
      }, 1200);
    });
  };

  return (
    <main className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Create New Event
            <span className="rounded-md bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700 uppercase tracking-wide">
              Coordinator
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Fill in the details to publish a new college event for students.</p>
        </div>

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Event created successfully! It is now live for students. Redirecting...
          </div>
        )}

        {submitError && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Event Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white"
                  placeholder="e.g. Annual Tech Symposium 2026"
                />
              </div>

              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Genre / Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Literary">Literary</option>
                    <option value="Management">Management</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Event Type</label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Intercollegiate">Intercollegiate</option>
                    <option value="Intracollegiate">Intracollegiate</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    required
                    value={formData.capacity}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white"
                    placeholder="e.g. 150"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Host College</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  readOnly
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-700 outline-none"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Events are published under your coordinator college from your profile.
                </p>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Location Venue</label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white"
                    placeholder="e.g. Main Auditorium, Naxal"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Prize
                  <span className="ml-2 text-xs font-normal text-slate-400">(optional — shown to students in the feed)</span>
                </label>
                <input
                  type="text"
                  name="cashPrize"
                  value={formData.cashPrize}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                  placeholder="e.g. NPR 10,000 + Certificates, Trophy for winners"
                />
              </div>

              <div className="mb-2 flex items-end justify-between">
                <label className="block text-sm font-semibold text-slate-700">Event Description</label>
              </div>
              {aiMessage && (
                <div
                  className={`mb-3 rounded-xl px-4 py-3 text-sm ${
                    aiMessage.type === "success"
                      ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                      : aiMessage.type === "error"
                        ? "border border-red-100 bg-red-50 text-red-600"
                        : "border border-amber-100 bg-amber-50 text-amber-800"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {aiMessage.text}
                </div>
              )}
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={8}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white"
                placeholder="Write a detailed description of the event..."
              />

              <div className="mb-8 mt-8">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Event Brochure / Poster
                  <span className="ml-2 text-xs font-normal text-slate-400">(optional — shown as cover image in feed)</span>
                </label>

                {brochureImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="relative w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brochureImage}
                        alt="Event brochure preview"
                        className="w-full object-cover max-h-56 rounded-xl"
                      />
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg bg-white/90 backdrop-blur px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-white transition-colors"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setBrochureImage(null)}
                        className="rounded-lg bg-red-500/90 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-violet-400 bg-violet-50"
                        : "border-slate-200 bg-slate-50/50 hover:border-violet-300 hover:bg-violet-50/30"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Click to upload or drag &amp; drop</p>
                      <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5 MB</p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-50"
                >
                  {isPending ? "Publishing Event..." : "Publish Event"}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl border border-purple-100 bg-gradient-to-b from-purple-50 to-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">AI Description Generator</h3>
              <p className="mb-6 text-sm text-slate-600">
                Save time and let our AI write a compelling event description for you. Just enter a few keywords below.
              </p>

              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-purple-700">
                  Key details or keywords
                </label>
                <textarea
                  name="aiKeywords"
                  value={formData.aiKeywords}
                  onChange={(e) => {
                    handleChange(e);
                    if (aiValidationError) setAiValidationError(null);
                  }}
                  rows={3}
                  className={`w-full rounded-xl border bg-white p-3 text-sm outline-none transition-all focus:ring-2 ${
                    aiValidationError
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                  }`}
                  placeholder="e.g. 24 hour hackathon, free food, guest speaker from Google, beginners welcome"
                />
                {aiValidationError && (
                  <p className="mt-2 text-xs font-medium text-red-600">{aiValidationError}</p>
                )}
              </div>

              {showReplacePrompt && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-900">
                    This will replace your current description. Continue?
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void runGenerateAI()}
                      disabled={isGenerating}
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                    >
                      Replace description
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReplacePrompt(false)}
                      className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition-all hover:bg-purple-700 disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M2 12h4l3-9 5 18 3-9h5" />
                    </svg>
                    Generate with AI
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-slate-400">
                Powered by Google Gemini
              </p>
            </div>
          </div>
        </div>
      </main>
  );
}
