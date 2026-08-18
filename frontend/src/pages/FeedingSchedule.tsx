import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { FeedingEvent } from "../api/types";
import { Banner } from "../components/Banner";
import "./FeedingSchedule.css";

export function FeedingSchedule() {
  const [events, setEvents] = useState<FeedingEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dietFilter, setDietFilter] = useState<"ALL" | "HERBIVORE" | "CARNIVORE">("ALL");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<FeedingEvent[]>("/feeding/schedule/");
        setEvents(data);
      } catch {
        setError("Couldn't load daily feeding schedule.");
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <div className="ui-page">
        <Banner kind="error">{error}</Banner>
      </div>
    );
  }

  if (!events) {
    return (
      <div className="ui-page">
        <p style={{ color: "var(--text-secondary)" }}>Loading Daily Feeding Schedule…</p>
      </div>
    );
  }

  const filtered = events.filter((ev) => {
    if (dietFilter === "HERBIVORE") return ev.diet_category === "HERBIVORE";
    if (dietFilter === "CARNIVORE") return ev.diet_category === "CARNIVORE";
    return true;
  });

  return (
    <div className="ui-page">
      {/* Top Title & Tab Switch matching Reference Screenshot 3 */}
      <div className="feeding-top-row">
        <div>
          <h1 className="ui-page__title">Feeding Management</h1>
          <p className="ui-page__subtitle">Daily Schedule & Inventory Summary</p>
        </div>

        <div className="tab-pill-switch">
          <Link to="/feeding-schedule" className="tab-pill-btn tab-pill-btn--active">
            Schedule
          </Link>
          <Link to="/food-summary" className="tab-pill-btn">
            Summary
          </Link>
        </div>
      </div>

      {/* Filter Diet Container */}
      <div className="diet-filter-box">
        <span className="diet-filter-label">FILTER DIET:</span>
        <button
          className={`diet-filter-btn ${dietFilter === "ALL" ? "diet-filter-btn--active" : ""}`}
          onClick={() => setDietFilter("ALL")}
        >
          All
        </button>
        <button
          className={`diet-filter-btn ${dietFilter === "HERBIVORE" ? "diet-filter-btn--active" : ""}`}
          onClick={() => setDietFilter("HERBIVORE")}
        >
          Herbivore
        </button>
        <button
          className={`diet-filter-btn ${dietFilter === "CARNIVORE" ? "diet-filter-btn--active" : ""}`}
          onClick={() => setDietFilter("CARNIVORE")}
        >
          Carnivore
        </button>
      </div>

      {/* Timeline View matching Screenshot 3 */}
      <div className="timeline-container">
        <div className="timeline-stem-line" />

        {filtered.map((ev, idx) => {
          const isHerbivore = ev.diet_category === "HERBIVORE";
          return (
            <div key={`${ev.occupant_id}-${ev.time}-${idx}`} className="timeline-item">
              <span className="timeline-time-label">{ev.time}</span>
              <span
                className={`timeline-dot ${
                  isHerbivore ? "timeline-dot--herbivore" : "timeline-dot--carnivore"
                }`}
              />

              <div className="timeline-card">
                <div
                  className={`timeline-card__stripe ${
                    isHerbivore
                      ? "timeline-card__stripe--herbivore"
                      : "timeline-card__stripe--carnivore"
                  }`}
                />

                <div className="timeline-card__content">
                  <div className="timeline-card__head">
                    <h3 className="timeline-card__title">{ev.occupant_name}</h3>
                    <span
                      className={`tag-badge ${
                        isHerbivore ? "tag-badge--herbivore" : "tag-badge--carnivore"
                      }`}
                    >
                      {isHerbivore ? "HERBIVORE" : "CARNIVORE"}
                    </span>
                  </div>

                  <div>
                    <div className="timeline-card__ration-label">RATION</div>
                    <div className="timeline-card__ration-text">{ev.food_type}</div>
                  </div>
                </div>

                <div className="timeline-card__right">
                  <span className="timeline-location-tag">
                    📍 {ev.enclosure}
                  </span>

                  <div className="timeline-quantity-box">
                    <div className="timeline-quantity-label">QUANTITY</div>
                    <div className="timeline-quantity-val">{ev.quantity_kg.toFixed(0)} kg</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
