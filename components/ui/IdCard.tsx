interface IdCardProps {
  fullName: string;
  matricNumber: string | null;
  cohort?: string;
}

export default function IdCard({ fullName, matricNumber, cohort = "2026 Cohort" }: IdCardProps) {
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-xl2 bg-id-card p-6 text-white shadow-card-hover">
      {/* faint dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 bg-hero-grid"
        style={{ backgroundSize: "16px 16px" }}
      />
      {/* corner accent mark, stands in for a scan/verification point */}
      <div className="absolute right-5 top-5 h-9 w-9 rounded-lg border-2 border-teal/70">
        <div className="absolute inset-1 rounded-md bg-teal/20" />
      </div>

      <div className="relative">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-100/80">
          Ashirov Tech Know-How
        </p>
        <p className="mt-0.5 text-xs text-brand-100/60">{cohort} · Student Identification</p>

        <p className="mt-8 font-display text-xl font-semibold leading-tight">{fullName}</p>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-brand-100/60">
              Matric Number
            </p>
            <p className="font-mono text-2xl font-bold tracking-wider">
              {matricNumber ?? "—"}
            </p>
          </div>
          <div className="h-8 w-12 rounded bg-white/10 backdrop-blur-sm" />
        </div>
      </div>
    </div>
  );
}
