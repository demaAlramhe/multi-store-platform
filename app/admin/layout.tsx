export default function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl p-4">
          <p className="text-sm font-semibold text-slate-900">Super Admin Area</p>
        </div>
      </div>
      {children}
    </div>
  );
}
