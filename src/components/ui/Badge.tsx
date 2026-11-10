// @ts-nocheck
import { clsx } from 'clsx';

export const BADGE_TONES = {
  default: `text-base-300 bg-base-800 border-base-700`,
  success: `text-success bg-success/10 border-success/20`,
  warning: `text-warning bg-warning/10 border-warning/20`,
  danger: `text-danger bg-danger/10 border-danger/20`,
  info: `text-info bg-info/10 border-info/20`,
  accent: `text-accent-400 bg-accent-500/10 border-accent-500/20`,
};
export function Badge({ children: e, tone: t = `default` }) {
  return (
    <span
      className={clsx(
        `inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap`,
        BADGE_TONES[t],
      )}
    >
      {e}
    </span>
  );
}
