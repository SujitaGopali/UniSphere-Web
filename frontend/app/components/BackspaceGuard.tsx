'use client';
import { useEffect } from "react";

export default function BackspaceGuard() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      const isEditable =
        tag === "INPUT" || tag === "TEXTAREA" || (target as any).isContentEditable;
      if ((e.key === "Backspace" || e.keyCode === 8) && !isEditable) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  return null;
}
