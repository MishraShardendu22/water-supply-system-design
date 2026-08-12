import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = '#2C5745',
}) => {
  return (
    <div className="card-surface p-5 flex items-start justify-between border-l-4" style={{ borderLeftColor: accentColor }}>
      <div>
        <p className="text-xs uppercase tracking-wider font-semibold text-[#58512b] mb-1">{title}</p>
        <h4 className="text-3xl font-bold text-[#2E2910]">{value}</h4>
        {subtitle && <p className="text-xs text-[#857c4c] mt-1">{subtitle}</p>}
      </div>
      {icon && <div className="p-2 rounded-lg bg-[#f4f1db] text-[#2C5745]">{icon}</div>}
    </div>
  );
};
