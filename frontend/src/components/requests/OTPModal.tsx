import type React from "react";
import { useState } from "react";
import { requestsApi } from "../../lib/api";
import type { OTPResponse } from "../../lib/types";
import { Modal } from "../ui/Modal";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  otpData: OTPResponse | null;
  onCompleted: () => void;
}

export const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  requestId,
  otpData,
  onCompleted,
}) => {
  const [inputCode, setInputCode] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode || inputCode.length !== 6) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await requestsApi.completeRequest(requestId, inputCode);
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg("Delivery verified and completed successfully.");
      onCompleted();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.error?.message || "Invalid or expired OTP code.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delivery Proof Verification (OTP)"
    >
      <div className="space-y-6 text-xs">
        {/* Generated OTP Display Box */}
        {otpData && (
          <div className="p-4 bg-[#f7f4d9] border border-[#dcd499] rounded-xl text-center space-y-2">
            <span className="text-[11px] font-bold text-[#857c4c] uppercase tracking-wider">
              Generated 6-Digit Delivery OTP
            </span>
            <div className="text-3xl font-mono font-black text-[#2C5745] tracking-widest py-1">
              {otpData.otp}
            </div>
            <p className="text-[11px] text-[#58512b]">
              Valid until: {new Date(otpData.expiresAt).toLocaleTimeString()}{" "}
              (15 mins)
            </p>
            <p className="text-[10px] text-[#857c4c] italic pt-1 border-t border-[#e2dab0]">
              In-app delivery verification token. Provide this code to the
              driver upon tanker arrival.
            </p>
          </div>
        )}

        {/* Verification Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2E2910] uppercase tracking-wider mb-1.5">
              Enter 6-Digit Resident OTP Code to Verify
            </label>
            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.trim())}
              placeholder="e.g. 849201"
              className="w-full px-4 py-3 rounded-lg border-2 border-[#2C5745] font-mono text-xl font-bold text-center text-[#2E2910] tracking-widest focus:ring-2 focus:ring-[#2C5745] outline-none"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md font-semibold">
              Error: {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md font-semibold">
              Success: {successMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2dab0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-[#58512b] hover:text-[#2E2910]"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={submitting || inputCode.length !== 6}
              className="px-5 py-2.5 bg-[#2C5745] hover:bg-[#3d725c] text-white font-bold text-xs rounded-md shadow transition-colors disabled:opacity-50"
            >
              {submitting ? "Verifying..." : "Verify OTP & Fulfill"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
