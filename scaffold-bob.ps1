
$ErrorActionPreference = "Stop"

Write-Host "Creating BOB project structure..." -ForegroundColor Cyan

$directories = @(
    "frontend/public/assets",
    "frontend/src/assets",
    "frontend/src/components/ui",
    "frontend/src/layouts",
    "frontend/src/pages",
    "frontend/src/features/visual-intelligence/components",
    "frontend/src/features/visual-intelligence/services",
    "frontend/src/features/visual-intelligence/hooks",
    "frontend/src/features/visual-intelligence/utils",
    "frontend/src/features/reverse-image/components",
    "frontend/src/features/reverse-image/services",
    "frontend/src/features/web-osint/components",
    "frontend/src/features/web-osint/services",
    "frontend/src/features/digital-forensics/components",
    "frontend/src/features/digital-forensics/services",
    "frontend/src/features/threat-intelligence",
    "frontend/src/features/intelligence-graph",
    "frontend/src/features/reports",
    "frontend/src/features/investigations",
    "frontend/src/features/vehicle-intelligence",
    "frontend/src/hooks",
    "frontend/src/contexts",
    "frontend/src/lib",
    "frontend/src/services",
    "frontend/src/types",
    "frontend/src/utils",
    "backend/app/api",
    "backend/app/core",
    "backend/app/services",
    "backend/app/modules/visual_intelligence",
    "backend/app/modules/reverse_image",
    "backend/app/modules/web_osint",
    "backend/app/modules/digital_forensics",
    "backend/app/modules/threat_intelligence",
    "backend/app/modules/vehicle_intelligence",
    "backend/app/modules/reports",
    "backend/app/models",
    "backend/app/schemas",
    "backend/tests",
    "supabase/migrations",
    "supabase/functions",
    "docs"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Create page components
$pages = @(
    "Overview",
    "VisualIntelligence",
    "ReverseImageSearch",
    "WebOSINT",
    "DigitalForensics",
    "ThreatIntelligence",
    "IntelligenceGraph",
    "Reports",
    "Settings"
)

foreach ($page in $pages) {
    $label = switch ($page) {
        "WebOSINT" { "Web OSINT" }
        "ReverseImageSearch" { "Reverse Image Search" }
        "VisualIntelligence" { "Visual Intelligence" }
        "DigitalForensics" { "Digital Forensics" }
        "ThreatIntelligence" { "Threat Intelligence" }
        "IntelligenceGraph" { "Intelligence Graph" }
        default { $page }
    }

    $content = @"
import ModulePage from "../components/ModulePage";

export default function $page() {
  return <ModulePage title="$label" />;
}
"@

    if ($page -eq "Overview") {
        $content = @'
import {
  Activity,
  FileSearch,
  Fingerprint,
  Network,
  ScanEye,
  ShieldCheck,
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
            Visual intelligence.
            <br />
            <span>One starting point.</span>
          </h1>
          <p>
            Investigate images, analyse evidence and explore
            publicly accessible digital intelligence.
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
              <Icon size={17} />
            </div>
            <strong>{value}</strong>
            <small>Awaiting first investigation</small>
          </article>
        ))}
      </section>

      <section className="bottom-grid">
        <article className="bottom-card">
          <div className="bottom-card-title">
            <FileSearch size={17} />
            <strong>Recent investigations</strong>
          </div>
          <div className="empty-state">
            <Fingerprint size={25} />
            <span>No investigations yet</span>
            <small>Your investigation history will appear here.</small>
          </div>
        </article>

        <article className="bottom-card">
          <div className="bottom-card-title">
            <Activity size={17} />
            <strong>System status</strong>
          </div>
          <div className="module-list">
            <span><ScanEye size={16} /> Visual Intelligence <b>FOUNDATION</b></span>
            <span><Network size={16} /> Intelligence Graph <b>PLANNED</b></span>
            <span><ShieldCheck size={16} /> Evidence Integrity <b>PLANNED</b></span>
          </div>
        </article>
      </section>
    </div>
  );
}
'@
    }

    Set-Content -Path "frontend/src/pages/$page.tsx" -Value $content -Encoding UTF8
}

# Shared module placeholder
@'
type ModulePageProps = {
  title: string;
  description?: string;
};

