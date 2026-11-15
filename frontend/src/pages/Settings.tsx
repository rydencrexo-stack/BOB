
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import {
  ShieldCheck,
  FileKey,
  LockKeyhole,
  Download,
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  LogOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type RecoveryStatus = {
  issued: boolean;
  remainingSetupAllowed: boolean;
};

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRecoveryCode(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);

  const characters = Array.from(
    bytes,
    (byte) => ALPHABET[byte & 31],
  ).join("");

  return `BOB-${characters.slice(0, 5)}-${characters.slice(5, 10)}-${characters.slice(10, 15)}-${characters.slice(15, 20)}`;
}

function generateFiveCodes(): string[] {
  const codes = new Set<string>();

  while (codes.size < 5) {
    codes.add(generateRecoveryCode());
  }

  return [...codes];
}

function downloadRecoveryPdf(codes: string[]) {
  const pdf = new jsPDF();

  pdf.setFillColor(17, 19, 29);
  pdf.rect(0, 0, 210, 297, "F");

  pdf.setTextColor(190, 160, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(21);
  pdf.text("BOB", 20, 25);

  pdf.setTextColor(245, 245, 250);
  pdf.setFontSize(16);
  pdf.text("ACCOUNT RECOVERY CODES", 20, 43);

  pdf.setTextColor(180, 180, 195);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("BEYOND ORDINARY BOUNDARIES", 20, 51);

  pdf.setDrawColor(100, 75, 145);
  pdf.line(20, 61, 190, 61);

  pdf.setTextColor(245, 245, 250);
  pdf.setFontSize(11);
  pdf.text("Your five one-time recovery codes", 20, 78);

  pdf.setTextColor(190, 160, 255);
  pdf.setFont("courier", "bold");
  pdf.setFontSize(11);

  codes.forEach((code, index) => {
    const y = 100 + index * 19;
    pdf.setFillColor(31, 32, 48);
    pdf.roundedRect(20, y - 8, 170, 13, 2, 2, "F");
    pdf.text(code, 27, y);
  });

  pdf.setTextColor(255, 190, 110);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("IMPORTANT SECURITY INSTRUCTIONS", 20, 212);

  pdf.setTextColor(220, 220, 230);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  const instructions = [
    "Each code can be used only once to recover your BOB account.",
    "BOB will not display or issue these codes again after setup.",
    "Keep this document offline in a secure location.",
    "Never share these codes with anyone.",
    "Anyone possessing an unused code may be able to reset your password.",
  ];

  instructions.forEach((line, index) => {
    pdf.text(`• ${line}`, 20, 226 + index * 9);
  });

  pdf.setDrawColor(75, 75, 95);
  pdf.line(20, 273, 190, 273);

  pdf.setTextColor(145, 145, 160);
  pdf.setFontSize(8);
  pdf.text("CONFIDENTIAL • STORE SECURELY • DO NOT UPLOAD", 20, 282);

  pdf.save("BOB-Recovery-Codes-Offline.pdf");
}

export default function Settings() {
  const [status, setStatus] = useState<RecoveryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [downloaded, setDownloaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  async function loadStatus() {
    setLoading(true);
    setError("");

    const { data, error: functionError } =
      await supabase.functions.invoke("bob-recovery-status", {
        method: "POST",
      });

    if (functionError) {
      setError(functionError.message || "Unable to check recovery status.");
      setLoading(false);
      return;
    }

    setStatus(data as RecoveryStatus);
    setLoading(false);
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  function prepareCodes() {
    setError("");
    setSuccess(false);

    const generated = generateFiveCodes();
    setCodes(generated);

    try {
      downloadRecoveryPdf(generated);
      setDownloaded(true);
      setConfirmed(false);
    } catch {
      setError(
        "PDF creation failed. You can retry without generating new codes.",
      );
      setDownloaded(false);
    }
  }

  function downloadAgain() {
    if (!codes.length) return;

    try {
      downloadRecoveryPdf(codes);
      setDownloaded(true);
      setError("");
    } catch {
      setError("Could not create the PDF. Please try again.");
    }
  }

  async function registerCodes() {
    if (codes.length !== 5 || !downloaded || !confirmed) return;

    setIssuing(true);
    setError("");

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke("bob-initial-recovery-setup", {
          body: { codes },
        });

      if (functionError || !data?.success) {
        setError(
          data?.error ||
            functionError?.message ||
            "Registration failed. Keep your PDF and retry using the same codes.",
        );
        return;
      }

      setCodes([]);
      setDownloaded(false);
      setConfirmed(false);
      setSuccess(true);

      await loadStatus();
    } catch {
      setError(
        "Registration failed. Keep your PDF and retry using the same codes.",
      );
    } finally {
      setIssuing(false);
    }
  }

  async function handleLogout() {
    const confirmed = window.confirm(
      "Are you sure you want to log out of BOB on all devices?",
    );

    if (!confirmed) return;

    setLogoutLoading(true);

    try {
      const { error: logoutError } = await supabase.auth.signOut({
        scope: "global",
      });

      if (logoutError) {
        setError(`Logout failed: ${logoutError.message}`);
        setLogoutLoading(false);
        return;
      }
    } catch {
      setError("Unable to log out. Please try again.");
      setLogoutLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Page heading */}
      <div style={styles.heading}>
        <div>
          <div style={styles.eyebrow}>ACCOUNT & SECURITY</div>
          <h1 style={styles.title}>Security Settings</h1>
          <p style={styles.subtitle}>
            Manage authentication and account recovery for BOB.
          </p>
        </div>

        <div style={styles.headingIcon}>
          <ShieldCheck size={27} />
        </div>
      </div>

      {/* Recovery codes */}
      <section style={styles.card}>
        <div style={styles.cardHeading}>
          <div style={styles.iconBox}>
            <FileKey size={21} />
          </div>

          <div>
            <h2 style={styles.cardTitle}>Recovery Codes</h2>
            <p style={styles.cardDescription}>
              Five manually stored, one-time account recovery codes.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={styles.notice}>
            <LoaderCircle size={19} />
            Checking recovery status...
          </div>
        ) : error && !codes.length ? (
          <div style={styles.error}>
            <AlertTriangle size={19} />
            {error}
          </div>
        ) : status?.issued ? (
          <div style={styles.successNotice}>
            <CheckCircle2 size={20} />
            <div>
              <strong>Initial recovery setup completed</strong>
              <p>
                Your five recovery codes have been registered. BOB will not
                issue another set.
              </p>
            </div>
          </div>
        ) : codes.length > 0 ? (
          <div style={styles.pending}>
            <strong>Recovery PDF prepared</strong>

            <p>
              Your codes are ready in the downloaded PDF. Keep this page open
              until registration is complete.
            </p>

            <button
              style={styles.secondaryButton}
              onClick={downloadAgain}
              type="button"
            >
              <Download size={16} />
              Download PDF again
            </button>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              I have saved the PDF securely offline and can access it.
            </label>

            <button
              style={{
                ...styles.primaryButton,
                opacity: confirmed && downloaded && !issuing ? 1 : 0.5,
                cursor:
                  confirmed && downloaded && !issuing
                    ? "pointer"
                    : "not-allowed",
              }}
              disabled={!confirmed || !downloaded || issuing}
              onClick={registerCodes}
              type="button"
            >
              {issuing ? (
                <>
                  <LoaderCircle size={16} />
                  Registering codes...
                </>
              ) : (
                <>
                  <LockKeyhole size={16} />
                  Confirm and register codes
                </>
              )}
            </button>

            <p style={styles.warningText}>
              Do not refresh or close this page until registration succeeds.
              If registration fails, retry with these same codes; do not
              generate another set.
            </p>
          </div>
        ) : (
          <div style={styles.notice}>
            <LockKeyhole size={20} />

            <div>
              <strong>Initial recovery setup required</strong>
              <p>
                Five one-time codes have not yet been issued. Prepare your
                recovery PDF to begin setup.
              </p>

              <button
                style={styles.primaryButton}
                onClick={prepareCodes}
                type="button"
              >
                <FileKey size={16} />
                Prepare recovery PDF
              </button>
            </div>
          </div>
        )}

        {success && (
          <div style={styles.successNotice}>
            <CheckCircle2 size={19} />
            Recovery codes registered successfully. Store your PDF offline.
          </div>
        )}

        {error && codes.length > 0 && (
          <div style={styles.error}>
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <div style={styles.footnote}>
          <ShieldCheck size={15} />
          Recovery codes are intended for offline storage. Each code works
          once.
        </div>
      </section>

      {/* Authentication */}
      <section style={styles.card}>
        <div style={styles.cardHeading}>
          <div style={styles.iconBox}>
            <LockKeyhole size={21} />
          </div>

          <div>
            <h2 style={styles.cardTitle}>Authentication</h2>
            <p style={styles.cardDescription}>
              Your account uses Supabase authentication.
            </p>
          </div>
        </div>

        {[
          ["Session persistence", "Enabled"],
          ["Password authentication", "Enabled"],
          ["Recovery method", "Offline codes"],
        ].map(([label, value]) => (
          <div style={styles.row} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      {/* Session management */}
      <section style={styles.card}>
        <div style={styles.cardHeading}>
          <div style={styles.iconBox}>
            <LogOut size={21} />
          </div>

          <div>
            <h2 style={styles.cardTitle}>Session Management</h2>
            <p style={styles.cardDescription}>
              Manage your active BOB account session.
            </p>
          </div>
        </div>

        <p style={styles.logoutDescription}>
          Sign out of your current account and revoke refresh sessions across
          your devices.
        </p>

        <button
          type="button"
          style={{
            ...styles.logoutButton,
            opacity: logoutLoading ? 0.6 : 1,
          }}
          disabled={logoutLoading}
          onClick={handleLogout}
        >
          {logoutLoading ? (
            <LoaderCircle size={17} />
          ) : (
            <LogOut size={17} />
          )}

          {logoutLoading ? "Logging out..." : "Log out of BOB"}
        </button>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "min(100% - 40px, 864px)",
    margin: "28px auto",
    color: "#e9e8f2",
  },
  heading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  eyebrow: {
    color: "#b99aff",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 27,
    fontWeight: 600,
    margin: "0 0 8px",
  },
  subtitle: {
    color: "#999caf",
    fontSize: 13,
    margin: 0,
  },
  headingIcon: {
    width: 49,
    height: 49,
    borderRadius: 14,
    background: "#29233d",
    color: "#c4a9ff",
    display: "grid",
    placeItems: "center",
  },
  card: {
    background: "#191b29",
    border: "1px solid #303247",
    borderRadius: 15,
    padding: 21,
    marginBottom: 17,
  },
  cardHeading: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 21,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    background: "#29233d",
    color: "#c4a9ff",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 650,
    margin: "0 0 5px",
  },
  cardDescription: {
    color: "#999caf",
    fontSize: 11,
    margin: 0,
  },
  notice: {
    display: "flex",
    gap: 13,
    alignItems: "flex-start",
    background: "#29243b",
    border: "1px solid #594779",
    borderRadius: 11,
    padding: 17,
    color: "#cbb7ff",
    fontSize: 13,
  },
  successNotice: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    background: "#1d302d",
    border: "1px solid #315b4b",
    borderRadius: 11,
    padding: 16,
    color: "#a8e2c5",
    fontSize: 13,
    marginTop: 12,
  },
  pending: {
    background: "#29243b",
    border: "1px solid #594779",
    borderRadius: 11,
    padding: 17,
    fontSize: 13,
  },
  checkboxLabel: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    margin: "18px 0",
    color: "#d1d0dd",
    fontSize: 12,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#8964d9",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    padding: "11px 15px",
    fontSize: 12,
    fontWeight: 700,
    marginTop: 14,
    cursor: "pointer",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#343047",
    color: "#e7dcff",
    border: "1px solid #62517e",
    borderRadius: 8,
    padding: "10px 13px",
    fontSize: 12,
    marginTop: 9,
    cursor: "pointer",
  },
  warningText: {
    color: "#e5b978",
    fontSize: 11,
    lineHeight: 1.6,
  },
  error: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: 13,
    borderRadius: 9,
    background: "#3a252b",
    color: "#ffb5b5",
    fontSize: 12,
    marginTop: 12,
  },
  footnote: {
    borderTop: "1px solid #343548",
    paddingTop: 15,
    marginTop: 20,
    color: "#999caf",
    display: "flex",
    gap: 9,
    alignItems: "center",
    fontSize: 10,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #343548",
    padding: "13px 0",
    color: "#aeb0c2",
    fontSize: 11,
  },
  logoutDescription: {
    color: "#a4a4b7",
    fontSize: 12,
    lineHeight: 1.7,
    margin: "0 0 12px",
  },
  logoutButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    padding: "12px 17px",
    marginTop: 5,
    borderRadius: 9,
    border: "1px solid #79444d",
    background: "#38242d",
    color: "#ffb7bd",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
};
