"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";

const REASONS = [
  { value: "no-longer-needed", label: "I no longer need this app" },
  { value: "too-complicated", label: "It's too complicated to use" },
  { value: "found-alternative", label: "I found a better alternative" },
  { value: "privacy-concerns", label: "I have privacy concerns" },
  { value: "missing-features", label: "It's missing features I need" },
  { value: "other", label: "Other" },
] as const;

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ open, onClose }: DeleteAccountModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleClose = () => {
    setStep(1);
    setReason("");
    setDetails("");
    setError("");
    onClose();
  };

  const handleContinue = () => {
    if (!reason) {
      setError("Please select a reason");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await api.deleteAccount(reason, details || undefined);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/signup");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-surface-1 p-6 shadow-xl">
        {step === 1 ? (
          <>
            <h2 className="text-lg font-semibold text-foreground">
              We&apos;re sorry to see you go
            </h2>
            <p className="mt-2 text-sm text-muted">
              Please let us know why you&apos;re leaving so we can improve.
            </p>

            <div className="mt-4 space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 cursor-pointer transition-colors hover:bg-surface-2 has-[:checked]:border-accent has-[:checked]:bg-accent/5"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="accent-accent"
                  />
                  <span className="text-sm text-foreground">{r.label}</span>
                </label>
              ))}
            </div>

            {reason === "other" && (
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tell us more..."
                rows={3}
                className="mt-3 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
            )}

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-red-500">
              This action is permanent
            </h2>
            <p className="mt-2 text-sm text-muted">
              All your data will be permanently deleted, including your goals,
              tasks, study sessions, courses, and uploaded files. This cannot be
              undone.
            </p>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => { setStep(1); setError(""); }}
                disabled={loading}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Go back
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete my account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
