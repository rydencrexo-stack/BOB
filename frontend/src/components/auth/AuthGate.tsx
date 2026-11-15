
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import PasswordRecovery from "./PasswordRecovery";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

type AuthGateProps = {
  children: ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        setError("Unable to restore your session. Please sign in again.");
      }

      setSession(!!data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(!!currentSession);

        if (!currentSession) {
          setEmail("");
          setPassword("");
          setShowPassword(false);
          setRecovering(false);
        }
      }
    });

    const handleSettingsLogout = async () => {
      await supabase.auth.signOut({ scope: "global" });
    };

    window.addEventListener("bob:logout", handleSettingsLogout);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("bob:logout", handleSettingsLogout);
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        setError("Invalid email or password. Please try again.");
      } else {
        setPassword("");
        setShowPassword(false);
      }
    } catch {
      setError("Unable to connect to the authentication service.");
    } finally {
      setLoading(false);
    }
  }

  if (session === null) {
    return (
      <div style={styles.loadingPage}>
        <LoaderCircle size={27} />
        <p>Securing your BOB session...</p>
      </div>
    );
  }

  if (session) return <>{children}</>;

  if (recovering) {
    return (
      <PasswordRecovery
        onBack={() => {
          setRecovering(false);
          setError("");
        }}
      />
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.logo}>
          <ShieldCheck size={31} />
        </div>

        <div style={styles.brand}>BOB</div>
        <div style={styles.tagline}>BEYOND ORDINARY BOUNDARIES</div>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>
          Sign in to access your intelligence workspace.
        </p>

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Email address</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
            placeholder="Enter your email"
            required
          />

          <label style={styles.label}>Password</label>

          <div style={styles.passwordField}>
            <LockKeyhole size={17} />

            <input
              style={styles.passwordInput}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Enter your password"
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

          <button
            type="button"
            style={styles.forgot}
            onClick={() => {
              setRecovering(true);
              setError("");
            }}
          >
            Forgot password?
          </button>

          {error && (
            <div style={styles.error}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.submit,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle size={17} /> Signing in...
              </>
            ) : (
              "Sign in securely"
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <ShieldCheck size={14} />
          Protected BOB authentication
        </div>
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
  loadingPage: {
    minHeight: "100vh",
    display: "grid",
    placeContent: "center",
    justifyItems: "center",
    gap: 12,
    background: "#10111a",
    color: "#c4a9ff",
  },
  card: {
    width: "min(100%, 410px)",
    boxSizing: "border-box",
    padding: 32,
    borderRadius: 18,
    background: "#191b29",
    border: "1px solid #343449",
  },
  logo: {
    width: 55,
    height: 55,
    display: "grid",
    placeItems: "center",
    borderRadius: 16,
    background: "#302541",
    color: "#c4a9ff",
    marginBottom: 15,
  },
  brand: {
    fontSize: 27,
    fontWeight: 800,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 8,
    letterSpacing: 2,
    color: "#a99bc4",
    marginTop: 4,
  },
  title: {
    fontSize: 25,
    margin: "34px 0 7px",
  },
  subtitle: {
    color: "#a4a4b7",
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 25,
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
  passwordField: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 12px",
    background: "#11131e",
    border: "1px solid #38394d",
    borderRadius: 9,
    color: "#bba3ed",
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    padding: 13,
    background: "transparent",
    border: 0,
    outline: "none",
    color: "#fff",
    fontSize: 12,
  },
  eye: {
    border: 0,
    background: "transparent",
    color: "#aaa5bd",
    cursor: "pointer",
  },
  forgot: {
    display: "block",
    marginLeft: "auto",
    marginTop: 13,
    background: "transparent",
    border: 0,
    color: "#c4a9ff",
    cursor: "pointer",
    fontSize: 11,
  },
  submit: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginTop: 25,
    padding: 14,
    border: 0,
    borderRadius: 9,
    background: "#8964d9",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
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
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderTop: "1px solid #343548",
    paddingTop: 18,
    marginTop: 24,
    color: "#9292a8",
    fontSize: 10,
  },
};
