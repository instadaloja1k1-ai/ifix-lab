// @ts-nocheck

export function PageHeader({ title: e, description: t, action: n }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 mb-6">
      <div>
        <h1 className="text-lg font-semibold text-base-100">{e}</h1>
        {t && <p className="text-sm text-base-400 mt-0.5">{t}</p>}
      </div>
      {n}
    </div>
  );
}
