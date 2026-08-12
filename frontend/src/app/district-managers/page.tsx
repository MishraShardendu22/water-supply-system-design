'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DistrictManager } from '../../lib/types';
import { districtManagersApi } from '../../lib/api';

export default function DistrictManagersPage() {
  const [managers, setManagers] = useState<DistrictManager[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    districtManagersApi.getDistrictManagers().then((res) => {
      if (res.success && res.data) setManagers(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#2E2910]">District Managers & Local Representatives</h2>
          <p className="text-xs text-[#857c4c]">
            Elected representatives and municipal officers managing ward-level water requests
          </p>
        </div>

        <div className="card-surface overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#857c4c]">Loading district managers...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="table-header">
                    <th className="p-3">Manager Name</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Linked Resident Person</th>
                    <th className="p-3">Assigned Location Ward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebd4]">
                  {managers.map((dm) => (
                    <tr key={dm.id} className="hover:bg-[#f7f4d9]/70 transition-colors">
                      <td className="p-3 font-bold text-[#2E2910]">{dm.name}</td>
                      <td className="p-3 font-mono text-[#58512b]">{dm.contactNumber}</td>
                      <td className="p-3 font-medium text-[#2E2910]">
                        {dm.normalPerson?.name || 'Resident Representative'}
                      </td>
                      <td className="p-3 text-[#2C5745] font-semibold">
                        📍 {dm.location?.address || 'District Area Ward'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
