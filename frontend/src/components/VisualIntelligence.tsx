
import { useRef, useState } from "react";
import type { DragEvent, KeyboardEvent, ReactNode } from "react";
import {
  Upload,
  Image as ImageIcon,
  ScanFace,
  Car,
  Box,
  FileSearch,
  ShieldCheck,
  Fingerprint,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Clock,
  Trash2,
} from "lucide-react";

import "../pages/visual/VisualIntelligence.css";

type EvidenceFile = {
  file: File;
  preview: string;
  width: number;
  height: number;
  hash: string;
};

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export default function VisualIntelligence() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [evidence, setEvidence] = useState<EvidenceFile | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function processFile(file?: File) {
    if (!file) return;

    setError("");
    setCopied(false);

    if (!file.type.startsWith("image/")) {
      setError("Invalid file. Please upload an image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image exceeds the maximum permitted size of 15 MB.");
      return;
    }

    setLoading(true);

    let preview = "";

    try {
      preview = URL.createObjectURL(file);

      const image = new Image();
      image.src = preview;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Unable to read image."));
      });

      const buffer = await file.arrayBuffer();

      const digest = await crypto.subtle.digest("SHA-256", buffer);

      const hash = Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      const nextEvidence: EvidenceFile = {
        file,
        preview,
        width: image.naturalWidth,
        height: image.naturalHeight,
        hash,
      };

      setEvidence((previous) => {
        if (previous) URL.revokeObjectURL(previous.preview);
        return nextEvidence;
      });

      preview = "";
    } catch {
      setError("Unable to inspect this image. Please try another file.");
    } finally {
      if (preview) URL.revokeObjectURL(preview);
      setLoading(false);
    }
  }

  function clearEvidence() {
    setEvidence((previous) => {
      if (previous) URL.revokeObjectURL(previous.preview);
      return null;
    });

    setError("");
    setCopied(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void processFile(event.dataTransfer.files[0]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  async function copyHash() {
    if (!evidence) return;

    try {
      await navigator.clipboard.writeText(evidence.hash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Unable to copy fingerprint. Please copy it manually.");
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <main className="vi-page">
      <header className="vi-header">
        <div>
          <div className="vi-eyebrow">BOB / INTELLIGENCE LAB</div>

          <h1>Visual Intelligence</h1>

          <p>
            Inspect visual evidence and prepare it for investigation.
          </p>
        </div>

        <div className="vi-status">
          <span />
          LOCAL ANALYSIS
        </div>
      </header>

      <section className="vi-workspace">
        <div className="vi-main">
          <div className="vi-section-heading">
            <div>
              <span className="vi-label">01 / EVIDENCE INPUT</span>
              <h2>Image workspace</h2>
            </div>

            {evidence && (
              <button
                type="button"
                className="vi-ghost-button"
                onClick={clearEvidence}
              >
                <Trash2 size={15} />
                Remove image
              </button>
            )}
          </div>

          {!evidence ? (
            <div
              className={`vi-dropzone ${dragging ? "is-dragging" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              onKeyDown={handleKeyDown}
              role="button"
              tabIndex={0}
              aria-label="Upload an image"
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                hidden
                onChange={(event) => {
                  void processFile(event.target.files?.[0]);
                }}
              />

              <div className="vi-upload-icon">
                {loading ? (
                  <Loader2 className="vi-spin" />
                ) : (
                  <Upload />
                )}
              </div>

              <h3>
                {loading ? "Inspecting evidence..." : "Drop an image here"}
              </h3>

              <p>Or click to browse your device</p>

              <span className="vi-file-types">
                JPG · PNG · WEBP · AVIF / MAX 15 MB
              </span>
            </div>
          ) : (
            <div className="vi-preview-card">
              <div className="vi-preview-toolbar">
                <span>
                  <ImageIcon size={15} />
                  EVIDENCE PREVIEW
                </span>

                <span className="vi-verified">
                  <CheckCircle2 size={14} />
                  HASH GENERATED
                </span>
              </div>

              <div className="vi-image-container">
                <img
                  src={evidence.preview}
                  alt="Uploaded investigation evidence"
                />
              </div>

              <div className="vi-file-details">
                <div>
                  <FileImage size={17} />
                  <span title={evidence.file.name}>
                    {evidence.file.name}
                  </span>
                </div>

                <span>{formatSize(evidence.file.size)}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="vi-error">
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          <div className="vi-section-heading vi-analysis-heading">
            <div>
              <span className="vi-label">02 / ANALYSIS MODULES</span>
              <h2>Analysis capabilities</h2>
            </div>
          </div>

          <div className="vi-module-grid">
            <AnalysisModule
              icon={<ScanFace />}
              title="Face Analysis"
              description="Face detection and image quality assessment"
              status="Planned"
            />

            <AnalysisModule
              icon={<Car />}
              title="Vehicle Analysis"
              description="Vehicle type, colour and visual attributes"
              status="Planned"
            />

            <AnalysisModule
              icon={<Box />}
              title="Object Analysis"
              description="Object detection and scene characteristics"
              status="Planned"
            />

            <AnalysisModule
              icon={<FileSearch />}
              title="Image Forensics"
              description="Metadata, dimensions and file integrity"
              status={evidence ? "Available" : "Waiting"}
            />
          </div>

          <div className="vi-notice">
            <ShieldCheck size={19} />

            <div>
              <strong>Evidence integrity matters</strong>

              <p>
                The original image is not modified. Analysis findings
                must be reviewed by an investigator before being treated
                as verified evidence.
              </p>
            </div>
          </div>
        </div>

        <aside className="vi-sidebar">
          <div className="vi-side-card">
            <span className="vi-label">EVIDENCE SUMMARY</span>

            <div className="vi-side-icon">
              <Fingerprint />
            </div>

            <h3>
              {evidence ? "Evidence loaded" : "Awaiting evidence"}
            </h3>

            <p>
              {evidence
                ? "Local image inspection completed."
                : "Upload an image to initialise the analysis workspace."}
            </p>

            <div className="vi-divider" />

            <InfoRow
              label="File status"
              value={evidence ? "Loaded" : "Pending"}
            />

            <InfoRow
              label="File size"
              value={evidence ? formatSize(evidence.file.size) : "—"}
            />

            <InfoRow
              label="Dimensions"
              value={
                evidence
                  ? `${evidence.width} × ${evidence.height}`
                  : "—"
              }
            />

            <InfoRow
              label="Format"
              value={evidence ? evidence.file.type : "—"}
            />
          </div>

          <div className="vi-side-card vi-integrity-card">
            <span className="vi-label">FILE INTEGRITY</span>

            <div className="vi-integrity-status">
              {evidence ? <CheckCircle2 /> : <Clock />}

              {evidence
                ? "Fingerprint generated"
                : "Awaiting upload"}
            </div>

            <p>SHA-256</p>

            <code>
              {evidence
                ? evidence.hash
                : "No fingerprint available"}
            </code>

            {evidence && (
              <button
                type="button"
                className="vi-copy-button"
                onClick={() => void copyHash()}
              >
                {copied ? "Copied" : "Copy fingerprint"}
              </button>
            )}
          </div>

          <div className="vi-side-card vi-progress-card">
            <span className="vi-label">WORKFLOW</span>

            <InfoRow
              label="Image upload"
              value={evidence ? "Complete" : "Pending"}
            />

            <InfoRow
              label="File inspection"
              value={evidence ? "Complete" : "Pending"}
            />

            <InfoRow
              label="Visual detection"
              value="Not started"
            />

            <InfoRow
              label="Investigator review"
              value="Pending"
            />
          </div>
        </aside>
      </section>
    </main>
  );
}

function AnalysisModule({
  icon,
  title,
  description,
  status,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="vi-module">
      <div className="vi-module-icon">{icon}</div>

      <div className="vi-module-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="vi-module-status">{status}</span>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="vi-info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
