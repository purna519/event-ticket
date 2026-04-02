import React from 'react';

export default function StepIndicator({ current }) {
  const steps = [
    { id: 1, label: 'Selection' },
    { id: 2, label: 'Settlement' },
    { id: 3, label: 'Verification' },
  ];

  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 flex items-center justify-center font-bebas text-[18px] transition-all duration-500 border ${
                step.id < current
                  ? 'bg-[#c9a84c] text-[#070503] border-[#c9a84c] shadow-[0_0_20px_rgba(201,168,76,0.3)]'
                  : step.id === current
                    ? 'bg-[#c9a84c] text-[#070503] border-[#c9a84c] scale-110 shadow-[0_0_30px_rgba(201,168,76,0.5)]'
                    : 'bg-white/[0.02] text-[#7a6e5c] border-white/10'
              }`}
            >
              {step.id}
            </div>
            <span
              className={`mt-4 text-[9px] font-bold uppercase tracking-[3px] transition-all duration-500 ${
                step.id === current ? 'text-[#c9a84c]' : 'text-[#7a6e5c]'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-16 h-[1px] mx-4 mb-8 transition-all duration-700 ${
                step.id < current ? 'bg-[#c9a84c]/50' : 'bg-white/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
