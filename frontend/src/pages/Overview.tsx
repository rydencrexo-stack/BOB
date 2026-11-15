import {
  Activity,
  FileSearch,
  Fingerprint,
  Network,
  ScanEye,
  ShieldCheck,
  Database,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  { label: "INVESTIGATIONS", value: "00", icon: FileSearch },
  { label: "EVIDENCE FILES", value: "00", icon: ShieldCheck },
  { label: "ANALYSES RUN", value: "00", icon: Activity },
  { label: "SAVED FINDINGS", value: "00", icon: Network },
];

export default function Overview() {
  return (
    <div className="dashboard-content">
      <section className="welcome-section">
        <div>
          <div className="eyebrow">
            <span className="gold-line" />
            BEYOND ORDINARY BOUNDARIES
          </div>

          <h1>
            Intelligence starts
            <br />
            <span>with evidence.</span>
          </h1>

          <p>
            Analyse visual evidence, organise investigations and explore
            authorised digital intelligence from one workspace.
          </p>
        </div>

        <div className="welcome-decoration">
          <ScanEye size={90} strokeWidth={0.8} />
          <span>BOB / SYSTEM 001</span>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <article className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <Icon size={19} />
            </div>

            <strong>{value}</strong>
            <small>Awaiting first investigation</small>
          </article>
        ))}
      </section>

      <section className="bottom-grid">
        <article className="bottom-card">
          <div className="bottom-card-title">
            <FileSearch size={18} />
            <strong>Recent investigations</strong>
            <ArrowUpRight size={16} />
          </div>

          <div className="empty-state">
            <Fingerprint size={28} />
            <span>No investigations yet</span>
            <small>
              Your saved investigation history will appear here.
            </small>
          </div>
        </article>

        <article className="bottom-card">
          <div className="bottom-card-title">
            <Database size={18} />
            <strong>Platform modules</strong>
            <ArrowUpRight size={16} />
          </div>

          <div className="module-list">
            <span>
              <ScanEye size={16} /> Visual Intelligence
              <b>FOUNDATION</b>
            </span>

            <span>
              <Database size={16} /> Intelligence Database
              <b>PLANNED</b>
            </span>

            <span>
              <Network size={16} /> Intelligence Graph
              <b>PLANNED</b>
            </span>

            <span>
              <ShieldCheck size={16} /> Evidence Integrity
              <b>PLANNED</b>
            </span>
          </div>
        </article>
      </section>
    </div>
  );
}