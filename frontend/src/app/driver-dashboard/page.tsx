'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../lib/auth/AuthContext';
import { RequestItem } from '../../lib/types';
import { requestsApi } from '../../lib/api';

export default function DriverDashboardPage() {
  const { userName, userEmail } = useAuth();
  const [assignedRequests, setAssignedRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReq, setSelectedReq] = useState<RequestItem | null>(null);

  const [otpInput, setOtpInput] = useState<string>('');
  const [activeStoredOtp, setActiveStoredOtp] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDriverAssignedRequests = (showLoader = false) => {
    if (showLoader) setLoading(true);
    requestsApi.getRequests().then((res) => {
      if (res.success && res.data) {
        const active = res.data.filter((r) => {
          const isDriverStatus =
            r.status === 'ASSIGNED' || r.status === 'DISPATCHED' || r.status === 'COMPLETED';

          if (!userEmail) return isDriverStatus;

          const isMatch =
            r.driver?.contactNumber === userEmail ||
            r.driverId === userEmail ||
            r.driver?.name?.toLowerCase().includes(userName?.toLowerCase() || '') ||
            userName?.toLowerCase().includes(r.driver?.name?.toLowerCase() || '');

          return isMatch && isDriverStatus;
        });

        const finalAssignments = active.length > 0 ? active : res.data.filter(
          (r) => r.status === 'ASSIGNED' || r.status === 'DISPATCHED' || r.status === 'COMPLETED'
        );

        setAssignedRequests(finalAssignments);
        if (finalAssignments.length > 0 && !selectedReq) {
          setSelectedReq(finalAssignments[0]);
        }
      }
      setLoading(false);
    });
  };

  // Poll localStorage for OTP every 2 seconds (admin stores it from another tab)
  const checkLocalStorageForOTP = () => {
    if (typeof window === 'undefined') return;
    // Check all assigned requests for stored OTP
    assignedRequests.forEach((r) => {
      const stored = localStorage.getItem(`active_otp_${r.id}`);
      if (stored && selectedReq?.id === r.id && stored !== activeStoredOtp) {
        setActiveStoredOtp(stored);
      }
    });
    // Also check selected request specifically
    if (selectedReq) {
      const stored = localStorage.getItem(`active_otp_${selectedReq.id}`);
      if (stored && stored !== activeStoredOtp) {
        setActiveStoredOtp(stored);
      }
    }
  };

  useEffect(() => {
    fetchDriverAssignedRequests(true);

    const dataInterval = setInterval(() => {
      fetchDriverAssignedRequests(false);
    }, 3000);

    const otpInterval = setInterval(() => {
      checkLocalStorageForOTP();
    }, 2000);

    // Listen for cross-tab localStorage changes
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('active_otp_') && e.newValue) {
        if (selectedReq && e.key === `active_otp_${selectedReq.id}`) {
          setActiveStoredOtp(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      clearInterval(dataInterval);
      clearInterval(otpInterval);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [userEmail, userName]);

  // Also check on selectedReq change
  useEffect(() => {
    if (selectedReq && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`active_otp_${selectedReq.id}`);
      if (stored) setActiveStoredOtp(stored);
      else setActiveStoredOtp('');
    }
  }, [selectedReq]);

  const handleCompleteWithOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !otpInput) return;

    setVerifying(true);
    setMsg(null);

    const res = await requestsApi.completeRequest(selectedReq.id, otpInput);
    setVerifying(false);

    if (res.success) {
      setMsg({ type: 'success', text: 'Delivery successfully verified and completed!' });
      setOtpInput('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`active_otp_${selectedReq.id}`);
      }
      setActiveStoredOtp('');
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
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#EBE3A7] font-bold">
                  Driver Portal
                </span>
                <span className="px-2 py-0.5 bg-[#EB7D00] text-white text-[10px] font-bold rounded-full">
                  LIVE UPDATES ACTIVE
                </span>
              </div>
              <h2 className="text-xl font-bold mt-0.5">
                Tanker Driver Portal — {userName || 'Driver Ramesh Chand'}
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Task-focused route guidance, landmark navigation, and resident OTP verification.
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
            <p>You currently have no active tanker deliveries assigned to your driver account ({userName || 'Driver'}).</p>
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
                    {r.dropOffLocation?.location?.address || 'St. Marys Hospital Ward 9'}
                  </p>
                  <p className="text-xs text-[#2C5745] font-semibold mt-1">
                    Landmark: {r.dropOffLocation?.location?.landmark || 'Opposite Main Emergency Gate'}
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
                        {selectedReq.dropOffLocation?.location?.address || 'St. Marys Hospital Ward 9'}
                      </h3>
                    </div>
                    <Badge variant={selectedReq.status.toLowerCase() as any}>
                      {selectedReq.status}
                    </Badge>
                  </div>

                  {/* Route & Landmark Guidance Box */}
                  <div className="p-4 bg-[#f7f4d9] border border-[#dcd499] rounded-xl space-y-2">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-[#2E2910]">
                      Driver Route & Landmark Guidance
                    </h4>
                    <p className="text-sm font-bold text-[#2C5745]">
                      Landmark: {selectedReq.dropOffLocation?.location?.landmark || 'Opposite Main Emergency Gate'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[#857c4c]">Traffic Risk:</span>{' '}
                        <span className="font-bold text-[#2E2910]">{selectedReq.dropOffLocation?.trafficRisk || 'Medium'} Risk</span>
                      </div>
                      <div>
                        <span className="text-[#857c4c]">Est. Travel Time:</span>{' '}
                        <span className="font-bold text-[#2E2910]">{selectedReq.dropOffLocation?.normalTravelTime || 15} mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipient Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[#857c4c] font-semibold">Recipient Contact:</span>
                      <p className="font-bold text-[#2E2910] text-sm mt-0.5">
                        {selectedReq.requester?.name || 'Dr. Sunita Sharma'}
                      </p>
                      <p className="text-[#58512b]">{selectedReq.requester?.contactNumber || '+919876543210'}</p>
                    </div>
                    <div>
                      <span className="text-[#857c4c] font-semibold">Assigned Filling Station:</span>
                      <p className="font-bold text-[#2C5745] text-sm mt-0.5">
                        {selectedReq.fillingStation?.name || 'Northern Reservoir Station 2'}
                      </p>
                    </div>
                  </div>

                  {/* Simulated Resident SMS Alert Banner for Demo */}
                  {activeStoredOtp && selectedReq.status !== 'COMPLETED' && (
                    <div className="p-3.5 bg-[#f7f4d9] border border-[#2C5745] rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#2C5745]">
                          Resident Phone SMS Notification Received
                        </span>
                        <p className="text-xs font-bold text-[#2E2910] mt-0.5">
                          Dispatched Resident OTP: <span className="font-mono text-base text-[#EB7D00]">{activeStoredOtp}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpInput(activeStoredOtp)}
                        className="px-3 py-1.5 bg-[#2C5745] hover:bg-[#3d725c] text-white text-xs font-bold rounded shadow transition-colors"
                      >
                        Auto-Fill {activeStoredOtp}
                      </button>
                    </div>
                  )}

                  {/* OTP Verification Box */}
                  {selectedReq.status !== 'COMPLETED' ? (
                    <form onSubmit={handleCompleteWithOTP} className="pt-4 border-t border-[#e2dab0] space-y-3">
                      <label className="block text-xs font-bold text-[#2E2910] uppercase tracking-wider">
                        Ask resident for their 6-digit OTP code to complete delivery
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.trim())}
                          placeholder="Enter resident OTP"
                          className="flex-1 px-4 py-2.5 rounded-lg border-2 border-[#2C5745] font-mono text-lg font-bold text-center tracking-widest outline-none"
                          required
                        />
                        <button
                          type="submit"
                          disabled={verifying || otpInput.length !== 6}
                          className="px-6 py-2.5 bg-[#2C5745] hover:bg-[#3d725c] text-white font-bold text-xs rounded-lg shadow transition-colors disabled:opacity-50"
                        >
                          {verifying ? 'Verifying...' : 'Verify OTP'}
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
                      Delivery Completed & Verified via OTP
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
