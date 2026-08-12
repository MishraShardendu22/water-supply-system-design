"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { locationsApi } from "../../lib/api";
import type { DropOffLocation, TrafficRisk } from "../../lib/types";

export default function LocationsPage() {
  const [locations, setLocations] = useState<DropOffLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [latitude, setLatitude] = useState<number>(28.6139);
  const [longitude, setLongitude] = useState<number>(77.209);
  const [hasPrivateBorewell, setHasPrivateBorewell] = useState<boolean>(false);
  const [trafficRisk, setTrafficRisk] = useState<TrafficRisk>("Low");
  const [normalTravelTime, setNormalTravelTime] = useState<number>(15);
  const [isSchoolOrHospital, setIsSchoolOrHospital] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  const fetchLocations = () => {
    setLoading(true);
    locationsApi.getDropOffLocations().then((res) => {
      if (res.success && res.data) setLocations(res.data);
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
      landmark: landmark || undefined,
      hasPrivateBorewell,
      trafficRisk,
      normalTravelTime,
      isSchoolOrHospital,
    });
    setCreating(false);

    if (res.success) {
      setIsModalOpen(false);
      setAddress("");
      setLandmark("");
      fetchLocations();
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#2E2910]">
              Drop-Off Locations & Geographic Directory
            </h2>
            <p className="text-xs text-[#857c4c]">
              Operational coordinate map layout, landmark guidance, traffic
              risk, and borewell flags
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#EB7D00] hover:bg-[#c96b00] text-white font-bold text-xs rounded-lg shadow transition-colors"
          >
            + Register Drop-Off Location
          </button>
        </div>

        {/* Operational Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-surface p-5 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2E2910] border-b border-[#e2dab0] pb-2">
              Registered Locations Map & Route Attributes
            </h3>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#857c4c]">
                Loading locations...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="table-header">
                      <th className="p-3">Address</th>
                      <th className="p-3">Landmark Guidance</th>
                      <th className="p-3 text-center">Borewell</th>
                      <th className="p-3 text-center">School / Hospital</th>
                      <th className="p-3">Traffic Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2ebd4]">
                    {locations.map((loc) => (
                      <tr
                        key={loc.id}
                        className="hover:bg-[#f7f4d9]/70 transition-colors"
                      >
                        <td className="p-3">
                          <p className="font-bold text-[#2E2910]">
                            {loc.location?.address}
                          </p>
                          <p className="font-mono text-[10px] text-[#857c4c]">
                            Lat: {loc.location?.latitude}, Lng:{" "}
                            {loc.location?.longitude}
                          </p>
                        </td>
                        <td className="p-3 text-[#2C5745] font-semibold">
                          {loc.location?.landmark || "Standard Route Entry"}
                        </td>
                        <td className="p-3 text-center">
                          {loc.hasPrivateBorewell ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold">
                              Borewell Yes (-30)
                            </span>
                          ) : (
                            <span className="text-gray-400 font-semibold">
                              No Borewell
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {loc.isSchoolOrHospital ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[10px] font-bold">
                              [School/Hospital] (+30)
                            </span>
                          ) : (
                            <span className="text-gray-400 font-semibold">
                              Standard
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant={loc.trafficRisk.toLowerCase() as any}>
                            {loc.trafficRisk} Risk ({loc.normalTravelTime}m)
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Operational Map Layout Panel */}
          <div className="card-surface p-5 col-span-1 space-y-3 bg-[#2C5745] text-white">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#EBE3A7]">
              Geographic Map Coordinates
            </h3>
            <p className="text-xs text-emerald-100">
              Operational grid mapping for municipal driver route optimization
              and filling station proximity.
            </p>
            <div className="p-6 bg-[#1e3d30] rounded-xl border border-[#3d725c] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#EBE3A7]">
                <span>Total Locations:</span>
                <span className="font-bold text-white text-sm">
                  {locations.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#EBE3A7]">
                <span>High Priority Nodes:</span>
                <span className="font-bold text-white text-sm">
                  {locations.filter((l) => l.isSchoolOrHospital).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#EBE3A7]">
                <span>Borewell Nodes:</span>
                <span className="font-bold text-white text-sm">
                  {locations.filter((l) => l.hasPrivateBorewell).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Register Drop-Off Location"
        >
          <form onSubmit={handleCreateLocation} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#2E2910] uppercase mb-1">
                Destination Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Ward 4 Cluster 12"
                className="w-full px-3 py-2 border rounded text-xs outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#2E2910] uppercase mb-1">
                Landmark Guidance for Drivers
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Community Park Gate"
                className="w-full px-3 py-2 border rounded text-xs outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#2E2910] uppercase mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border rounded text-xs outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-[#2E2910] uppercase mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border rounded text-xs outline-none font-mono"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#2E2910] uppercase mb-1">
                  Traffic Risk Level
                </label>
                <select
                  value={trafficRisk}
                  onChange={(e) =>
                    setTrafficRisk(e.target.value as TrafficRisk)
                  }
                  className="w-full px-3 py-2 border rounded text-xs outline-none"
                >
                  <option value="Low">Low Risk Traffic</option>
                  <option value="Medium">Medium Risk Traffic</option>
                  <option value="High">High Risk Traffic</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#2E2910] uppercase mb-1">
                  Est. Travel Time (Mins)
                </label>
                <input
                  type="number"
                  value={normalTravelTime}
                  onChange={(e) =>
                    setNormalTravelTime(parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-xs outline-none"
                  required
                />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-[#e2dab0]">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#2E2910]">
                <input
                  type="checkbox"
                  checked={hasPrivateBorewell}
                  onChange={(e) => setHasPrivateBorewell(e.target.checked)}
                />
                Has Alternative Private Borewell (-30 Priority Penalty)
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#2E2910]">
                <input
                  type="checkbox"
                  checked={isSchoolOrHospital}
                  onChange={(e) => setIsSchoolOrHospital(e.target.checked)}
                />
                Is Public School or Hospital (+30 Priority Bonus)
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2dab0]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 bg-[#2C5745] text-white font-bold rounded shadow disabled:opacity-50"
              >
                {creating ? "Saving..." : "Register Location"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
