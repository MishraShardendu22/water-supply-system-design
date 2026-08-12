"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { driversApi } from "../../lib/api";
import type { Driver, PhoneType } from "../../lib/types";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [phoneType, setPhoneType] = useState<PhoneType>("Basic");
  const [creating, setCreating] = useState<boolean>(false);

  const fetchDrivers = () => {
    setLoading(true);
    driversApi.getDrivers().then((res) => {
      if (res.success && res.data) setDrivers(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactNumber) return;

    setCreating(true);
    const res = await driversApi.createDriver({
      name,
      contactNumber,
      phoneType,
    });
    setCreating(false);

    if (res.success) {
      setIsModalOpen(false);
      setName("");
      setContactNumber("");
      fetchDrivers();
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#2E2910]">
              Tanker Driver Management
            </h2>
            <p className="text-xs text-[#857c4c]">
              Registered drivers, phone capabilities, ratings, and locality
              delivery experience
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#EB7D00] hover:bg-[#c96b00] text-white font-bold text-xs rounded-lg shadow transition-colors"
          >
            + Register New Driver
          </button>
        </div>

        <div className="card-surface overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#857c4c]">
              Loading drivers...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="table-header">
                    <th className="p-3">Driver Name</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Phone Type</th>
                    <th className="p-3 text-center">Rating</th>
                    <th className="p-3 text-center">Total Deliveries</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebd4]">
                  {drivers.map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-[#f7f4d9]/70 transition-colors"
                    >
                      <td className="p-3 font-bold text-[#2E2910]">{d.name}</td>
                      <td className="p-3 font-mono text-[#58512b]">
                        {d.contactNumber}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            d.phoneType === "Smart"
                              ? "bg-blue-100 text-blue-900"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {d.phoneType} Phone
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-[#2E2910]">
                        {d.totalRating} / 5.0
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#2C5745]">
                        {d.totalDeliveries}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            d.status === "Available" ? "available" : "busy"
                          }
                        >
                          {d.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Register Tanker Driver"
        >
          <form onSubmit={handleCreateDriver} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#2E2910] uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suresh Yadav"
                className="w-full px-3 py-2 border rounded text-xs outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#2E2910] uppercase mb-1">
                Contact Number
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. +919123456789"
                className="w-full px-3 py-2 border rounded text-xs outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#2E2910] uppercase mb-1">
                Device Phone Type
              </label>
              <select
                value={phoneType}
                onChange={(e) => setPhoneType(e.target.value as PhoneType)}
                className="w-full px-3 py-2 border rounded text-xs outline-none"
              >
                <option value="Basic">
                  Basic Feature Phone (Landmark Guided)
                </option>
                <option value="Smart">Smart Phone (App Navigation)</option>
              </select>
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
                {creating ? "Saving..." : "Register Driver"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
