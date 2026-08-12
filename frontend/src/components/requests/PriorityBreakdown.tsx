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
  const isSchoolHospital = dropOffLocation?.isSchoolOrHospital;
  const hasBorewell = dropOffLocation?.hasPrivateBorewell;
  const traffic = dropOffLocation?.trafficRisk || 'Low';

  const calcSchoolHospital = breakdown?.schoolHospitalBonus ?? breakdown?.school_hospital_bonus ?? (isSchoolHospital ? 30 : 0);
  const calcBorewell = breakdown?.privateBorewellPenalty ?? breakdown?.private_borewell_penalty ?? (hasBorewell ? -30 : 0);
  const calcTraffic =
    breakdown?.trafficAdjustment ?? breakdown?.traffic_adjustment ?? (traffic === 'High' ? 20 : traffic === 'Medium' ? 10 : 0);

  const baseScore = 50;

  return (
    <div className="card-surface p-5 space-y-4 border border-[#e2dab0]">
      <div className="flex items-center justify-between border-b border-[#e2dab0] pb-3">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-bold text-[#58512b]">
            Priority Scoring Math
          </h3>
          <p className="text-xs font-bold text-[#2E2910]">Algorithmic Allocation Score</p>
        </div>
        <div className="text-right">
          <span
            className={`text-2xl font-black font-mono px-3 py-1 rounded-lg inline-block ${
              score >= 70
                ? 'bg-red-100 text-red-900 border border-red-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {score}
          </span>
        </div>
      </div>

      {/* Itemized Calculation Breakdown */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-2 bg-[#f7f4d9] rounded border border-[#dcd499]">
          <span className="font-semibold text-[#2E2910]">Base Urgency Score</span>
          <span className="font-mono font-bold text-[#2C5745]">+{baseScore}</span>
        </div>

        <div
          className={`flex items-center justify-between p-2 rounded border ${
            calcSchoolHospital > 0
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-[#f7f4d9]/50 border-[#e2dab0] text-[#857c4c]'
          }`}
        >
          <div>
            <span className="font-bold block">School / Hospital Emergency</span>
            <span className="text-[10px]">
              {isSchoolHospital ? 'Public facility priority bonus applied' : 'Standard residential'}
            </span>
          </div>
          <span className="font-mono font-bold text-emerald-700">+{calcSchoolHospital}</span>
        </div>

        <div
          className={`flex items-center justify-between p-2 rounded border ${
            calcBorewell < 0
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-[#f7f4d9]/50 border-[#e2dab0] text-[#857c4c]'
          }`}
        >
          <div>
            <span className="font-bold block">Private Borewell Status</span>
            <span className="text-[10px]">
              {hasBorewell ? 'Alternative local water source available' : 'No alternative borewell'}
            </span>
          </div>
          <span
            className={`font-mono font-bold ${
              calcBorewell < 0 ? 'text-amber-800' : 'text-[#857c4c]'
            }`}
          >
            {calcBorewell}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 bg-[#f7f4d9] rounded border border-[#dcd499]">
          <div>
            <span className="font-bold text-[#2E2910] block">Traffic Risk Factor</span>
            <span className="text-[10px] text-[#58512b]">Route level: {traffic} Traffic</span>
          </div>
          <span className="font-mono font-bold text-[#2C5745]">+{calcTraffic}</span>
        </div>
      </div>

      {/* Plain Language Math Formula Explanation */}
      {explanation && explanation.length > 0 && (
        <div className="pt-3 border-t border-[#e2dab0]">
          <h4 className="text-[11px] font-bold text-[#2E2910] uppercase mb-1">
            Algorithm Step-by-Step Logic
          </h4>
          <ul className="space-y-1 text-[11px] text-[#58512b] list-disc list-inside">
            {explanation.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
