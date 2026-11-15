
import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft,
  KeyRound,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";

type Props = {
  onBack: () => void;
};

export default function PasswordRecovery({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 12) {
      setError("Your new password must contain at least 12 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    if (!code.trim()) {
      setError("Enter one of your unused recovery codes.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke("bob-password-recovery", {
          body: {
            email: email.trim(),
            code: code.trim().toUpperCase(),
            password,
          },
        });

      if (functionError) {
        let message = functionError.message;

        const context = (
          functionError as typeof functionError & {
            context?: Response;
          }
        ).context;

        if (context) {
          try {
            const payload = await context.clone().json();
            message = payload.error || message;
          } catch {
            // Retain original error.
          }
        }

        setError(message);
        return;
      }

      if (!data?.success) {
        setError(data?.error || "Recovery failed. Please try again.");
        return;
      }

      setSuccess(true);
      setCode("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Unable to contact the recovery service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <button type="button" style={styles.back} onClick={onBack}>
          <ArrowLeft size={16} />
          Back to sign in
        </button>

        <div style={styles.logo}>
          <ShieldCheck size={28} />
        </div>

        <h1 style={styles.title}>Recover your account</h1>

        <p style={styles.subtitle}>
          Use one unused BOB recovery code to set a new password.
        </p>

        {success ? (
          <div style={styles.success}>
            <CheckCircle2 size={25} />
            <h2>Password updated</h2>
            <p>
              Your password has been changed. Return to sign in using your new
              password. The recovery code you used cannot be reused.
            </p>

            <button type="button" style={styles.submit} onClick={onBack}>
              Return to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleRecovery}>
            <label style={styles.label}>Account email</label>

            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="off"
              placeholder="Enter your account email"
              required
            />

            <label style={styles.label}>Unused recovery code</label>

            <div style={styles.fieldIcon}>
              <KeyRound size={17} />

              <input
                style={styles.iconInput}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.toUpperCase())
                }
                placeholder="BOB-XXXXX-XXXXX-XXXXX-XXXXX"
                autoComplete="off"
                required
              />
            </div>

            <label style={styles.label}>New password</label>

            <div style={styles.fieldIcon}>
              <LockKeyhole size={17} />

              <input
                style={styles.iconInput}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 12 characters"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                required
              />

              <button
                type="button"
                style={styles.eye}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <label style={styles.label}>Confirm new password</label>

            <input
              style={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
            />

            {error && (
              <div style={styles.error}>
                <AlertTriangle size={17} />
                {error}
              </div>
            )}

            <button type="submit" style={styles.submit} disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle size={17} />
                  Recovering account...
                </>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  Reset password securely
                </>
              )}
            </button>

            <p style={styles.note}>
              Each recovery code works only once. Never share your codes.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 20,
    background: "#10111a",
    color: "#eceaf5",
  },
  card: {
    width: "min(100%, 430px)",
    padding: 30,
    borderRadius: 18,
    background: "#191b29",
    border: "1px solid #343449",
  },
  back: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: 0,
    background: "transparent",
    color: "#b9a3ed",
    cursor: "pointer",
    padding: 0,
    fontSize: 12,
  },
  logo: {
    width: 52,
    height: 52,
    display: "grid",
    placeItems: "center",
    borderRadius: 15,
    background: "#302541",
    color: "#c4a9ff",
    marginTop: 28,
  },
  title: { fontSize: 24, margin: "20px 0 8px" },
  subtitle: {
    fontSize: 12,
    lineHeight: 1.7,
    color: "#a4a4b7",
    marginBottom: 27,
  },
  label: {
    display: "block",
    fontSize: 11,
    color: "#c4c2d2",
    margin: "17px 0 8px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#11131e",
    border: "1px solid #38394d",
    borderRadius: 9,
    padding: 13,
    color: "#fff",
    outline: "none",
    fontSize: 12,
  },
  fieldIcon: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "0 12px",
    background: "#11131e",
    border: "1px solid #38394d",
    borderRadius: 9,
    color: "#bba3ed",
  },
  iconInput: {
    flex: 1,
    minWidth: 0,
    background: "transparent",
    border: 0,
    outline: "none",
    padding: "13px 0",
    color: "#fff",
    fontSize: 11,
  },
  eye: {
    border: 0,
    background: "transparent",
    color: "#aaa5bd",
    cursor: "pointer",
  },
  submit: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    border: 0,
    borderRadius: 9,
    padding: 14,
    marginTop: 22,
    background: "#8964d9",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
  },
  error: {
    display: "flex",
    gap: 9,
    alignItems: "center",
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    background: "#3b252d",
    color: "#ffb9bd",
    fontSize: 11,
  },
  success: {
    textAlign: "center",
    paddingTop: 20,
    color: "#a8e2c5",
  },
  note: {
    color: "#9292a8",
    fontSize: 10,
    lineHeight: 1.7,
    textAlign: "center",
    marginTop: 18,
  },
};
