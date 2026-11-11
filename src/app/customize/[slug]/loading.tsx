import { Container } from "@/components/ui/Container";

export default function CustomizeLoading() {
  return (
    <Container className="py-10 lg:py-16">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-40 animate-pulse bg-stone-200" />
        <div className="h-10 w-72 max-w-full animate-pulse bg-stone-200" />
        <div className="h-4 w-full max-w-xl animate-pulse bg-stone-100" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="h-[28rem] animate-pulse bg-stone-100" />
        <div className="h-[min(72svh,560px)] animate-pulse rounded-[2rem] bg-stone-100 lg:h-[100vh]" />
      </div>
    </Container>
  );
}
