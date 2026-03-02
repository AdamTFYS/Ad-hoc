"use client";

import { useState } from "react";
import type { CreatePeriodPayload } from "@/types";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type CreatePeriodModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreatePeriodPayload) => void;
  semesterId: string;
};

export default function CreatePeriodModal({ open, onClose, onCreate, semesterId }: CreatePeriodModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    setError("");
    onCreate({ semesterId, name: trimmed });
    resetForm();
  }

  function resetForm() {
    setName("");
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className="mb-5 text-lg font-semibold text-foreground">New Period</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Period name"
          id="period-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Period 1"
          error={error}
          autoFocus
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    </Modal>
  );
}
