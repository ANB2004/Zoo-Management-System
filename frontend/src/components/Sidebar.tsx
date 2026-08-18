import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  IconDashboard,
  IconEnclosure,
  IconClock,
  IconScale,
  IconDownload,
  IconShield,
  IconMenu,
  IconX,
} from "./Icons";
import "./Sidebar.css";

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <IconX size={22} /> : <IconMenu size={22} />}
      </button>

      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        {/* WildReserve Logo */}
        <Link to="/" className="sidebar__brand" onClick={closeMobile}>
          <div className="sidebar__brand-logo">
            <img src="/logo.png" alt="Elephant & Leaf Conservation" className="sidebar__brand-img" />
          </div>
          <div className="sidebar__brand-title">WildReserve</div>
        </Link>

        {/* Navigation Items */}
        <nav className="sidebar__nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={closeMobile}
          >
            <IconDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/enclosures"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={closeMobile}
          >
            <IconEnclosure size={18} />
            Enclosures
          </NavLink>

          <NavLink
            to="/feeding-schedule"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={closeMobile}
          >
            <IconClock size={18} />
            Feeding Schedule
          </NavLink>

          <NavLink
            to="/food-summary"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={closeMobile}
          >
            <IconScale size={18} />
            Food Summary
          </NavLink>

          <NavLink
            to="/backup"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={closeMobile}
          >
            <IconDownload size={18} />
            System
          </NavLink>
        </nav>

        {/* Bottom Staff Zone Pill */}
        <div className="sidebar__footer">
          <div className="sidebar__staff-pill">
            <IconShield size={18} className="sidebar__staff-icon" />
            <div>
              <div className="sidebar__staff-title">Staff Zone</div>
              <div className="sidebar__staff-sub">ZOO MANAGEMENT</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
