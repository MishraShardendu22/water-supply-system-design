'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DropOffLocation, TrafficRisk } from '../../lib/types';
import { locationsApi } from '../../lib/api';

export default function LocationsPage() {
  const [locations, setLocations] = useState<DropOffLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLoc, setSelectedLoc] = useState<DropOffLocation | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(28.6139);
  const [longitude, setLongitude] = useState<number>(77.209);
  const [landmark, setLandmark] = useState<string>('');
  const [hasPrivateBorewell, setHasPrivateBorewell] = useState<boolean>(false);
  const [trafficRisk, setTrafficRisk] = useState<TrafficRisk>('Low');
  const [normalTravelTime, setNormalTravelTime] = useState<number>(20);
  const [isSchoolOrHospital, setIsSchoolOrHospital] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  const fetchLocations = () => {
    setLoading(true);
    locationsApi.getDropOffLocations().then((res) => {
      if (res.success && res.data) {
        setLocations(res.data);
        if (res.data.length > 0) setSelectedLoc(res.data[0]);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setCreating(true);
    const res = await locationsApi.createDropOffLocation({
      address,
      latitude,
      longitude,
      landmark,
      hasPrivateBorewell,
      trafficRisk,
      normalTravelTime,
      isSchoolOrHospital,
    });
    setCreating(false);

    if (res.success) {
      setIsModalOpen(false);
      fetchLocations();
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#2E2910]">Geographic Drop-Off Locations</h2>
            <p className="text-xs text-[#857c4c]">
              Geographic coordinates, landmark routing guidance, borewell flags, and traffic risks
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#EB7D00] hover:bg-[#c96b00] text-white font-bold text-xs rounded-lg shadow transition-colors"
          >
            + Register Drop-Off Point
          </button>
        </div>

        {/* Operational Map & Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Location Cards Queue */}
          <div className="space-y-3 col-span-1 max-h-[75vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 text-center text-xs text-[#857c4c]">Loading drop-off points...</div>
            ) : (
              locations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLoc(loc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedLoc?.id === loc.id
                      ? 'border-[#2C5745] bg-white ring-2 ring-[#2C5745] shadow-md'
                      : 'border-[#e2dab0] bg-[#f7f4d9]/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#2E2910] line-clamp-1">
                      {loc.location?.address}
                    </span>
                    <Badge variant={loc.trafficRisk.toLowerCase() as any}>{loc.trafficRisk} Risk</Badge>
                  </div>
                  <p className="text-xs text-[#2C5745] font-semibold">
                    📍 {loc.location?.landmark || 'No landmark specified'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#857c4c] mt-2 pt-2 border-t border-[#f2ebd4]">
                    <span>{loc.isSchoolOrHospital ? '🏥 School / Hospital' : 'Residential'}</span>
                    <span>{loc.hasPrivateBorewell ? 'Borewell Yes' : 'No Borewell'}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Operational Map Visual Component */}
          {selectedLoc && (
            <div className="col-span-1 lg:col-span-2 space-y-4">
              {/* Simulated Map View Container */}
              <div className="card-surface p-5 space-y-3 relative overflow-hidden bg-[#e6dfb0]">
                <div className="flex items-center justify-between pb-2 border-b border-[#dcd499]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#58512b]">
                      Operational Dispatch Map Coordinate View
                    </span>
                    <h3 className="font-bold text-base text-[#2E2910]">{selectedLoc.location?.address}</h3>
                  </div>
                  <Badge variant={selectedLoc.trafficRisk.toLowerCase() as any}>
                    {selectedLoc.trafficRisk} Traffic Area
                  </Badge>
                </div>

                {/* Map Graphics Canvas */}
                <div className="relative w-full h-64 bg-[#d8d09e] rounded-lg border-2 border-[#2C5745]/30 flex flex-col items-center justify-center p-4 text-center shadow-inner overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#2C5745_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
                  
                  {/* Pinned Marker */}
                  <div className="relative z-10 animate-bounce">
                    <div className="w-10 h-10 rounded-full bg-[#EB7D00] text-white flex items-center justify-center text-xl font-bold shadow-xl border-2 border-white">
                      📍
                    </div>
                  </div>
                  <div className="relative z-10 mt-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-[#e2dab0] shadow text-xs">
                    <p className="font-bold text-[#2E2910]">{selectedLoc.location?.address}</p>
                    <p className="font-mono text-[10px] text-[#2C5745]">
                      Lat: {selectedLoc.location?.latitude}, Lng: {selectedLoc.location?.longitude}
                    </p>
                  </div>
                </div>

                {/* Geographic & Driver Guidance Attributes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
                  <div className="p-3 bg-white rounded-lg border border-[#e2dab0]">
                    <span className="text-[#857c4c] font-semibold block">Driver Guidance:</span>
                    <span className="font-bold text-[#2C5745]">{selectedLoc.location?.landmark || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#e2dab0]">
                    <span className="text-[#857c4c] font-semibold block">Est. Travel Time:</span>
                    <span className="font-bold text-[#2E2910]">{selectedLoc.normalTravelTime} mins</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#e2dab0]">
                    <span className="text-[#857c4c] font-semibold block">Private Borewell:</span>
                    <span className="font-bold text-[#2E2910]">
                      {selectedLoc.hasPrivateBorewell ? 'Yes (-30 Score)' : 'No'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#e2dab0]">
                    <span className="text-[#857c4c] font-semibold block">Priority Type:</span>
                    <span className="font-bold text-[#EB7D00]">
                      {selectedLoc.isSchoolOrHospital ? 'School/Hospital' : 'Standard Area'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Drop-Off Point">
          <form onSubmit={handleCreateLocation} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#2E2910] uppercase mb-1">Full Address / Neighborhood</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Ambedkar Nagar Sector 4, Cluster 12"
                className="w-full px-3 py-2 border rounded text-xs outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#2E2910] uppercase mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded text-xs font-mono outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#2E2910] uppercase mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded text-xs font-mono outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-[#2E2910] uppercase mb-1">Landmark / Driver Route Guidance</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Blue Overhead Water Tank"
                className="w-full px-3 py-2 border rounded text-xs outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#2E2910] uppercase mb-1">Traffic Risk Level</label>
                <select
                  value={trafficRisk}
                  onChange={(e) => setTrafficRisk(e.target.value as TrafficRisk)}
                  className="w-full px-3 py-2 border rounded text-xs outline-none"
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk (-5 Priority)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#2E2910] uppercase mb-1">Normal Travel Time (Mins)</label>
                <input
                  type="number"
                  value={normalTravelTime}
                  onChange={(e) => setNormalTravelTime(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded text-xs outline-none"
                />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPrivateBorewell}
                  onChange={(e) => setHasPrivateBorewell(e.target.checked)}
                  className="accent-[#2C5745]"
                />
                <span className="font-semibold text-[#2E2910]">Has Alternative Private Borewell (-30 Priority Penalty)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSchoolOrHospital}
                  onChange={(e) => setIsSchoolOrHospital(e.target.checked)}
                  className="accent-[#2C5745]"
                />
                <span className="font-semibold text-[#2E2910]">Is Public School or Hospital (+30 Priority Bonus)</span>
              </label>
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
                {creating ? 'Saving...' : 'Register Point'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
