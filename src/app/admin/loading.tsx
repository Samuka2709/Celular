import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div role="status" className="grid min-h-[50vh] place-items-center text-muted">
      <Loader2 className="size-6 animate-spin" aria-hidden />
      <span className="sr-only">Carregando</span>
    </div>
  );
}
