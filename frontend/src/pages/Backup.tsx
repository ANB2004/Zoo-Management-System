import { useState } from "react";
import { api, ApiError, getTokens } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Banner } from "../components/Banner";
import "./Backup.css";

interface BackupPayload {
  enclosures: Array<{ id: number; name: string; section?: string; notes?: string }>;
  occupants: Array<Record<string, unknown>>;
}

export function Backup() {
  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("ChangeMe123!");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<BackupPayload | null>(null);

  async function handleAuthenticate(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(username, password);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleExport() {
    setDownloading(true);
    setActionError(null);
    try {
      const data = await api.get<BackupPayload>("/backup/export/", true);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `wildreserve_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setActionSuccess("Snapshot JSON archive downloaded successfully.");
      window.setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't export snapshot.");
    } finally {
      setDownloading(false);
    }
  }

  function handleFileSelected(file: File) {
    setActionError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as BackupPayload;
        if (!json.enclosures || !json.occupants) {
          setActionError("Invalid backup file — missing root keys.");
          setParsedData(null);
          return;
        }
        setParsedData(json);
      } catch {
        setActionError("Could not parse JSON file.");
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  }

  async function handleRestore() {
    if (!parsedData) return;
    setRestoring(true);
    setActionError(null);
    try {
      const tokens = getTokens();
      const res = await fetch("http://localhost:8000/api/backup/import/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify(parsedData),
      });

      if (!res.ok) throw new Error(`Restore failed with status ${res.status}`);

      const result = await res.json();
      setActionSuccess(`Restored ${result.enclosures_restored} enclosures & ${result.occupants_restored} occupants!`);
      setSelectedFile(null);
      setParsedData(null);
      window.setTimeout(() => setActionSuccess(null), 6000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to restore database.");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="ui-page">
      <div className="portal-breadcrumb">SYSTEM ADMINISTRATION / ACCESS & INTEGRITY</div>

      <div className="portal-top-bar">
        <div>
          <h1 className="ui-page__title">Secure Portal</h1>
          <p className="ui-page__subtitle">
            Restricted access gateway for zoological database management and archival restoration protocols.
          </p>
        </div>

        <div className="db-online-badge">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#166534" }} />
          <span>Main Database: Online</span>
        </div>
      </div>

      {actionError && <Banner kind="error">{actionError}</Banner>}
      {actionSuccess && <Banner kind="success">{actionSuccess}</Banner>}

      {/* 2-Column Portal Grid matching Screenshot 5 */}
      <div className="portal-grid">
        {/* Left Column: Staff Login Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="portal-login-card">
            <div className="portal-login-head">
              <div className="portal-login-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <div className="portal-login-title">Staff Login</div>
                <div className="portal-login-sub">Authenticate to access protocols.</div>
              </div>
            </div>

            {loginError && <Banner kind="error">{loginError}</Banner>}

            <form onSubmit={handleAuthenticate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="portal-input-group">
                <label className="portal-input-label">Username</label>
                <div className="portal-input-wrapper">
                  <svg className="portal-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    className="portal-field"
                    placeholder="Enter ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="portal-input-group">
                <label className="portal-input-label">Passcode</label>
                <div className="portal-input-wrapper">
                  <svg className="portal-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type="password"
                    className="portal-field"
                    placeholder="Enter secure key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "#64748b" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked /> Remember session
                </label>
                <span style={{ cursor: "pointer", textDecoration: "underline" }}>Forgot key?</span>
              </div>

              <button type="submit" className="portal-btn-auth" disabled={loginLoading}>
                <span>{loginLoading ? "AUTHENTICATING..." : "AUTHENTICATE"}</span>
                <span>→</span>
              </button>
            </form>
          </div>

          {/* System Integrity Bottom Banner */}
          <div className="integrity-banner">
            <div className="integrity-overlay">
              <div className="integrity-title">SYSTEM INTEGRITY</div>
              <div className="integrity-sub">All access attempts are logged and monitored securely.</div>
            </div>
          </div>
        </div>

        {/* Right Column: Data Archival Operations Panel */}
        <div className="archival-panel">
          {!isAuthenticated && (
            <div className="archival-lock-overlay">
              <div className="archival-lock-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#052e1e" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "#111827" }}>
                  Restricted Area
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: "260px", marginTop: "0.25rem" }}>
                  Authentication required to access archival management protocols.
                </div>
              </div>
            </div>
          )}

          {/* Export Corporate Backup */}
          <div style={{ background: "var(--bg-sand-light)", borderRadius: "var(--radius-md)", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "#526356", textTransform: "uppercase" }}>
                Data Archival Operations
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", color: "#111827", marginTop: "0.2rem" }}>
                Corporate Backup
              </div>
              <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                Create a complete JSON snapshot of current reserve database state, including habitats, species records, and staff schedules.
              </div>
            </div>

            <button
              className="portal-btn-auth"
              style={{ background: "#053b27", alignSelf: "flex-start" }}
              onClick={handleExport}
              disabled={downloading}
            >
              <span>{downloading ? "GENERATING ARCHIVE..." : "EXPORT DATABASE JSON"}</span>
              <span>↓</span>
            </button>
          </div>

          {/* Restore System */}
          <div style={{ background: "var(--bg-sand-light)", borderRadius: "var(--radius-md)", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", color: "#111827" }}>
                Restore System
              </div>
              <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                Upload a snapshot JSON file to replace current database state. Warning: This action overwrites active records.
              </div>
            </div>

            <input
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
              style={{ fontSize: "0.85rem" }}
            />

            {parsedData && (
              <div style={{ background: "#ffffff", padding: "0.85rem 1rem", borderRadius: "var(--radius-sm)", fontSize: "0.82rem", color: "#166534" }}>
                ✓ Verified: {parsedData.enclosures.length} enclosures & {parsedData.occupants.length} occupants in {selectedFile?.name}.
              </div>
            )}

            <button
              className="portal-btn-auth"
              style={{ background: "#854d0e", alignSelf: "flex-start" }}
              onClick={handleRestore}
              disabled={!parsedData || restoring}
            >
              <span>{restoring ? "RESTORING PROTOCOLS..." : "EXECUTE DATABASE RESTORE"}</span>
              <span>⚡</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
