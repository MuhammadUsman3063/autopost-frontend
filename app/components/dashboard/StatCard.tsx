// components/dashboard/StatCard.tsx
import React from 'react';

// ISOLATED FUNCTION: Reusable Dashboard Stats Card
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  isWarning?: boolean; // Amber state ke liye
}

export default function StatCard({ title, value, subtitle, isWarning = false }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
        {/* Conditional styling: Agar warning hai toh Amber color (#E8912D) use hoga */}
        <p className={`text-sm ${isWarning ? 'text-[#E8912D] font-medium' : 'text-slate-500'}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}