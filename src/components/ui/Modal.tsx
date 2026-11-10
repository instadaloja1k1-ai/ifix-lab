// @ts-nocheck
import { useEffect } from 'react';
import { XIcon } from 'lucide-react';

export const MODAL_WIDTHS = {
  md: `max-w-md`,
  lg: `max-w-lg`,
  xl: `max-w-xl`,
  '2xl': `max-w-2xl`,
};
export function Modal({ open: e, onClose: t, title: n, children: r, width: i = `lg` }) {
  return (
    useEffect(() => {
      function n(e) {
        e.key === `Escape` && t();
      }
      return (
        e && document.addEventListener(`keydown`, n),
        () => document.removeEventListener(`keydown`, n)
      );
    }, [e, t]),
    e ? (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60"
        onClick={t}
      >
        <div
          className={`w-full ${MODAL_WIDTHS[i]} max-h-[92vh] max-h-[92dvh] overflow-y-auto bg-base-900 border border-base-800 rounded-t-2xl sm:rounded-xl shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-base-800 sticky top-0 bg-base-900">
            <h2 className="text-sm font-semibold text-base-100">{n}</h2>
            <button
              onClick={t}
              className="w-7 h-7 rounded-md flex items-center justify-center text-base-500 hover:text-base-200 hover:bg-base-850"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5">{r}</div>
        </div>
      </div>
    ) : null
  );
}
