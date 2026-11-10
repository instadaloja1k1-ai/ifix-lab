// @ts-nocheck

export function EmptyState({ icon: CompE, title: t, description: n, action: r }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-12 h-12 rounded-full bg-base-850 border border-base-800 flex items-center justify-center mb-4">
        <CompE className="w-6 h-6 text-base-500" />
      </div>
      <h3 className="text-sm font-medium text-base-200">{t}</h3>
      {n && <p className="text-sm text-base-500 mt-1 max-w-sm">{n}</p>}
      {r && <div className="mt-4">{r}</div>}
    </div>
  );
}
