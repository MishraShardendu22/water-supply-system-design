import React from 'react';
import { RequestStatus } from '../../lib/types';

interface TimelineProps {
  currentStatus: RequestStatus;
  createdAt?: string;
  dispatchedAt?: string;
  completedAt?: string;
}

const STAGES: { key: RequestStatus; label: string }[] = [
  { key: 'PENDING', label: '1. Request Received' },
  { key: 'VERIFIED', label: '2. Priority Verified' },
  { key: 'ASSIGNED', label: '3. Resources Assigned' },
  { key: 'DISPATCHED', label: '4. Tanker Dispatched' },
  { key: 'COMPLETED', label: '5. OTP Verified Delivery' },
];

export const Timeline: React.FC<TimelineProps> = ({
  currentStatus,
  createdAt,
  dispatchedAt,
  completedAt,
}) => {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center text-red-800 font-semibold text-xs uppercase tracking-wider">
        Request Cancelled
      </div>
    );
  }

  const getStageIndex = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'VERIFIED':
        return 1;
      case 'ASSIGNED':
        return 2;
      case 'DISPATCHED':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#e2dab0] -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-[#2C5745] -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isDone
                    ? 'bg-[#2C5745] text-white shadow-md'
                    : 'bg-[#f4f1db] text-[#58512b] border-2 border-[#dcd499]'
                } ${isCurrent ? 'ring-4 ring-[#EB7D00]/40 scale-110' : ''}`}
              >
                {idx + 1}
              </div>
              <span
                className={`mt-2 text-xs font-semibold text-center max-w-[90px] ${
                  isCurrent ? 'text-[#EB7D00] font-bold' : isDone ? 'text-[#2E2910]' : 'text-[#857c4c]'
                }`}
              >
                {stage.label}
              </span>
              {stage.key === 'PENDING' && createdAt && (
                <span className="text-[10px] text-[#857c4c] mt-0.5">
                  {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {stage.key === 'DISPATCHED' && dispatchedAt && (
                <span className="text-[10px] text-[#857c4c] mt-0.5">
                  {new Date(dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {stage.key === 'COMPLETED' && completedAt && (
                <span className="text-[10px] text-[#857c4c] mt-0.5">
                  {new Date(completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
