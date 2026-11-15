
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  FileImage,
  Fingerprint,
  ImagePlus,
  ScanEye,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

type ImageAnalysis = {
  name: string;
  format: string;
  size: string;
  width: number;
  height: number;
  aspectRatio: string;
  sha256: string;
  averageColor: string;
  brightness: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function detectImageFormat(file: File): Promise<string | null> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  // PNG signature
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "PNG";
  }

  // JPEG signature
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "JPEG";
  }

  // WEBP signature
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "WEBP";
  }

  return null;
}

function calculateAverageColor(
  image: HTMLImageElement,
): { color: string; brightness: string } {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    throw new Error("Could not initialize image analysis.");
  }

  const size = 64;
  canvas.width = size;
  canvas.height = size;

  context.drawImage(image, 0, 0, size, size);

  const pixels = context.getImageData(0, 0, size, size).data;

  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3] / 255;

    if (alpha === 0) continue;

    red += pixels[i] * alpha;
    green += pixels[i + 1] * alpha;
    blue += pixels[i + 2] * alpha;
    count++;
  }

  if (count === 0) {
    return {
      color: "#000000",
      brightness: "Unavailable",
    };
  }

  const r = Math.round(red / count);
  const g = Math.round(green / count);
  const b = Math.round(blue / count);

  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return {
    color: `#${[r, g, b]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`,
    brightness:
      luminance > 0.7
        ? "Bright"
        : luminance > 0.35
          ? "Medium"
          : "Dark",
  };
}

async function analyzeImage(
  file: File,
  previewUrl: string,
): Promise<ImageAnalysis> {
  const format = await detectImageFormat(file);

  if (!format) {
    throw new Error("Unsupported or invalid image file.");
  }

  const image = new Image();

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Image could not be decoded."));
    image.src = previewUrl;
  });

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );

  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const colorData = calculateAverageColor(image);

  const divisor = greatestCommonDivisor(image.naturalWidth, image.naturalHeight);

  return {
    name: file.name,
    format,
    size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    width: image.naturalWidth,
    height: image.naturalHeight,
    aspectRatio: `${image.naturalWidth / divisor}:${image.naturalHeight / divisor}`,
    sha256: hash,
    averageColor: colorData.color,
    brightness: colorData.brightness,
  };
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

