type ProgressBarProps = {
  value: number; // 0–1
};

export default function ProgressBar({ value }: ProgressBarProps) {
  const pct = Math.round(value * 100);
  const isComplete = pct >= 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
              : "bg-gradient-to-r from-indigo-600 to-indigo-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-muted w-10 text-right">
        {pct}%
      </span>
    </div>
  );
}
