"use client";

import type { TaskDocument } from "@/types";
import Button from "@/components/ui/Button";

type DocumentListProps = {
  documents: TaskDocument[];
  uploadsBaseUrl: string;
  onDelete: (docId: string) => void;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimetype: string): boolean {
  return mimetype === "image/png" || mimetype === "image/jpeg";
}

export default function DocumentList({ documents, uploadsBaseUrl, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map((doc) => {
        const fileUrl = `${uploadsBaseUrl}/${doc.storedFilename}`;
        return (
          <div
            key={doc.id}
            className="group flex items-center gap-3 rounded-xl border border-border bg-surface-1 p-3 shadow-sm"
          >
            {isImage(doc.mimetype) ? (
              <img
                src={fileUrl}
                alt={doc.filename}
                className="h-10 w-10 rounded-lg object-cover ring-1 ring-border"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-sm font-medium text-muted ring-1 ring-border">
                PDF
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-foreground">{doc.filename}</p>
              <p className="text-xs text-muted-foreground">{formatSize(doc.size)}</p>
            </div>
            <a
              href={fileUrl}
              download={doc.filename}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline"
            >
              Download
            </a>
            <Button
              variant="ghost"
              className="!px-1.5 !py-0.5 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(doc.id)}
            >
              Del
            </Button>
          </div>
        );
      })}
    </div>
  );
}
