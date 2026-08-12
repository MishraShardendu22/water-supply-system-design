'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { RequestItem } from '../../lib/types';
import { requestsApi } from '../../lib/api';

export default function DriverDashboardPage() {
  const [assignedRequests, setAssignedRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReq, setSelectedReq] = useState<RequestItem | null>(null);

  const [otpInput, setOtpInput] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDriverAssignedRequests = () => {
    setLoading(true);
    requestsApi.getRequests().then((res) => {
      if (res.success && res.data) {
        // Active assigned or dispatched requests
        const active = res.data.filter(
          (r) => r.status === 'ASSIGNED' || r.status === 'DISPATCHED' || r.status === 'COMPLETED'
        );
        setAssignedRequests(active);
        if (active.length > 0) setSelectedReq(active[0]);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDriverAssignedRequests();
  }, []);

  const handleCompleteWithOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !otpInput) return;

    setVerifying(true);
    setMsg(null);

    const res = await requestsApi.completeRequest(selectedReq.id, otpInput);
    setVerifying(false);

    if (res.success) {
      setMsg({ type: 'success', text: '✅ Delivery successfully verified and completed!' });
      setOtpInput('');
      fetchDriverAssignedRequests();
    } else {
      setMsg({ type: 'error', text: res.error?.message || 'Invalid OTP code entered' });
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-[#2C5745] text-white p-5 rounded-xl border border-[#1e3d30]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#EBE3A7] font-bold">
                Driver Operations Portal
              </span>
              <h2 className="text-xl font-bold mt-0.5">Tanker Driver Task Portal</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Task-focused route guidance, landmark navigation, and delivery proof verification.
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-[#EB7D00] text-white text-xs font-bold rounded-full">
                Basic & Smart Phone Friendly
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#857c4c]">Loading driver assignments...</div>
        ) : assignedRequests.length === 0 ? (
          <div className="card-surface p-8 text-center text-xs text-[#857c4c]">
            <p className="text-base font-bold text-[#2E2910] mb-1">No Active Delivery Assignments</p>
            <p>You currently have no active tanker deliveries assigned to you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Delivery Assignment List */}
            <div className="space-y-3 col-span-1">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#58512b]">
                Active Assignments ({assignedRequests.length})
              </h3>

              {assignedRequests.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReq(r)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedReq?.id === r.id
                      ? 'border-[#2C5745] bg-white ring-2 ring-[#2C5745] shadow-md'
                      : 'border-[#e2dab0] bg-[#f7f4d9]/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-[#2E2910]">#{r.id.slice(-6)}</span>
                    <Badge variant={r.status.toLowerCase() as any}>{r.status}</Badge>
                  </div>
                  <p className="font-bold text-sm text-[#2E2910] line-clamp-1">
                    {r.dropOffLocation?.location?.address}
                  </p>
                  <p className="text-xs text-[#2C5745] font-semibold mt-1">
                    📍 {r.dropOffLocation?.location?.landmark || 'See Landmark Guidance'}
                  </p>
                </div>
              ))}
            </div>

            {/* Assignment Details & Route Guidance */}
            {selectedReq && (
              <div className="col-span-1 md:col-span-2 space-y-4">
                <div className="card-surface p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e2dab0]">
                    <div>
                      <span className="text-xs text-[#857c4c] font-bold">Delivery Destination</span>
                      <h3 className="text-lg font-bold text-[#2E2910]">
                        {selectedReq.dropOffLocation?.location?.address}
                      </h3>
                    </div>
                    <Badge variant={selectedReq.status.toLowerCase() as any}>
                      {selectedReq.status}
                    </Badge>
                  </div>

                  {/* Route & Landmark Guidance Box */}
                  <div className="p-4 bg-[#f7f4d9] border border-[#dcd499] rounded-xl space-y-2">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-[#2E2910] flex items-center gap-1">
                      <span>🗺️</span> Driver Route & Landmark Guidance
                    </h4>
                    <p className="text-sm font-bold text-[#2C5745]">
                      Landmark: {selectedReq.dropOffLocation?.location?.landmark || 'Main Road Entry'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[#857c4c]">Traffic Risk:</span>{' '}
                        <span className="font-bold text-[#2E2910]">{selectedReq.dropOffLocation?.trafficRisk} Risk</span>
                      </div>
                      <div>
                        <span className="text-[#857c4c]">Est. Travel Time:</span>{' '}
                        <span className="font-bold text-[#2E2910]">{selectedReq.dropOffLocation?.normalTravelTime} mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipient Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[#857c4c] font-semibold">Recipient Contact:</span>
                      <p className="font-bold text-[#2E2910] text-sm mt-0.5">
                        {selectedReq.requester?.name}
                      </p>
                      <p className="text-[#58512b]">{selectedReq.requester?.contactNumber}</p>
                    </div>
                    <div>
                      <span className="text-[#857c4c] font-semibold">Assigned Filling Station:</span>
                      <p className="font-bold text-[#2C5745] text-sm mt-0.5">
                        {selectedReq.fillingStation?.name || 'Central Filling Hydrant'}
                      </p>
                    </div>
                  </div>

                  {/* OTP Verification Box */}
                  {selectedReq.status !== 'COMPLETED' ? (
                    <form onSubmit={handleCompleteWithOTP} className="pt-4 border-t border-[#e2dab0] space-y-3">
                      <label className="block text-xs font-bold text-[#2E2910] uppercase tracking-wider">
                        Enter Resident OTP Code to Confirm Delivery Completion
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.trim())}
                          placeholder="6-digit OTP code"
                          className="flex-1 px-4 py-2.5 rounded-lg border-2 border-[#2C5745] font-mono text-lg font-bold text-center tracking-widest outline-none"
                          required
                        />
                        <button
                          type="submit"
                          disabled={verifying || otpInput.length !== 6}
                          className="px-6 py-2.5 bg-[#2C5745] hover:bg-[#3d725c] text-white font-bold text-xs rounded-lg shadow transition-colors disabled:opacity-50"
                        >
                          {verifying ? 'Verifying...' : 'Submit OTP'}
                        </button>
                      </div>

                      {msg && (
                        <p
                          className={`text-xs font-bold ${
                            msg.type === 'success' ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {msg.text}
                        </p>
                      )}
                    </form>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold text-center">
                      ✓ Delivery Completed & Verified via OTP
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
