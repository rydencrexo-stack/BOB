
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  FileText,
  Fingerprint,
  Globe2,
  ImagePlus,
  LayoutDashboard,
  Menu,
  Network,
  ScanEye,
  Settings,
  ShieldAlert,
  X,
  RefreshCw,
  LoaderCircle,
} from "lucide-react";

import { DiscreteTabs } from "../components/discrete-tabs";

import Overview from "../pages/Overview";
import VisualIntelligence from "../pages/VisualIntelligence";
import ReverseImageSearch from "../pages/ReverseImageSearch";
import WebOSINT from "../pages/WebOSINT";
import DigitalForensics from "../pages/DigitalForensics";
import ThreatIntelligence from "../pages/ThreatIntelligence";
import IntelligenceGraph from "../pages/IntelligenceGraph";
import Reports from "../pages/Reports";
import SettingsPage from "../pages/Settings";

import BrandLogo from "../components/BrandLogo";
import {
  WorkspaceProvider,
  useWorkspace,
} from "../contexts/WorkspaceContext";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Visual Intelligence", icon: ScanEye },
  { label: "Reverse Image Search", icon: ImagePlus },
  { label: "Web OSINT", icon: Globe2 },
  { label: "Digital Forensics", icon: Fingerprint },
  { label: "Threat Intelligence", icon: ShieldAlert },
  { label: "Intelligence Graph", icon: Network },
  { label: "Reports", icon: FileText },
];

const bottomTabs = [
  {
    id: "Overview",
    icon: <LayoutDashboard size={21} />,
    label: "Home",
    activeColor: "text-amber-400",
  },
  {
    id: "Visual Intelligence",
    icon: <ScanEye size={21} />,
    label: "Visual",
    activeColor: "text-amber-400",
  },
  {
    id: "Reverse Image Search",
    icon: <ImagePlus size={21} />,
    label: "Search",
    activeColor: "text-amber-400",
  },
  {
    id: "Reports",
    icon: <FileText size={21} />,
    label: "Reports",
    activeColor: "text-amber-400",
  },
];

const pageComponents: Record<string, React.ComponentType> = {
  Overview,
  "Visual Intelligence": VisualIntelligence,
  "Reverse Image Search": ReverseImageSearch,
  "Web OSINT": WebOSINT,
  "Digital Forensics": DigitalForensics,
  "Threat Intelligence": ThreatIntelligence,
  "Intelligence Graph": IntelligenceGraph,
  Reports,
  Settings: SettingsPage,
};

function DashboardContent() {
  const [activePage, setActivePage] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const {
    workspace,
    loading,
    error,
    refreshWorkspace,
  } = useWorkspace();

  const ActivePage = pageComponents[activePage] ?? Overview;

  const navigateTo = (page: string) => {
    if (!pageComponents[page]) return;
    setActivePage(page);
    setMobileOpen(false);
  };

  const activeBottomTab = bottomTabs.some(
    (tab) => tab.id === activePage,
  )
    ? activePage
    : "Overview";

  if (loading) {
    return (
      <div className="app-shell" style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <LoaderCircle
            size={30}
            className="animate-spin"
            style={{ margin: "0 auto 14px" }}
          />
          <p>Loading BOB Intelligence workspace...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="app-shell" style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <ShieldAlert size={38} style={{ margin: "0 auto 16px" }} />
          <h2>Workspace unavailable</h2>
          <p>
            {error || "Your account does not have an active workspace."}
          </p>
          <button
            className="nav-item"
            onClick={() => void refreshWorkspace()}
            style={{ margin: "20px auto 0" }}
          >
            <RefreshCw size={16} />
            Retry workspace connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand-area">
          <BrandLogo size={64} className="brand-image" />
          <div className="brand-name">
            <span>BOB</span>
            <small>INTELLIGENCE PLATFORM</small>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">
          {workspace.name.toUpperCase()}
        </div>

        <nav className="sidebar-nav">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${
                activePage === label ? "active" : ""
              }`}
              onClick={() => navigateTo(label)}
            >
              <Icon size={18} />
              <span>{label}</span>

              {label === "Visual Intelligence" && (
                <span className="nav-new">CORE</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />
            <span>BOB CORE SYSTEM</span>
            <span className="status-online">READY</span>
          </div>

          <button
            className={`nav-item ${
              activePage === "Settings" ? "active" : ""
            }`}
            onClick={() => navigateTo("Settings")}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <div className="sidebar-version">
            BOB INTELLIGENCE <span>v0.1.0</span>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div className="breadcrumb">
              <span>BOB</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="environment-label">
              <span className="status-dot" />
              DEVELOPMENT
            </div>

            <button
              className="icon-button"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <button className="profile-button">
              <div className="profile-avatar">A</div>
              <span>{workspace.role.toUpperCase()}</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <ActivePage />

        <footer
          className="app-footer"
          style={{ margin: "0 34px 20px" }}
        >
          <span>BOB — BEYOND ORDINARY BOUNDARIES</span>
          <span>
            BUILT FOR INTELLIGENCE. DESIGNED FOR INVESTIGATION.
          </span>
        </footer>
      </main>

      <div className="bob-floating-nav">
        <DiscreteTabs
          key={activeBottomTab}
          tabs={bottomTabs}
          defaultTab={activeBottomTab}
          onTabChange={navigateTo}
        />
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <WorkspaceProvider>
      <DashboardContent />
    </WorkspaceProvider>
  );
}
