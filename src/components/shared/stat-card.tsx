export function StatCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <article className="glass rounded-2xl p-5">
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted">{helper}</p>
    </article>
  );
}

