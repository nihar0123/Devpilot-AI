import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-[#c9c4ff]">404</p>
      <h1 className="mt-4 text-5xl font-semibold">Page not found</h1>
      <p className="mt-4 max-w-xl text-slate-300">The page you were looking for doesn’t exist, moved, or never shipped. Let’s get you back to the product.</p>
      <Link href="/" className="mt-8 inline-flex rounded-2xl bg-[var(--purple)] px-6 py-3 text-sm font-semibold text-white">Return home</Link>
    </div>
  );
}

