import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center gap-6 py-24">
      <p className="text-xs uppercase tracking-[0.35em] text-accent">404</p>
      <h1 className="font-display text-5xl text-stone-900 md:text-6xl">This page has stepped away</h1>
      <p className="max-w-xl text-lg text-stone-700">
        The page you requested does not exist or may have moved to a new collection.
      </p>
      <Button href="/">Return Home</Button>
      <Link href="/collection" className="text-sm text-stone-600 hover:text-stone-900">
        Browse the collection
      </Link>
    </Container>
  );
}
