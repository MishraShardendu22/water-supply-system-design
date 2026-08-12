'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DropOffLocation, NormalPerson, RequestItem, RequestStatus, RequestType } from '../../lib/types';
import { locationsApi, personsApi, requestsApi } from '../../lib/api';

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Create Request Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [locations, setLocations] = useState<DropOffLocation[]>([]);

  const [reqType, setReqType] = useState<RequestType>('Online');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [selectedLocId, setSelectedLocId] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  const fetchRequests = () => {
    setLoading(true);
    requestsApi.getRequests(filteredStatus === 'ALL' ? undefined : filteredStatus).then((res) => {
      if (res.success && res.data) {
        setRequests(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchRequests();
  }, [filteredStatus]);

  const openCreateModal = () => {
    setIsModalOpen(true);
    locationsApi.getDropOffLocations().then((locRes) => {
      if (locRes.success && locRes.data) {
        setLocations(locRes.data);
        if (locRes.data.length > 0) setSelectedLocId(locRes.data[0].id);
      }
    });
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    let personId = selectedPersonId;
    if (!personId) {
      const personRes = await personsApi.createPerson({
        name: 'Citizen Requester',
        contactNumber: '+919800011122',
      });
      if (personRes.success && personRes.data) {
        personId = personRes.data.id;
      }
    }

    if (!personId || !selectedLocId) {
      setCreating(false);
      return;
    }

    const res = await requestsApi.createRequest({
      requestType: reqType,
      requesterId: personId,
      dropOffLocationId: selectedLocId,
    });

    setCreating(false);
    if (res.success) {
      setIsModalOpen(false);
      fetchRequests();
    }
  };

  const displayedRequests = requests.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const reqName = r.requester?.name?.toLowerCase() || '';
    const locAddr = r.dropOffLocation?.location?.address?.toLowerCase() || '';
    const idStr = r.id.toLowerCase();
    return reqName.includes(query) || locAddr.includes(query) || idStr.includes(query);
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#2E2910]">Water Supply Requests Queue</h2>
            <p className="text-xs text-[#857c4c]">
              Manage and dispatch emergency & routine municipal water tanker delivery requests
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#EB7D00] hover:bg-[#c96b00] text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-2"
          >
            <span>+</span> Create Water Request
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="card-surface p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'PENDING', 'VERIFIED', 'ASSIGNED', 'DISPATCHED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilteredStatus(st)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                  filteredStatus === st
                    ? 'bg-[#2C5745] text-white shadow'
                    : 'bg-[#f4f1db] text-[#58512b] hover:bg-[#e2dab0]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search by ID, requester, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-[#e2dab0] text-xs focus:ring-2 focus:ring-[#2C5745] outline-none"
            />
          </div>
        </div>

        {/* Requests Data Table */}
        <div className="card-surface overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#857c4c]">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-[#2C5745] border-t-transparent rounded-full mb-2" />
              <p>Loading requests database...</p>
            </div>
          ) : displayedRequests.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#857c4c]">
              No water supply requests match the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="table-header">
                    <th className="p-3">Request ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Requester</th>
                    <th className="p-3">Drop-Off Destination</th>
                    <th className="p-3 text-center">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assigned Tanker</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebd4]">
                  {displayedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#f7f4d9]/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#2E2910]">#{req.id.slice(-6)}</td>
                      <td className="p-3 font-semibold text-[#58512b]">{req.requestType}</td>
                      <td className="p-3">
                        <p className="font-bold text-[#2E2910]">{req.requester?.name || 'Citizen'}</p>
                        <p className="text-[10px] text-[#857c4c]">{req.requester?.contactNumber}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-[#2E2910] max-w-xs truncate">
                          {req.dropOffLocation?.location?.address || 'Location Details'}
                        </p>
                        {req.dropOffLocation?.isSchoolOrHospital && (
                          <span className="text-[10px] text-[#EB7D00] font-bold">[School / Hospital]</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block font-mono font-bold px-2.5 py-1 rounded-full ${
                            req.priorityScore >= 70
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {req.priorityScore}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={req.status.toLowerCase() as any}>{req.status}</Badge>
                      </td>
                      <td className="p-3 text-xs">
                        {req.driver ? (
                          <div>
                            <p className="font-semibold text-[#2E2910]">{req.driver.name}</p>
                            <p className="text-[10px] text-[#857c4c]">{req.vehicle?.type} Tanker</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/requests/${req.id}`}
                          className="px-3 py-1.5 bg-[#2C5745] hover:bg-[#3d725c] text-white text-xs font-bold rounded shadow-sm transition-colors"
                        >
                          Open Lifecycle →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Request Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Water Supply Request">
          <form onSubmit={handleCreateRequest} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-[#2E2910] uppercase tracking-wider mb-2">
                Request Ingestion Channel
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Online', 'Call', 'Letter', 'Offline'] as RequestType[]).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setReqType(t)}
                    className={`py-2.5 rounded-lg border font-bold text-center transition-all ${
                      reqType === t
                        ? 'border-[#2C5745] bg-[#2C5745] text-white shadow-md'
                        : 'border-[#e2dab0] bg-[#f7f4d9] text-[#2E2910] hover:bg-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Location Selection Card Grid */}
            <div>
              <label className="block font-bold text-[#2E2910] uppercase tracking-wider mb-2">
                Select Drop-Off Destination Location
              </label>
              {locations.length === 0 ? (
                <div className="p-4 border border-dashed border-[#e2dab0] rounded-lg text-center text-xs text-[#857c4c]">
                  Loading registered locations...
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {locations.map((loc) => {
                    const isSelected = selectedLocId === loc.id;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => setSelectedLocId(loc.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#2C5745] bg-[#2C5745]/10 ring-2 ring-[#2C5745] shadow-sm'
                            : 'border-[#e2dab0] bg-[#f7f4d9]/50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="locationSelect"
                            checked={isSelected}
                            onChange={() => setSelectedLocId(loc.id)}
                            className="mt-1 accent-[#2C5745]"
                          />
                          <div>
                            <p className="font-bold text-[#2E2910] text-xs">
                              {loc.location?.address}
                            </p>
                            {loc.location?.landmark && (
                              <p className="text-[11px] text-[#2C5745] font-semibold mt-0.5">
                                Landmark: {loc.location.landmark}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {loc.isSchoolOrHospital && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                                  School / Hospital (+30)
                                </span>
                              )}
                              {loc.hasPrivateBorewell && (
                                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                                  Borewell (-30)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant={loc.trafficRisk.toLowerCase() as any}>
                          {loc.trafficRisk} Risk ({loc.normalTravelTime}m)
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2dab0]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-semibold text-[#58512b]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !selectedLocId}
                className="px-5 py-2.5 bg-[#EB7D00] hover:bg-[#c96b00] text-white font-bold text-xs rounded-lg shadow transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Submit Water Request'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
