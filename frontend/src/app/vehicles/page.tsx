'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Vehicle, VehicleStatus, VehicleType } from '../../lib/types';
import { vehiclesApi } from '../../lib/api';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [vehType, setVehType] = useState<VehicleType>('Municipal');
  const [capacity, setCapacity] = useState<number>(10000);
  const [creating, setCreating] = useState<boolean>(false);

  const fetchVehicles = () => {
    setLoading(true);
    vehiclesApi.getVehicles().then((res) => {
      if (res.success && res.data) setVehicles(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (capacity <= 0) return;

    setCreating(true);
    const res = await vehiclesApi.createVehicle({ type: vehType, capacity });
    setCreating(false);

    if (res.success) {
      setIsModalOpen(false);
      fetchVehicles();
    }
  };

  const handleStatusChange = async (id: string, status: VehicleStatus) => {
    const res = await vehiclesApi.updateVehicleStatus(id, status);
    if (res.success) {
      fetchVehicles();
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#2E2910]">Water Tanker Fleet Management</h2>
            <p className="text-xs text-[#857c4c]">
              Municipal & Contracted water tankers, capacities, and active maintenance status
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#EB7D00] hover:bg-[#c96b00] text-white font-bold text-xs rounded-lg shadow transition-colors"
          >
            + Add Tanker Vehicle
          </button>
        </div>

        <div className="card-surface overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#857c4c]">Loading fleet vehicles...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="table-header">
                    <th className="p-3">Vehicle ID</th>
                    <th className="p-3">Ownership Type</th>
                    <th className="p-3 font-mono">Tanker Capacity</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Update Fleet Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebd4]">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-[#f7f4d9]/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#2E2910]">#{v.id.slice(-6)}</td>
                      <td className="p-3 font-bold text-[#2C5745]">{v.type} Tanker</td>
                      <td className="p-3 font-mono font-bold text-[#2E2910]">
                        {v.capacity.toLocaleString()} Liters
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            v.status === 'Available'
                              ? 'available'
                              : v.status === 'On Delivery'
                              ? 'dispatched'
                              : 'busy'
                          }
                        >
                          {v.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <select
                          value={v.status}
                          onChange={(e) => handleStatusChange(v.id, e.target.value as VehicleStatus)}
                          className="px-2 py-1 text-xs border rounded bg-white text-[#2E2910] font-semibold outline-none"
                        >
                          <option value="Available">Available</option>
                          <option value="On Delivery">On Delivery</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Tanker Vehicle">
          <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#2E2910] uppercase mb-1">Ownership Type</label>
              <select
                value={vehType}
                onChange={(e) => setVehType(e.target.value as VehicleType)}
                className="w-full px-3 py-2 border rounded text-xs outline-none"
              >
                <option value="Municipal">Municipal Owned</option>
                <option value="Contracted">Contracted Private Tanker</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#2E2910] uppercase mb-1">Water Capacity (Liters)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                step={500}
                className="w-full px-3 py-2 border rounded text-xs outline-none font-mono"
                required
              />
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
                {creating ? 'Saving...' : 'Add Vehicle'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
