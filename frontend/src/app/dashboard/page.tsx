'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Driver, FillingStation, RequestItem, Vehicle } from '../../lib/types';
import { driversApi, fillingStationsApi, requestsApi, vehiclesApi } from '../../lib/api';

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stations, setStations] = useState<FillingStation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = () => {
    Promise.all([
      requestsApi.getRequests(),
      driversApi.getDrivers(),
      vehiclesApi.getVehicles(),
      fillingStationsApi.getFillingStations(),
    ]).then(([reqRes, drvRes, vehRes, stRes]) => {
      if (reqRes.success && reqRes.data) setRequests(reqRes.data);
      if (drvRes.success && drvRes.data) setDrivers(drvRes.data);
      if (vehRes.success && vehRes.data) setVehicles(vehRes.data);
      if (stRes.success && stRes.data) setStations(stRes.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const pendingCount = requests.filter((r) => r.status === 'PENDING' || r.status === 'VERIFIED').length;
  const highPriorityCount = requests.filter((r) => r.priorityScore >= 70).length;
  const inProgressCount = requests.filter((r) => r.status === 'ASSIGNED' || r.status === 'DISPATCHED').length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  const availableDriversCount = drivers.filter((d) => d.status === 'Available').length;
  const availableVehiclesCount = vehicles.filter((v) => v.status === 'Available').length;
  const busyStationsCount = stations.filter((s) => s.availability !== 'AVAILABLE').length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-[#2C5745] text-white p-6 rounded-xl shadow border border-[#1e3d30] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#EBE3A7] font-bold">
                District Summer Shortage Ops
              </span>
              <span className="px-2 py-0.5 bg-[#EB7D00] text-white text-[10px] font-bold rounded-full">
                LIVE UPDATES ACTIVE
              </span>
            </div>
            <h2 className="text-2xl font-black mt-1">Water Supply Operations Control</h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              Real-time monitoring of tanker distribution, priority scoring, driver familiarity matching, and filling station congestion.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/requests"
              className="px-4 py-2.5 bg-[#EB7D00] hover:bg-[#c96b00] text-white font-bold text-xs rounded-lg shadow transition-colors"
            >
              + Create New Request
            </Link>
          </div>
        </div>

        {/* Operational Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pending Requests"
            value={loading ? '...' : pendingCount}
            subtitle="Awaiting dispatch assignment"
            accentColor="#EB7D00"
          />
          <StatCard
            title="High Priority"
            value={loading ? '...' : highPriorityCount}
            subtitle="Schools / Hospitals / Emergency"
            accentColor="#991b1b"
          />
          <StatCard
            title="In Progress"
            value={loading ? '...' : inProgressCount}
            subtitle="Assigned / Dispatched tankers"
            accentColor="#1e40af"
          />
          <StatCard
            title="Completed Today"
            value={loading ? '...' : completedCount}
            subtitle="OTP delivery verified"
            accentColor="#166534"
          />
        </div>

        {/* Resource Availability Quick Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Available Drivers"
            value={loading ? '...' : `${availableDriversCount} / ${drivers.length}`}
            subtitle="Locality familiar drivers ready"
            accentColor="#2C5745"
          />
          <StatCard
            title="Available Vehicles"
            value={loading ? '...' : `${availableVehiclesCount} / ${vehicles.length}`}
            subtitle="Municipal & Contracted tankers"
            accentColor="#2C5745"
          />
          <StatCard
            title="Busy Filling Stations"
            value={loading ? '...' : `${busyStationsCount} / ${stations.length}`}
            subtitle="Queue congestion monitoring"
            accentColor="#EB7D00"
          />
        </div>

        {/* Operational Visualizations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filling Station Congestion Tracker */}
          <div className="card-surface p-5 col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2E2910] mb-3">
              Filling Station Congestion Queue
            </h3>
            {loading ? (
              <div className="py-8 text-center text-xs text-[#857c4c]">Loading station data...</div>
            ) : stations.length === 0 ? (
              <div className="p-6 bg-[#f7f4d9] rounded-lg border border-dashed border-[#dcd499] text-center text-xs text-[#857c4c]">
                No filling stations registered in the system yet.
              </div>
            ) : (
              <div className="space-y-3">
                {stations.map((st) => (
                  <div key={st.id} className="p-3 bg-[#f7f4d9] rounded-lg border border-[#dcd499]">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-[#2E2910]">{st.name}</span>
                      <Badge
                        variant={
                          st.availability === 'AVAILABLE'
                            ? 'available'
                            : st.availability === 'BUSY'
                            ? 'busy'
                            : 'very_busy'
                        }
                      >
                        {st.availability.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#58512b] mb-1">
                      <span>Queued Trucks: {st.currentTruckCount}</span>
                      <span>Wait: ~{st.currentTruckCount * 10} mins</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          st.currentTruckCount <= 2
                            ? 'bg-emerald-600'
                            : st.currentTruckCount <= 5
                            ? 'bg-amber-500'
                            : 'bg-orange-600'
                        }`}
                        style={{ width: `${Math.min(100, (st.currentTruckCount / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Operational Request Queue Table */}
          <div className="card-surface p-5 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#2E2910]">
                    Active Request Queue
                  </h3>
                  <p className="text-xs text-[#857c4c]">Prioritized by urgency algorithm</p>
                </div>
                <Link
                  href="/requests"
                  className="text-xs font-bold text-[#2C5745] hover:underline"
                >
                  View All Requests →
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-[#857c4c]">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="p-8 border border-dashed border-[#e2dab0] rounded-lg text-center text-xs text-[#857c4c]">
                  <p className="font-bold text-[#2E2910] text-sm mb-1">No Active Requests</p>
                  <p>There are currently no water supply requests in the database.</p>
                  <Link
                    href="/requests"
                    className="inline-block mt-3 px-3 py-1.5 bg-[#2C5745] text-white font-bold text-xs rounded"
                  >
                    + Create First Request
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="table-header">
                        <th className="p-2.5">ID / Type</th>
                        <th className="p-2.5">Location</th>
                        <th className="p-2.5 text-center">Priority Score</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Driver / Vehicle</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2ebd4]">
                      {requests.slice(0, 5).map((req) => (
                        <tr key={req.id} className="hover:bg-[#f7f4d9]/60 transition-colors">
                          <td className="p-2.5 font-medium">
                            <span className="font-mono font-bold text-[#2E2910]">#{req.id.slice(-6)}</span>
                            <span className="block text-[10px] text-[#857c4c]">{req.requestType}</span>
                          </td>
                          <td className="p-2.5">
                            <p className="font-semibold text-[#2E2910] line-clamp-1">
                              {req.dropOffLocation?.location?.address || 'Location Details'}
                            </p>
                            {req.dropOffLocation?.isSchoolOrHospital && (
                              <span className="text-[10px] text-[#EB7D00] font-bold">[School/Hospital]</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`inline-block font-mono font-bold px-2 py-0.5 rounded ${
                                req.priorityScore >= 70
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {req.priorityScore}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <Badge variant={req.status.toLowerCase() as any}>{req.status}</Badge>
                          </td>
                          <td className="p-2.5 text-xs">
                            {req.driver ? (
                              <p className="font-semibold text-[#2E2910]">{req.driver.name}</p>
                            ) : (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right">
                            <Link
                              href={`/requests/${req.id}`}
                              className="px-2.5 py-1 bg-[#2C5745] hover:bg-[#3d725c] text-white text-[11px] font-bold rounded transition-colors"
                            >
                              Manage →
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
        </div>
      </div>
    </AppShell>
  );
}