export default function VisualIntelligence() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const selectFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File exceeds the 10 MB upload limit.");
      return;
    }

    if (selectedFile.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    const newPreview = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreview(newPreview);
    setAnalysis(null);
    setError("");
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const runAnalysis = async () => {
    if (!file || !preview) return;

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await analyzeImage(file, preview);
      setAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image analysis failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vi-workspace">
      <section className="vi-heading">
        <div>
          <div className="eyebrow">
            <span className="gold-line" />
            BOB / VISUAL ENGINE
          </div>

          <h1>Visual Intelligence</h1>

          <p>
            Inspect images, extract technical properties and generate
            verifiable file fingerprints.
          </p>
        </div>

        <div className="vi-engine-status">
          <span className="status-dot" />
          LOCAL ENGINE
        </div>
      </section>

      <section className="vi-upload-card">
        <div className="vi-card-heading">
          <div>
            <span className="vi-label">01 / INPUT</span>
            <h2>Image evidence</h2>
            <p>Upload an image to begin technical inspection.</p>
          </div>

          <FileImage size={25} />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(event) => selectFile(event.target.files?.[0])}
        />

        {!preview ? (
          <div
            className={`vi-dropzone ${dragging ? "dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              selectFile(event.dataTransfer.files?.[0]);
            }}
          >
            <div className="vi-upload-icon">
              <Upload size={27} />
            </div>

            <h3>Drop your image here</h3>

            <p>Or select a file from your device</p>

            <button
              className="vi-primary-button"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus size={17} />
              Select image
            </button>

            <span className="vi-file-hint">
              PNG · JPG · WEBP · MAXIMUM 10 MB
            </span>
          </div>
        ) : (
          <div className="vi-selected-image">
            <img src={preview} alt="Selected evidence" />

            <div className="vi-selected-details">
              <span className="vi-label">SELECTED EVIDENCE</span>
              <strong>{file?.name}</strong>
              <span>
                {file ? (file.size / (1024 * 1024)).toFixed(2) : "0"} MB
              </span>

              <div className="vi-action-row">
                <button
                  className="vi-primary-button"
                  onClick={runAnalysis}
                  disabled={loading}
                >
                  <ScanEye size={16} />
                  {loading ? "Analysing..." : "Analyse image"}
                </button>

                <button
                  className="vi-remove-button"
                  onClick={removeFile}
                  disabled={loading}
                >
                  <X size={16} />
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="vi-error">
            <X size={16} />
            {error}
          </div>
        )}

        <div className="vi-upload-footer">
          <span>
            <ShieldCheck size={14} />
            Processed locally in your browser
          </span>
          <span>NO SERVER UPLOAD</span>
        </div>
      </section>

      {analysis && (
        <>
          <section className="vi-results-heading">
            <div>
              <span className="vi-label">02 / ANALYSIS</span>
              <h2>Technical report</h2>
            </div>

            <span className="vi-success">
              <CheckCircle2 size={15} />
              Analysis complete
            </span>
          </section>

          <section className="vi-results-grid">
            <article className="vi-result-card">
              <span className="vi-label">IMAGE FORMAT</span>
              <strong>{analysis.format}</strong>
              <small>Detected from file signature</small>
            </article>

            <article className="vi-result-card">
              <span className="vi-label">FILE SIZE</span>
              <strong>{analysis.size}</strong>
              <small>Original file size</small>
            </article>

            <article className="vi-result-card">
              <span className="vi-label">DIMENSIONS</span>
              <strong>
                {analysis.width} × {analysis.height}
              </strong>
              <small>Width × height in pixels</small>
            </article>

            <article className="vi-result-card">
              <span className="vi-label">ASPECT RATIO</span>
              <strong>{analysis.aspectRatio}</strong>
              <small>Reduced image ratio</small>
            </article>
          </section>

          <section className="vi-detail-card">
            <div className="vi-card-heading">
              <div>
                <span className="vi-label">03 / FINGERPRINT</span>
                <h2>Evidence integrity</h2>
              </div>
              <Fingerprint size={24} />
            </div>

            <div className="vi-hash-block">
              <span>SHA-256 CHECKSUM</span>
              <code>{analysis.sha256}</code>
            </div>

            <p className="vi-explanation">
              This hash is a cryptographic fingerprint of the uploaded file.
              It can help verify whether the exact file changes later.
            </p>
          </section>

          <section className="vi-detail-card">
            <div className="vi-card-heading">
              <div>
                <span className="vi-label">04 / VISUAL PROFILE</span>
                <h2>Image characteristics</h2>
              </div>
              <Activity size={24} />
            </div>

            <div className="vi-characteristics">
              <div>
                <span>Average sampled colour</span>
                <strong>
                  <i
                    className="vi-color-swatch"
                    style={{ background: analysis.averageColor }}
                  />
                  {analysis.averageColor}
                </strong>
              </div>

              <div>
                <span>Estimated brightness</span>
                <strong>{analysis.brightness}</strong>
              </div>

              <div>
                <span>File name</span>
                <strong className="vi-filename">{analysis.name}</strong>
              </div>
            </div>

            <p className="vi-explanation">
              Colour and brightness are estimated from a downscaled image
              sample. They are descriptive measurements, not authenticity
              or identity verification.
            </p>
          </section>
        </>
      )}

      <div className="vi-disclaimer">
        <ShieldCheck size={17} />
        <span>
          This first-stage engine performs local technical image inspection.
          It does not identify people, search social media or establish
          the authenticity of an image.
        </span>
      </div>
    </div>
  );
}
