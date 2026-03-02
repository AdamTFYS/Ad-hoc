"use client";

import { useState } from "react";
import type { CreateSemesterPayload } from "@/types";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type CreateSemesterModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateSemesterPayload) => void;
};

export default function CreateSemesterModal({ open, onClose, onCreate }: CreateSemesterModalProps) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("1");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    const yearNum = Number(year);
    if (!yearNum || yearNum <= 0) {
      setError("Year must be a positive number");
      return;
    }
    setError("");
    onCreate({ name: trimmed, year: yearNum });
    resetForm();
  }

  function resetForm() {
    setName("");
    setYear("1");
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className="mb-5 text-lg font-semibold text-foreground">New Semester</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Semester name"
          id="semester-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Semester 1"
          error={error}
          autoFocus
        />
        <Input
          label="Year"
          id="semester-year"
          type="number"
          min="1"
          step="1"
          value={year}
          onChange={(e) => setYear(e.target.value)}
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
