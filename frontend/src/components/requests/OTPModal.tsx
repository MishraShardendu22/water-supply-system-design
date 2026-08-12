import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { OTPResponse } from '../../lib/types';
import { requestsApi } from '../../lib/api';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  otpData?: OTPResponse | null;
  onCompleted: () => void;
}

export const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  requestId,
  otpData,
  onCompleted,
}) => {
  const [inputOTP, setInputOTP] = useState<string>(otpData?.otp || '');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputOTP || inputOTP.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP code');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const res = await requestsApi.completeRequest(requestId, inputOTP);
    setSubmitting(false);

    if (res.success) {
      onCompleted();
      onClose();
    } else {
      setErrorMsg(res.error?.message || 'Failed to verify OTP');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="OTP Proof of Delivery Verification">
      <div className="space-y-6">
        {/* OTP Display Card */}
        {otpData && (
          <div className="p-4 bg-[#f7f4d9] border border-[#dcd499] rounded-lg text-center">
            <p className="text-xs uppercase tracking-wider font-semibold text-[#58512b] mb-1">
              Generated Delivery OTP Code
            </p>
            <div className="text-4xl font-mono font-bold tracking-widest text-[#EB7D00] my-2">
              {otpData.otp}
            </div>
            <p className="text-xs text-[#857c4c]">
              Share this code with the resident/recipient upon delivery. Valid until:{' '}
              <span className="font-semibold text-[#2E2910]">
                {new Date(otpData.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>
        )}

        <form onSubmit={handleVerifyAndComplete} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2E2910] uppercase tracking-wider mb-2">
              Enter Received OTP Code to Mark Delivery Completed
            </label>
            <input
              type="text"
              maxLength={6}
              value={inputOTP}
              onChange={(e) => setInputOTP(e.target.value.trim())}
              placeholder="e.g. 654321"
              className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 rounded-lg border-2 border-[#2C5745] focus:ring-4 focus:ring-[#2C5745]/20 outline-none"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

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
              disabled={submitting || inputOTP.length !== 6}
              className="px-5 py-2.5 bg-[#2C5745] hover:bg-[#3d725c] text-white font-bold text-sm rounded-md shadow transition-colors disabled:opacity-50"
            >
              {submitting ? 'Verifying OTP...' : 'Verify OTP & Complete Delivery'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
