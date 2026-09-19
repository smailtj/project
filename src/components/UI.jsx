export function LoadingSpinner({ size = "md", label }) {
  const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8", xl: "w-12 h-12" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizeMap[size]} border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin`}
      />
      {label && <p className="text-sm text-slate-400 animate-pulse">{label}</p>}
    </div>
  );
}

export function PageContainer({ children }) {
  return <div className="p-4 lg:p-6 space-y-6 animate-fade-in">{children}</div>;
}

export function SectionCard({ title, subtitle, children, action }) {
  return (
    <div className="card p-5 animate-slide-up">
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <p className="text-sm">{message}</p>
    </div>
  );
}
