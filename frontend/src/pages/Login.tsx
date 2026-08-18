import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Banner } from "../components/Banner";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("ChangeMe123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate("/enclosures");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ui-page" style={{ display: "flex", justifyContent: "center", paddingTop: "3rem" }}>
      <div className="portal-login-card" style={{ width: "100%", maxWidth: "420px" }}>
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

        {error && <Banner kind="error">{error}</Banner>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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

          <div style={{ background: "#ffffff", padding: "0.6rem 0.85rem", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", color: "#526356" }}>
            🔑 Seeded Admin: <span className="mono" style={{ fontWeight: 700 }}>admin</span> / <span className="mono" style={{ fontWeight: 700 }}>ChangeMe123!</span>
          </div>

          <button type="submit" className="portal-btn-auth" disabled={loading}>
            <span>{loading ? "AUTHENTICATING..." : "AUTHENTICATE"}</span>
            <span>→</span>
          </button>
        </form>
      </div>
    </div>
  );
}
