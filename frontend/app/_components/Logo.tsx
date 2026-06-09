import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <span className="text-sm font-medium uppercase tracking-[1.5px] text-on-dark">
        Unisphere
      </span>
    </Link>
  );
}
