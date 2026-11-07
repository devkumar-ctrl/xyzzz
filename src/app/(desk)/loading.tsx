export default function DeskLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-40 rounded-full bg-line/70" />
        <div className="h-10 w-72 rounded-full bg-line/60" />
        <div className="h-3 w-96 max-w-full rounded-full bg-line/50" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-3xl border border-line bg-paper/70"
          />
        ))}
      </div>

      <div className="h-80 rounded-3xl border border-line bg-paper/70" />
    </div>
  );
}
