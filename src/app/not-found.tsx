import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-6 py-20">
      <h1 className="font-serif text-4xl">That project is not in the database.</h1>
      <Link href="/" className="mt-4 inline-block text-sm font-semibold text-accent">
        Back to brands
      </Link>
    </main>
  );
}
