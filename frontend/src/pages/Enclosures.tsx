import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Enclosure, Occupant } from "../api/types";
import { AddOccupantModal } from "../components/AddOccupantModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Banner } from "../components/Banner";
import "./Enclosures.css";

// Habitat photography cover maps
const HABITAT_IMAGES: Record<string, string> = {
  "Savannah Alpha": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80",
  "Primate Canopy A": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  "Riverine Delta": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  "Enclosure A1": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80",
  "Enclosure A2": "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=600&q=80",
  "Enclosure B1": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80",
  "Enclosure B2": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  "Enclosure C1": "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=600&q=80",
};

// Animal thumbnail avatars
const ANIMAL_AVATARS: Record<string, string> = {
  "African Lion": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=150&q=80",
  "Hippopotamus amphibius": "https://images.unsplash.com/photo-1568283096533-0dd839c3bf88?auto=format&fit=crop&w=150&q=80",
  "Plains Zebra": "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=150&q=80",
  "African Elephant": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=150&q=80",
  "Macaw": "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=150&q=80",
};

export function Enclosures() {
  const { isAuthenticated } = useAuth();
  const [enclosures, setEnclosures] = useState<Enclosure[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modals
  const [addTarget, setAddTarget] = useState<Enclosure | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Enclosure | null>(null);
  const [removing, setRemoving] = useState(false);

  async function load() {
    try {
      const data = await api.get<{ results: Enclosure[] }>("/enclosures/");
      setEnclosures(data.results);
    } catch {
      setError("Couldn't load habitat enclosures.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleCreated(_occupant: Occupant) {
    setAddTarget(null);
    setSuccess(`${_occupant.name} added to reserve habitat.`);
    load();
    window.setTimeout(() => setSuccess(null), 4000);
  }

  async function confirmRemove() {
    if (!removeTarget?.current_occupant) return;
    setRemoving(true);
    try {
      await api.patch(`/occupants/${removeTarget.current_occupant.id}/remove/`, undefined, true);
      setSuccess(`${removeTarget.current_occupant.name} removed. Habitat marked vacant.`);
      setRemoveTarget(null);
      load();
      window.setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't remove occupant.");
      setRemoveTarget(null);
    } finally {
      setRemoving(false);
    }
  }

  if (!enclosures) {
    return (
      <div className="ui-page">
        <p style={{ color: "var(--text-secondary)" }}>Loading Habitat Occupancy…</p>
      </div>
    );
  }

  const filtered = enclosures.filter((enc) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      enc.name.toLowerCase().includes(q) ||
      (enc.section && enc.section.toLowerCase().includes(q)) ||
      (enc.current_occupant &&
        (enc.current_occupant.name.toLowerCase().includes(q) ||
          enc.current_occupant.species.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="ui-page">
      {/* Top Header Row matching Reference Screenshot 2 */}
      <div className="enclosures-header-row">
        <div>
          <h1 className="ui-page__title">Enclosures Overview</h1>
          <p className="ui-page__subtitle">
            Manage and monitor habitat occupancy across the reserve.
            {!isAuthenticated && (
              <span>
                {" "}
                <Link to="/login" style={{ color: "var(--btn-brown)", fontWeight: 700 }}>
                  Log in as Staff
                </Link>{" "}
                to manage.
              </span>
            )}
          </p>
        </div>

        <div className="enclosures-search-bar">
          <div className="search-pill-input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search enclosures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="filter-pill-btn" onClick={() => setSearch("")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>FILTER</span>
          </button>
        </div>
      </div>

      {error && <Banner kind="error">{error}</Banner>}
      {success && <Banner kind="success">{success}</Banner>}

      {/* Grid of Habitat Cards */}
      <div className="habitat-grid">
        {filtered.map((enc) => {
          const coverImg =
            HABITAT_IMAGES[enc.name] ||
            "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80";
          const animalImg =
            enc.current_occupant && ANIMAL_AVATARS[enc.current_occupant.species]
              ? ANIMAL_AVATARS[enc.current_occupant.species]
              : "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=150&q=80";

          return (
            <div key={enc.id} className="habitat-card">
              {/* Cover Photo */}
              <div
                className="habitat-card__cover"
                style={{ backgroundImage: `url(${coverImg})` }}
              >
                <div className="habitat-card__cover-overlay" />
                <div className="habitat-card__cover-content">
                  <div className="habitat-card__cover-top">
                    {enc.is_occupied ? (
                      <span className="habitat-card__badge-occupied">
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                        OCCUPIED
                      </span>
                    ) : (
                      <span className="habitat-card__badge-vacant">
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#64748b" }} />
                        VACANT
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="habitat-card__sector">
                      {enc.section || "NORTH SECTOR"}
                    </div>
                    <div className="habitat-card__title">{enc.name}</div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="habitat-card__body">
                {enc.current_occupant ? (
                  <>
                    <div className="habitat-occupant-row">
                      <img
                        src={animalImg}
                        alt={enc.current_occupant.name}
                        className="habitat-animal-thumb"
                      />
                      <div>
                        <div className="habitat-animal-name">
                          {enc.current_occupant.name}
                        </div>
                        <div className="habitat-animal-species">
                          {enc.current_occupant.species}
                        </div>
                      </div>
                    </div>

                    <div className="habitat-tags">
                      <span
                        className={`tag-badge ${
                          enc.current_occupant.diet_category === "HERBIVORE"
                            ? "tag-badge--herbivore"
                            : "tag-badge--carnivore"
                        }`}
                      >
                        {enc.current_occupant.diet_category === "HERBIVORE" ? "🌿" : "🥩"}{" "}
                        {enc.current_occupant.diet_category}
                      </span>
                      <span className="tag-badge tag-badge--tan">
                        📦 {enc.current_occupant.food_type}
                      </span>
                    </div>

                    {isAuthenticated ? (
                      <button
                        className="btn-remove-occupant"
                        onClick={() => setRemoveTarget(enc)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>REMOVE OCCUPANT</span>
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="btn-remove-occupant"
                        style={{ background: "#475569", textDecoration: "none" }}
                      >
                        STAFF LOGIN TO MANAGE
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <div className="habitat-vacant-content">
                      <div className="habitat-vacant-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                        </svg>
                      </div>
                      <div className="habitat-vacant-title">Habitat Ready</div>
                      <div className="habitat-vacant-sub">
                        Cleared for new arrivals. Maintenance scheduled completed.
                      </div>
                    </div>

                    {isAuthenticated ? (
                      <button
                        className="btn-add-occupant"
                        onClick={() => setAddTarget(enc)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h6v6" />
                          <path d="M10 14 21 3" />
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        </svg>
                        <span>ADD OCCUPANT</span>
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="btn-add-occupant"
                        style={{ background: "#475569", textDecoration: "none" }}
                      >
                        STAFF LOGIN TO ADD
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {addTarget && (
        <AddOccupantModal
          enclosure={addTarget}
          onClose={() => setAddTarget(null)}
          onCreated={handleCreated}
        />
      )}

      {removeTarget && (
        <ConfirmDialog
          title={`Remove ${removeTarget.current_occupant?.name}?`}
          message={`This marks ${removeTarget.name} as vacant. The habitat will be cleared.`}
          confirmLabel={removing ? "Removing…" : "REMOVE OCCUPANT"}
          danger
          onConfirm={confirmRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
