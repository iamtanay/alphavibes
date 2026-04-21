export default function LoadingState() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Persona row skeleton */}
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shrink-0 w-36 h-48 skeleton rounded-2xl" />
        ))}
      </div>

      {/* Card skeleton */}
      <div className="card space-y-4">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="card">
        <div className="skeleton h-4 w-40 rounded mb-4" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    </div>
  );
}
