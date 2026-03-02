"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";

type FileUploadProps = {
  onUpload: (file: File) => Promise<void>;
};

export default function FileUpload({ onUpload }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleChange}
        className="hidden"
      />
      <Button
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload file"}
      </Button>
    </div>
  );
}
