'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Administration } from '../../lib/types';
import { adminsApi } from '../../lib/api';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Administration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    adminsApi.getAdmins().then((res) => {
      if (res.success && res.data) setAdmins(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#2E2910]">Municipal Administration Team</h2>
          <p className="text-xs text-[#857c4c]">
            Authorized municipal officers, dispatchers, and system administrators
          </p>
        </div>

        <div className="card-surface overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#857c4c]">Loading administration accounts...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="table-header">
                    <th className="p-3">Official Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Contact Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebd4]">
                  {admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-[#f7f4d9]/70 transition-colors">
                      <td className="p-3 font-bold text-[#2E2910]">{adm.name}</td>
                      <td className="p-3 font-mono text-[#58512b]">{adm.mail}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2C5745] text-white">
                          {adm.role}
                        </span>
                      </td>
                      <td className="p-3 text-[#58512b]">{adm.contactNumber || 'N/A'}</td>
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
