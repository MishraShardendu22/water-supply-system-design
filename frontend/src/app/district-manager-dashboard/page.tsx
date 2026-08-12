'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { DropOffLocation, RequestItem } from '../../lib/types';
import { locationsApi, requestsApi } from '../../lib/api';

export default function DistrictManagerDashboardPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [locations, setLocations] = useState<DropOffLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([requestsApi.getRequests(), locationsApi.getDropOffLocations()]).then(([reqRes, locRes]) => {
      if (reqRes.success && reqRes.data) setRequests(reqRes.data);
      if (locRes.success && locRes.data) setLocations(locRes.data);
      setLoading(false);
    });
  }, []);

  const pendingVerificationCount = requests.filter((r) => r.status === 'PENDING').length;
  const highPriorityCount = requests.filter((r) => r.priorityScore >= 70).length;
  const borewellLocationsCount = locations.filter((l) => l.hasPrivateBorewell).length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-[#2C5745] text-white p-5 rounded-xl border border-[#1e3d30]">
          <span className="text-xs uppercase tracking-wider text-[#EBE3A7] font-bold">
            District Manager & Local Representative Portal
          </span>
          <h2 className="text-xl font-bold mt-0.5">District Water Needs & Verification</h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Review neighborhood requests, verify private borewell availability, and monitor local tanker fulfillment.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Pending District Verification"
            value={loading ? '...' : pendingVerificationCount}
            subtitle="Requires priority calculation review"
            accentColor="#EB7D00"
            icon="📋"
          />
          <StatCard
            title="High Priority Requests"
            value={loading ? '...' : highPriorityCount}
            subtitle="Schools / Hospitals / Emergency"
            accentColor="#991b1b"
            icon="🚨"
          />
          <StatCard
            title="Private Borewell Locations"
            value={loading ? '...' : borewellLocationsCount}
            subtitle="Alternative source flagged (-30 Priority)"
            accentColor="#58512b"
            icon="🚰"
          />
        </div>

        {/* Requests in District Table */}
        <div className="card-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#e2dab0] pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2E2910]">
                District Water Supply Requests
              </h3>
              <p className="text-xs text-[#857c4c]">Local neighborhood queue & verification status</p>
            </div>
            <Link
              href="/requests"
              className="text-xs font-bold text-[#2C5745] hover:underline"
            >
              View Full Queue →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#857c4c]">Loading area requests...</div>
          ) : requests.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#857c4c]">No active requests in this district.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="table-header">
                    <th className="p-2.5">ID / Type</th>
                    <th className="p-2.5">Requester</th>
                    <th className="p-2.5">Drop-Off Destination</th>
                    <th className="p-2.5 text-center">Borewell Flag</th>
                    <th className="p-2.5 text-center">Priority</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebd4]">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-[#f7f4d9]/70 transition-colors">
                      <td className="p-2.5 font-mono font-bold text-[#2E2910]">#{r.id.slice(-6)}</td>
                      <td className="p-2.5">
                        <p className="font-bold text-[#2E2910]">{r.requester?.name}</p>
                        <p className="text-[10px] text-[#857c4c]">{r.requester?.contactNumber}</p>
                      </td>
                      <td className="p-2.5">
                        <p className="font-semibold text-[#2E2910]">
                          {r.dropOffLocation?.location?.address}
                        </p>
                        <p className="text-[10px] text-[#2C5745]">
                          📍 {r.dropOffLocation?.location?.landmark}
                        </p>
                      </td>
                      <td className="p-2.5 text-center">
                        {r.dropOffLocation?.hasPrivateBorewell ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold">
                            Borewell Yes (-30)
                          </span>
                        ) : (
                          <span className="text-gray-400 font-semibold">No Borewell</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-[#EB7D00]">
                        {r.priorityScore}
                      </td>
                      <td className="p-2.5">
                        <Badge variant={r.status.toLowerCase() as any}>{r.status}</Badge>
                      </td>
                      <td className="p-2.5 text-right">
                        <Link
                          href={`/requests/${r.id}`}
                          className="px-2.5 py-1 bg-[#2C5745] hover:bg-[#3d725c] text-white text-[11px] font-bold rounded transition-colors"
                        >
                          Review & Verify →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
