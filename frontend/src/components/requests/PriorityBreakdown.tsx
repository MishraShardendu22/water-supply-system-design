import React from 'react';
import { DropOffLocation } from '../../lib/types';

interface PriorityBreakdownProps {
  score: number;
  dropOffLocation?: DropOffLocation;
  breakdown?: Record<string, number>;
  explanation?: string[];
}

export const PriorityBreakdown: React.FC<PriorityBreakdownProps> = ({
  score,
  dropOffLocation,
  breakdown,
  explanation,
}) => {
  const isHospital = dropOffLocation?.isSchoolOrHospital ?? false;
  const hasBorewell = dropOffLocation?.hasPrivateBorewell ?? false;
  const isTrafficHigh = dropOffLocation?.trafficRisk === 'High';

  const items = [
    { label: 'Base Priority Score', value: 50, color: 'text-gray-700' },
    {
      label: 'School / Hospital Priority Bonus',
      value: isHospital ? 30 : 0,
      color: isHospital ? 'text-emerald-700 font-medium' : 'text-gray-400',
    },
    {
      label: 'Private Borewell Availability Penalty',
      value: hasBorewell ? -30 : 0,
      color: hasBorewell ? 'text-red-600 font-medium' : 'text-gray-400',
    },
    {
      label: 'High Traffic Accessibility Risk Penalty',
      value: isTrafficHigh ? -5 : 0,
      color: isTrafficHigh ? 'text-amber-700 font-medium' : 'text-gray-400',
    },
  ];

  return (
    <div className="card-surface p-5 border border-[#e2dab0]">
      <div className="flex items-center justify-between pb-3 border-b border-[#e2dab0]">
        <div>
          <h4 className="text-sm uppercase tracking-wider font-semibold text-[#58512b]">
            Transparent Priority Score
          </h4>
          <p className="text-xs text-[#857c4c]">Algorithmic fairness calculation</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-[#EB7D00]">{score}</span>
          <span className="text-xs font-semibold text-[#857c4c] ml-1">/ 100</span>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-1 border-b border-dashed border-[#f2ebd4]">
            <span className="text-[#2E2910]">{item.label}</span>
            <span className={`font-mono font-bold ${item.color}`}>
              {item.value > 0 ? `+${item.value}` : item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t-2 border-[#2E2910] flex items-center justify-between font-bold text-sm text-[#2E2910]">
        <span>Calculated Total Priority Score</span>
        <span className="font-mono text-[#EB7D00] text-base">{score}</span>
      </div>

      {explanation && explanation.length > 0 && (
        <div className="mt-4 p-3 bg-[#f7f4d9] rounded-md text-xs text-[#58512b]">
          <p className="font-semibold text-[#2E2910] mb-1">Calculation Reasoning:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {explanation.map((exp, i) => (
              <li key={i}>{exp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
