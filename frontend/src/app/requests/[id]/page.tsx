'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { Badge } from '../../../components/ui/Badge';
import { Timeline } from '../../../components/requests/Timeline';
import { PriorityBreakdown } from '../../../components/requests/PriorityBreakdown';
import { AssignModal } from '../../../components/requests/AssignModal';
import { PriorityCalculationResult, RequestItem } from '../../../lib/types';
import { requestsApi } from '../../../lib/api';

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;
  const router = useRouter();

  const [req, setReq] = useState<RequestItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [priorityResult, setPriorityResult] = useState<PriorityCalculationResult | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [otpSentNotice, setOtpSentNotice] = useState<boolean>(false);

  const loadRequest = (showLoader = false) => {
    if (showLoader) setLoading(true);
    requestsApi.getRequestByID(requestId).then((res) => {
      if (res.success && res.data) {
        setReq(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadRequest(true);

    const interval = setInterval(() => {
      loadRequest(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [requestId]);

  const handleCalculatePriority = async () => {
    setActionLoading(true);
    const res = await requestsApi.calculatePriority(requestId);
    setActionLoading(false);
    if (res.success && res.data) {
      setPriorityResult(res.data);
      loadRequest();
    }
  };

  const handleAssignResources = async (driverId: string, vehicleId: string, fillingStationId: string) => {
    setActionLoading(true);
    const res = await requestsApi.assignRequest(requestId, { driverId, vehicleId, fillingStationId });
    setActionLoading(false);
    if (res.success) {
      loadRequest();
    }
  };

  const handleDispatch = async () => {
    setActionLoading(true);
    const res = await requestsApi.dispatchRequest(requestId);
    setActionLoading(false);
    if (res.success) {
      loadRequest();
    }
  };

  const handleGenerateOTP = async () => {
    setActionLoading(true);
    const res = await requestsApi.generateOTP(requestId);
    setActionLoading(false);
    if (res.success && res.data) {
      const code = res.data.otp;
      if (typeof window !== 'undefined') {
        localStorage.setItem(`active_otp_${requestId}`, code);
      }
      setOtpSentNotice(true);
      loadRequest();
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this water request?')) return;
    setActionLoading(true);
    const res = await requestsApi.cancelRequest(requestId);
    setActionLoading(false);
    if (res.success) {
      loadRequest();
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-20 text-center text-xs text-[#857c4c]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#2C5745] border-t-transparent rounded-full mb-3" />
          <p>Loading request details...</p>
        </div>
      </AppShell>
    );
  }

  if (!req) {
    return (
      <AppShell>
        <div className="py-16 text-center space-y-4">
          <p className="text-base font-bold text-red-800">Request Not Found</p>
          <Link href="/requests" className="text-xs text-[#2C5745] underline font-semibold">
            ← Back to Requests Queue
          </Link>
        </div>
      </AppShell>
    );
  }

  const dropOff = req.dropOffLocation;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            href="/requests"
            className="text-xs font-bold text-[#2C5745] hover:underline flex items-center gap-1"
          >
            ← Back to Requests Queue
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#EB7D00] text-white text-[10px] font-bold rounded-full">
              LIVE UPDATES ACTIVE
            </span>
            <span className="text-xs font-mono font-bold text-[#857c4c]">Request ID: {req.id}</span>
          </div>
        </div>

        {/* 5-stage Lifecycle Timeline Component */}
        <div className="card-surface p-6">
          <h3 className="text-xs uppercase tracking-wider font-bold text-[#58512b] mb-2">
            Request Dispatch Lifecycle Progression
          </h3>
          <Timeline
            currentStatus={req.status}
            createdAt={req.createdAt}
            dispatchedAt={req.dispatchedAt}
            completedAt={req.completedAt}
          />
        </div>

        {/* Primary Operational Action Bar */}
        <div className="card-surface p-4 bg-[#f7f4d9] border border-[#dcd499] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2E2910]">Current Status:</span>
            <Badge variant={req.status.toLowerCase() as any}>{req.status}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {req.status === 'PENDING' && (
              <button
                onClick={handleCalculatePriority}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#2C5745] hover:bg-[#3d725c] text-white text-xs font-bold rounded shadow transition-colors"
              >
                Calculate Priority & Verify
              </button>
            )}

            {(req.status === 'PENDING' || req.status === 'VERIFIED') && (
              <button
                onClick={() => setIsAssignOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#2C5745] hover:bg-[#3d725c] text-white text-xs font-bold rounded shadow transition-colors"
              >
                Assign Driver & Tanker
              </button>
            )}

            {req.status === 'ASSIGNED' && (
              <button
                onClick={handleDispatch}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#EB7D00] hover:bg-[#c96b00] text-white text-xs font-bold rounded shadow transition-colors"
              >
                Dispatch Tanker Now
              </button>
            )}

            {req.status === 'DISPATCHED' && (
              <button
                onClick={handleGenerateOTP}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#EB7D00] hover:bg-[#c96b00] text-white text-xs font-bold rounded shadow transition-colors"
              >
                Send Delivery OTP to Resident
              </button>
            )}

            {req.status !== 'COMPLETED' && req.status !== 'CANCELLED' && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded transition-colors"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>

        {/* OTP Dispatched Notice (Manager/Admin View: NO plain-text OTP code displayed) */}
        {(otpSentNotice || req.otpExpiresAt) && req.status === 'DISPATCHED' && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs space-y-1 shadow-sm">
            <div className="font-bold text-emerald-900">
              Delivery OTP Dispatched to Resident ({req.requester?.contactNumber || 'Resident Phone'})
            </div>
            <p className="text-[#58512b]">
              The 6-digit OTP code has been generated and sent to the resident's registered phone number. Tanker driver will collect and verify this code upon delivery.
            </p>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Priority Math Breakdown Card */}
          <div className="col-span-1">
            <PriorityBreakdown
              score={priorityResult?.priorityScore ?? req.priorityScore}
              dropOffLocation={req.dropOffLocation}
              breakdown={priorityResult?.breakdown}
              explanation={priorityResult?.explanation}
            />
          </div>

          {/* Location & Requester Details */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="card-surface p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2E2910] border-b border-[#e2dab0] pb-2">
                Drop-Off Destination & Community Attributes
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#857c4c] font-semibold block">Destination Address:</span>
                  <p className="font-bold text-[#2E2910] text-sm mt-0.5">
                    {dropOff?.location?.address || 'N/A'}
                  </p>
                </div>

                <div>
                  <span className="text-[#857c4c] font-semibold block">Landmark / Driver Guidance:</span>
                  <p className="font-semibold text-[#2C5745] mt-0.5">
                    Landmark: {dropOff?.location?.landmark || 'No specific landmark given'}
                  </p>
                </div>

                <div>
                  <span className="text-[#857c4c] font-semibold block">Geographic Coordinates:</span>
                  <p className="font-mono text-[#2E2910] font-medium mt-0.5">
                    Lat: {dropOff?.location?.latitude}, Lng: {dropOff?.location?.longitude}
                  </p>
                </div>

                <div>
                  <span className="text-[#857c4c] font-semibold block">Traffic Risk & Travel Time:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={dropOff?.trafficRisk?.toLowerCase() as any}>
                      Traffic: {dropOff?.trafficRisk} Risk
                    </Badge>
                    <span className="text-[#2E2910] font-bold">~{dropOff?.normalTravelTime} mins travel</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#857c4c] font-semibold block">Private Borewell Status:</span>
                  {dropOff?.hasPrivateBorewell ? (
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold">
                      Has Alternative Private Borewell (-30 Priority)
                    </span>
                  ) : (
                    <span className="inline-block mt-0.5 text-emerald-800 font-bold">
                      No Private Borewell Available
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[#857c4c] font-semibold block">Public Priority Category:</span>
                  {dropOff?.isSchoolOrHospital ? (
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded font-bold">
                      Public School / Hospital (+30 Priority)
                    </span>
                  ) : (
                    <span className="inline-block mt-0.5 text-[#58512b] font-medium">
                      Standard Residential Area
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Requester & Assigned Resources Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-surface p-5">
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#58512b] mb-2">
                  Requester Information
                </h4>
                <p className="font-bold text-[#2E2910] text-sm">{req.requester?.name}</p>
                <p className="text-xs text-[#58512b] mt-0.5">Contact: {req.requester?.contactNumber}</p>
                <p className="text-xs text-[#857c4c] mt-0.5">Address: {req.requester?.address || 'N/A'}</p>
                <span className="inline-block mt-2 text-[10px] bg-[#f4f1db] px-2 py-0.5 rounded font-bold text-[#2C5745]">
                  Channel: {req.requestType} Request
                </span>
              </div>

              <div className="card-surface p-5">
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#58512b] mb-2">
                  Assigned Dispatch Resources
                </h4>
                {req.driver ? (
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-[#2E2910]">Driver: {req.driver.name}</p>
                    <p className="text-[#58512b]">Phone: {req.driver.contactNumber} ({req.driver.phoneType})</p>
                    <p className="text-[#58512b]">Vehicle: {req.vehicle?.type} Tanker ({req.vehicle?.capacity.toLocaleString()}L)</p>
                    <p className="text-[#2C5745] font-semibold">Filling Station: {req.fillingStation?.name}</p>
                  </div>
                ) : (
                  <div className="text-xs text-[#857c4c] italic py-2">
                    No driver, vehicle, or filling station assigned yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resource Assignment Modal */}
        <AssignModal
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          dropOffLocationId={req.dropOffLocationId}
          onAssign={handleAssignResources}
        />
      </div>
    </AppShell>
  );
}
