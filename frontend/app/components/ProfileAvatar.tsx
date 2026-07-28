"use client";

import { resolveProfileImageUrl } from "@/lib/profile-image";

const sizeClasses = {
  sm: "h-9 w-9 text-sm",
  md: "h-24 w-24 text-3xl",
} as const;

interface ProfileAvatarProps {
  src?: string | null;
  initials: string;
  size?: keyof typeof sizeClasses;
  className?: string;
  bgClassName?: string;
}

export default function ProfileAvatar({
  src,
  initials,
  size = "sm",
  className = "",
  bgClassName = "bg-violet-600 text-white",
}: ProfileAvatarProps) {
  const resolved = resolveProfileImageUrl(src);
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ${sizeClass} ${bgClassName} ${className}`}
    >
      {resolved ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolved} alt="Profile" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
