// ─── components/StepIndicator.jsx ────────────────────────────────────────────
// 3-step progress indicator shown across the user flow
// ──────────────────────────────────────────────────────────────────────────────

export default function StepIndicator({ current }) {
  const steps = [
    { id: 1, label: 'Pay' },
    { id: 2, label: 'Submit' },
    { id: 3, label: 'Ticket' },
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                step.id < current
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                  : step.id === current
                  ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-110'
                  : 'bg-white/[0.03] text-white/20 border border-white/5'
              }`}
            >
              {step.id}
            </div>
            <span
              className={`mt-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                step.id === current ? 'text-white' : 'text-white/20'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-12 h-[1px] mx-4 mb-6 transition-all duration-700 ${
                step.id < current ? 'bg-white/40' : 'bg-white/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