export default function ModulePage({
  title,
  description = "This module will be implemented in its dedicated feature directory.",
}: ModulePageProps) {
  return (
    <section className="coming-soon">
      <div className="upload-icon">
        <span>BOB</span>
      </div>
      <div className="eyebrow">BOB INTELLIGENCE PLATFORM</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
'@ | Set-Content "frontend/src/components/ModulePage.tsx" -Encoding UTF8

# Dashboard layout
@'
import { useState } from "react";
import {
  Activity,
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

export default function DashboardLayout() {
  const [activePage, setActivePage] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);

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

        <div className="workspace-label">MISSION CONTROL</div>

        <nav className="sidebar-nav">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
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
            className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
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

            <button className="icon-button" aria-label="Notifications">
              <Bell size={18} />
            </button>

            <button className="profile-button">
              <div className="profile-avatar">A</div>
              <span>Investigator</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <ActivePage />

        <footer className="app-footer" style={{ margin: "0 34px 20px" }}>
          <span>BOB — BEYOND ORDINARY BOUNDARIES</span>
          <span>BUILT FOR INTELLIGENCE. DESIGNED FOR INVESTIGATION.</span>
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
'@ | Set-Content "frontend/src/layouts/DashboardLayout.tsx" -Encoding UTF8

# Permanent App entry point
@'
import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {
  return <DashboardLayout />;
}
'@ | Set-Content "frontend/src/App.tsx" -Encoding UTF8

# Backend starter
@'
from fastapi import FastAPI

app = FastAPI(
    title="BOB Intelligence API",
    version="0.1.0",
    description="Beyond Ordinary Boundaries - Intelligence Services",
)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "BOB API",
        "version": "0.1.0",
    }
'@ | Set-Content "backend/app/main.py" -Encoding UTF8

@'
fastapi
uvicorn[standard]
python-multipart
pydantic
'@ | Set-Content "backend/requirements.txt" -Encoding UTF8

@'
# BOB backend environment variables
# Add local development configuration here.
'@ | Set-Content "backend/.env.example" -Encoding UTF8

# Python package markers
$pythonDirs = @(
    "backend/app",
    "backend/app/api",
    "backend/app/core",
    "backend/app/services",
    "backend/app/modules",
    "backend/app/modules/visual_intelligence",
    "backend/app/modules/reverse_image",
    "backend/app/modules/web_osint",
    "backend/app/modules/digital_forensics",
    "backend/app/modules/threat_intelligence",
    "backend/app/modules/vehicle_intelligence",
    "backend/app/modules/reports",
    "backend/app/models",
    "backend/app/schemas"
)

foreach ($dir in $pythonDirs) {
    if (!(Test-Path "$dir/__init__.py")) {
        New-Item -ItemType File -Path "$dir/__init__.py" | Out-Null
    }
}

# Documentation
@'
# BOB Architecture

BOB (Beyond Ordinary Boundaries) is a modular visual intelligence,
OSINT and digital forensics platform.

Frontend: React, TypeScript and Vite.
Backend: Python and FastAPI.
Database: Supabase (planned integration).
Deployment: Vercel frontend and lightweight backend deployment.
'@ | Set-Content "docs/ARCHITECTURE.md" -Encoding UTF8

@'
# BOB Roadmap

## MVP
- Visual Intelligence
- Reverse Image Intelligence
- Web OSINT
- Digital Forensics
- Evidence and Reports

## Phase 2
- Vehicle and Object Intelligence
- Threat Intelligence
- Investigation Timeline

## Phase 3
- Intelligence Graph
- AI Investigation Assistant
- Monitoring and Alerts
'@ | Set-Content "docs/ROADMAP.md" -Encoding UTF8

@'
# BOB API

API endpoints and request/response contracts will be documented here.
'@ | Set-Content "docs/API.md" -Encoding UTF8

@'
# BOB Database

Database schema, relationships and migrations will be documented here.
'@ | Set-Content "docs/DATABASE.md" -Encoding UTF8

@'
# BOB Security

Security architecture, authorization, evidence handling and audit requirements.
'@ | Set-Content "docs/SECURITY.md" -Encoding UTF8

@'
# BOB

Beyond Ordinary Boundaries.

A modular visual intelligence, OSINT and digital forensics platform.
'@ | Set-Content "README.md" -Encoding UTF8

# Feature README placeholders
$featureDirs = @(
    "frontend/src/features/visual-intelligence",
    "frontend/src/features/reverse-image",
    "frontend/src/features/web-osint",
    "frontend/src/features/digital-forensics",
    "frontend/src/features/threat-intelligence",
    "frontend/src/features/intelligence-graph",
    "frontend/src/features/reports",
    "frontend/src/features/investigations",
    "frontend/src/features/vehicle-intelligence",
    "backend/app/modules/visual_intelligence",
    "backend/app/modules/reverse_image",
    "backend/app/modules/web_osint",
    "backend/app/modules/digital_forensics",
    "backend/app/modules/threat_intelligence",
    "backend/app/modules/vehicle_intelligence",
    "backend/app/modules/reports"
)

foreach ($dir in $featureDirs) {
    $readme = "# $((Split-Path $dir -Leaf))`n`nModule scaffold. Implementation will be added here."
    Set-Content -Path "$dir/README.md" -Value $readme -Encoding UTF8
}

# Git ignore
@'
node_modules/
dist/
.env
.env.*
!.env.example
.venv/
__pycache__/
*.pyc
.DS_Store
.vscode/
'@ | Set-Content ".gitignore" -Encoding UTF8

Write-Host ""
Write-Host "BOB scaffold created successfully." -ForegroundColor Green
Write-Host "App.tsx is now a permanent entry point." -ForegroundColor Green
Write-Host "Existing App.css and package.json were preserved." -ForegroundColor Yellow
