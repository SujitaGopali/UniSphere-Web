export default function AuthLoading() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="mb-2 h-8 w-40 rounded bg-surface-card" />
      <div className="mb-8 h-4 w-64 rounded bg-surface-card" />
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 rounded bg-surface-card" />
          <div className="h-12 rounded bg-surface-card" />
        </div>
        <div className="h-12 rounded bg-surface-card" />
        <div className="h-12 rounded bg-surface-card" />
        <div className="h-12 rounded bg-surface-card" />
        <div className="h-12 rounded bg-surface-card" />
        <div className="h-12 rounded bg-surface-card" />
        <div className="h-12 rounded bg-on-dark/40" />
      </div>
    </div>
  );
}
