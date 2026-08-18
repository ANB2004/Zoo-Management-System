import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

export function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__subtitle">
          Wilderness Conservation Portal v4.2
        </div>
      </div>

      <div className="app-header__controls">
        <div
          className={`app-header__status-badge ${
            isAuthenticated
              ? "app-header__status-badge--active"
              : "app-header__status-badge--guest"
          }`}
        >
          <span className="app-header__status-dot" />
          <span>{isAuthenticated ? "STAFF AUTHENTICATED" : "VISITOR MODE"}</span>
        </div>

        {isAuthenticated ? (
          <button className="app-header__auth-btn" onClick={logout}>
            STAFF LOGOUT
          </button>
        ) : (
          <Link to="/login" className="app-header__auth-btn">
            STAFF LOGIN
          </Link>
        )}

        <div className="app-header__user-avatar" title={isAuthenticated ? "Staff Warden" : "Visitor"}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </header>
  );
}
