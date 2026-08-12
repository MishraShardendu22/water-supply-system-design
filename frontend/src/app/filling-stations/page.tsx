'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DropOffLocation, FillingStation } from '../../lib/types';
import { fillingStationsApi, locationsApi } from '../../lib/api';

export default function FillingStationsPage() {
  const [stations, setStations] = useState<FillingStation[]>([]);
  const [locations, setLocations] = useState<DropOffLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [selectedLocId, setSelectedLocId] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  const fetchStations = () => {
    setLoading(true);
    fillingStationsApi.getFillingStations().then((res) => {
      if (res.success && res.data) setStations(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const openCreateModal = () => {
    setIsModalOpen(true);
    locationsApi.getDropOffLocations().then((res) => {
      if (res.success && res.data) {
        setLocations(res.data);
        if (res.data.length > 0) setSelectedLocId(res.data[0].id);
      }
    });
  };

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedLocId) return;

    setCreating(true);
    const res = await fillingStationsApi.createFillingStation({ name, locationId: selectedLocId });
    setCreating(false);

    if (res.success) {
      setIsModalOpen(false);
      setName('');
      fetchStations();
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#2E2910]">Municipal Water Filling Stations</h2>
            <p className="text-xs text-[#857c4c]">
              Hydrant refill points, current truck congestion queues, and availability tracking
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#EB7D00] hover:bg-[#c96b00] text-white font-bold text-xs rounded-lg shadow transition-colors"
          >
            + Add Filling Station
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 py-12 text-center text-xs text-[#857c4c]">Loading stations...</div>
          ) : (
            stations.map((st) => (
              <div key={st.id} className="card-surface p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
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
                    <span className="text-[10px] font-mono text-[#857c4c]">#{st.id.slice(-6)}</span>
                  </div>

                  <h3 className="font-bold text-sm text-[#2E2910]">{st.name}</h3>
                  <p className="text-xs text-[#58512b] mt-1">
                    Area: {st.location?.address || 'Municipal Station Area'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#f2ebd4] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#857c4c]">Active Truck Queue:</span>
                    <span className="font-bold text-[#2E2910] font-mono">{st.currentTruckCount} Trucks</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#857c4c]">Estimated Queue Wait:</span>
                    <span className="font-bold text-[#EB7D00]">~{st.currentTruckCount * 10} mins</span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
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
              </div>
            ))
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Municipal Filling Station">
          <form onSubmit={handleCreateStation} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#2E2910] uppercase mb-1">Station Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Central Hydrant Station 4"
                className="w-full px-3 py-2 border rounded text-xs outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#2E2910] uppercase mb-1">Location Area</label>
              <select
                value={selectedLocId}
                onChange={(e) => setSelectedLocId(e.target.value)}
                className="w-full px-3 py-2 border rounded text-xs outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.location?.address}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2dab0]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold">
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 bg-[#2C5745] text-white font-bold rounded shadow disabled:opacity-50"
              >
                {creating ? 'Saving...' : 'Add Station'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
