// @ts-nocheck
import { clsx } from 'clsx';

export const STAT_TONES = {
  default: `text-accent-400 bg-accent-500/10 border-accent-500/20`,
  success: `text-success bg-success/10 border-success/20`,
  warning: `text-warning bg-warning/10 border-warning/20`,
  danger: `text-danger bg-danger/10 border-danger/20`,
};
export function StatCard({ label: e, value: t, icon: CompN, tone: r = `default`, loading: i }) {
  return (
    <div className="bg-base-900 border border-base-800 rounded-xl p-4 flex items-center gap-3">
      <div
        className={clsx(
          `w-10 h-10 rounded-lg border flex items-center justify-center shrink-0`,
          STAT_TONES[r],
        )}
      >
        <CompN className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-base-400 truncate">{e}</p>
        <p className="text-lg font-semibold text-base-100">
          {i ? <span className="inline-block w-12 h-4 bg-base-800 rounded animate-pulse" /> : t}
        </p>
      </div>
    </div>
  );
}
