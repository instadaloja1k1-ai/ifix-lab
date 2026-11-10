// @ts-nocheck
import { useState } from 'react';
import { TriangleAlertIcon, XIcon } from 'lucide-react';

export function ConfirmDialog({
  open: e,
  title: t,
  description: n,
  confirmLabel: r = `Confirmar`,
  danger: i = true,
  onConfirm: a,
  onClose: o,
}) {
  let [s, c] = useState(false),
    [l, u] = useState(null);
  if (!e) return null;
  async function d() {
    (c(true), u(null));
    try {
      await a();
    } catch (e) {
      (u(e instanceof Error ? e.message : `Ocorreu um erro ao confirmar a ação.`), c(false));
      return;
    }
    c(false);
  }
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
      onClick={o}
    >
      <div
        className="w-full max-w-sm bg-base-900 border border-base-800 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-base-800">
          <div className="flex items-center gap-2">
            <TriangleAlertIcon className={`w-4 h-4 ${i ? `text-danger` : `text-accent-400`}`} />
            <h2 className="text-sm font-semibold text-base-100">{t}</h2>
          </div>
          <button
            onClick={o}
            className="w-6 h-6 rounded-md flex items-center justify-center text-base-500 hover:text-base-200 hover:bg-base-850"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-base-300">{n}</p>
          {l && <p className="text-sm text-danger">{l}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={o}
              className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
            >
              Cancelar
            </button>
            <button
              onClick={d}
              disabled={s}
              className={`text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${i ? `bg-danger/90 text-base-100 hover:bg-danger` : `bg-accent-500 text-base-950 hover:bg-accent-400`}`}
            >
              {s ? `Processando…` : r}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
