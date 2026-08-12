import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { DriverRecommendation, FillingStation, Vehicle } from '../../lib/types';
import { driversApi, fillingStationsApi, vehiclesApi } from '../../lib/api';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  dropOffLocationId: string;
  onAssign: (driverId: string, vehicleId: string, fillingStationId: string) => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  onClose,
  dropOffLocationId,
  onAssign,
}) => {
  const [recommendations, setRecommendations] = useState<DriverRecommendation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stations, setStations] = useState<FillingStation[]>([]);

  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedStationId, setSelectedStationId] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && dropOffLocationId) {
      setLoading(true);
      Promise.all([
        driversApi.getRecommendedDrivers(dropOffLocationId),
        vehiclesApi.getAvailableVehicles(),
        fillingStationsApi.getRecommendedFillingStations(dropOffLocationId),
      ]).then(([driverRes, vehicleRes, stationRes]) => {
        if (driverRes.success && driverRes.data) {
          setRecommendations(driverRes.data);
          if (driverRes.data.length > 0) {
            setSelectedDriverId(driverRes.data[0].driver.id);
          }
        }
        if (vehicleRes.success && vehicleRes.data) {
          setVehicles(vehicleRes.data);
          if (vehicleRes.data.length > 0) {
            setSelectedVehicleId(vehicleRes.data[0].id);
          }
        }
        if (stationRes.success && stationRes.data) {
          setStations(stationRes.data);
          if (stationRes.data.length > 0) {
            setSelectedStationId(stationRes.data[0].id);
          }
        }
        setLoading(false);
      });
    }
  }, [isOpen, dropOffLocationId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId || !selectedVehicleId || !selectedStationId) return;

    setSubmitting(true);
    onAssign(selectedDriverId, selectedVehicleId, selectedStationId);
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Tanker Dispatch Resources">
      {loading ? (
        <div className="py-8 text-center text-[#58512b]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#2C5745] border-t-transparent rounded-full mb-2" />
          <p className="text-sm font-medium">Fetching recommended drivers & available stations...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Driver Recommendation Section */}
          <div>
            <label className="block text-xs font-bold text-[#2E2910] uppercase tracking-wider mb-2">
              1. Select Driver (Locality Familiarity Recommendation)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {recommendations.map((item, idx) => (
                <div
                  key={item.driver.id}
                  onClick={() => setSelectedDriverId(item.driver.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedDriverId === item.driver.id
                      ? 'border-[#2C5745] bg-[#2C5745]/10 ring-2 ring-[#2C5745]'
                      : 'border-[#e2dab0] bg-white hover:bg-[#f7f4d9]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="driver"
                      checked={selectedDriverId === item.driver.id}
                      onChange={() => setSelectedDriverId(item.driver.id)}
                      className="mt-1 accent-[#2C5745]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2E2910] text-sm">{item.driver.name}</span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-[#EB7D00] text-white px-2 py-0.5 rounded font-bold uppercase">
                            Top Match
                          </span>
                        )}
                        <span className="text-xs text-[#58512b]">({item.driver.phoneType} Phone)</span>
                      </div>
                      <p className="text-xs text-[#2C5745] font-semibold mt-0.5">
                        {item.recommendationReason}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#857c4c] mt-1">
                        <span>Total Deliveries: {item.driver.totalDeliveries}</span>
                        <span>•</span>
                        <span>Rating: ⭐ {item.driver.totalRating}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={item.driver.status === 'Available' ? 'available' : 'busy'}>
                    {item.driver.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Selection Section */}
          <div>
            <label className="block text-xs font-bold text-[#2E2910] uppercase tracking-wider mb-2">
              2. Select Available Water Tanker Vehicle
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedVehicleId === v.id
                      ? 'border-[#2C5745] bg-[#2C5745]/10 ring-2 ring-[#2C5745]'
                      : 'border-[#e2dab0] bg-white hover:bg-[#f7f4d9]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="vehicle"
                      checked={selectedVehicleId === v.id}
                      onChange={() => setSelectedVehicleId(v.id)}
                      className="accent-[#2C5745]"
                    />
                    <div>
                      <p className="font-bold text-[#2E2910] text-sm">
                        {v.type} Tanker #{v.id.slice(-4)}
                      </p>
                      <p className="text-xs text-[#58512b]">{v.capacity.toLocaleString()} Liters</p>
                    </div>
                  </div>
                  <Badge variant="available">Available</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Filling Station Recommendation Section */}
          <div>
            <label className="block text-xs font-bold text-[#2E2910] uppercase tracking-wider mb-2">
              3. Select Filling Station (Queue Congestion Status)
            </label>
            <div className="space-y-2">
              {stations.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStationId(st.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedStationId === st.id
                      ? 'border-[#2C5745] bg-[#2C5745]/10 ring-2 ring-[#2C5745]'
                      : 'border-[#e2dab0] bg-white hover:bg-[#f7f4d9]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="station"
                      checked={selectedStationId === st.id}
                      onChange={() => setSelectedStationId(st.id)}
                      className="accent-[#2C5745]"
                    />
                    <div>
                      <p className="font-bold text-[#2E2910] text-sm">{st.name}</p>
                      <p className="text-xs text-[#857c4c]">
                        Current Tanker Queue: {st.currentTruckCount} trucks waiting
                      </p>
                    </div>
                  </div>
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
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2dab0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[#58512b] hover:text-[#2E2910]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedDriverId || !selectedVehicleId || !selectedStationId}
              className="px-5 py-2.5 bg-[#2C5745] hover:bg-[#3d725c] text-white font-bold text-sm rounded-md shadow transition-colors disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
