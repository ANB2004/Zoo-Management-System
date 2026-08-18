import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { DailyFoodTotal, Enclosure } from "../api/types";
import { Banner } from "../components/Banner";
import "./Dashboard.css";

interface PageData {
  enclosure: { count: number; results: Enclosure[] };
  total: DailyFoodTotal;
}

export function Dashboard() {
  const [data, setData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function load() {
      try {
        const [enclosure, total] = await Promise.all([
          api.get<{ count: number; results: Enclosure[] }>("/enclosures/"),
          api.get<DailyFoodTotal>("/feeding/daily-total/"),
        ]);
        if (!cancelled) {
          setData({ enclosure, total });
          setLastUpdated(new Date());
        }
      } catch {
        if (!cancelled) setError("Couldn't load reserve stats. Is the server running?");
      }
    }

    // initial load
    load();

    // poll every 15s for live/updated totals
    timer = window.setInterval(() => {
      load();
    }, 15000);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, []);

  if (error) {
    return (
      <div className="ui-page">
        <Banner kind="error">{error}</Banner>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ui-page">
        <p style={{ color: "var(--text-secondary)" }}>Loading WildReserve Overview…</p>
      </div>
    );
  }

  const enclosures = data.enclosure.results;
  const occupiedCount = enclosures.filter((e) => e.is_occupied).length;
  const vacantCount = enclosures.length - occupiedCount;
  const totalKg = data.total.total_kg;

  const herbivoreKg = data.total.by_diet_category.HERBIVORE ?? 0;
  const carnivoreKg = data.total.by_diet_category.CARNIVORE ?? 0;
  const herbPercent = totalKg > 0 ? Math.round((herbivoreKg / totalKg) * 100) : 60;
  const carnPercent = totalKg > 0 ? 100 - herbPercent : 40;

  const foodTypeEntries = Object.entries(data.total.by_food_type);

  return (
    <div className="ui-page">
      <header className="ui-page__header">
        <h1 className="ui-page__title">Overview</h1>
        <p className="ui-page__subtitle">
          Real-time status of wild reserve enclosures and daily nutritional requirements.
        </p>
      </header>

      {/* Top 3 Summary Cards Row */}
      <div className="overview-grid">
        {/* Card 1: Total Enclosures (Light Sand) */}
        <div className="stat-card-sand">
          <div className="stat-card-sand__label">
            <span>TOTAL ENCLOSURES</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </div>
          <div className="stat-card-sand__value">{enclosures.length}</div>
          <div className="stat-card-sand__circle-bg" />
        </div>

        {/* Card 2: Occupancy (Dark Green) */}
        <div className="stat-card-green">
          <div className="stat-card-green__label">
            <span>OCCUPANCY</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="4" r="2" />
              <circle cx="18" cy="8" r="2" />
              <circle cx="20" cy="16" r="2" />
              <path d="M9 10a5 5 0 0 1 5 5v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a4 4 0 0 0-4-4H1.5" />
            </svg>
          </div>
          <div>
            <div className="stat-card-green__val-row">
              <span className="stat-card-green__num">{occupiedCount}</span>
              <span className="stat-card-green__unit">Active</span>
            </div>
            <div className="stat-card-green__progress">
              <div
                className="stat-card-green__bar"
                style={{ width: `${enclosures.length > 0 ? (occupiedCount / enclosures.length) * 100 : 0}%` }}
              />
            </div>
            <div className="stat-card-green__sub">{vacantCount} Vacant (Maintenance)</div>
          </div>
        </div>

        {/* Card 3: Daily Provisioning (Deep Green) */}
        <div className="stat-card-deep">
          <div className="stat-card-green__label">
            <span>DAILY PROVISIONING</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <div>
            <div className="stat-card-green__val-row">
              <span className="stat-card-green__num">{totalKg > 0 ? totalKg.toFixed(0) : "---"}</span>
              <span className="stat-card-green__unit">kg Required Today</span>
            </div>
          </div>
          <div className="stat-card-deep__watermark" />
        </div>
      </div>

      {/* Middle Section: Nutritional Distribution & Priority Action */}
      <div className="overview-middle">
        {/* Left Column: Nutritional Distribution (Fully Visible) */}
        <div>
          <div className="section-head">
            <h2 className="section-head__title">Nutritional Distribution</h2>
            <Link to="/feeding-schedule" className="section-head__link">
              View Full Schedule →
            </Link>
          </div>

          <div className="nutritional-box">
            {/* Sync Header Row */}
            <div className="nutritional-status-row">
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.05em", color: "#526356", textTransform: "uppercase" }}>
                  DAILY RATION ALLOCATION
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
                  {totalKg.toFixed(0)} kg Total Logistics Today
                </div>
              </div>

              <div className="nutritional-sync-badge">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#065f46" }} />
                <span>
                  LOGISTICS SYNC: ONLINE
                  {lastUpdated ? ` — ${lastUpdated.toLocaleTimeString()}` : ""}
                </span>
              </div>
            </div>

            {/* Ratio Progress Bar */}
            <div>
              <div className="nutritional-legend">
                <div className="nutritional-legend-item">
                  <span className="nutritional-dot--herbivore" />
                  <span style={{ color: "#065f46" }}>Herbivore Feed: {herbivoreKg.toFixed(0)} kg ({herbPercent}%)</span>
                </div>
                <div className="nutritional-legend-item">
                  <span className="nutritional-dot--carnivore" />
                  <span style={{ color: "#991b1b" }}>Carnivore Feed: {carnivoreKg.toFixed(0)} kg ({carnPercent}%)</span>
                </div>
              </div>

              <div className="nutritional-ratio-bar-container">
                <div className="nutritional-ratio-bar--herbivore" style={{ width: `${herbPercent}%` }} />
                <div className="nutritional-ratio-bar--carnivore" style={{ width: `${carnPercent}%` }} />
              </div>
            </div>

            {/* Ration Items Grid */}
            <div className="ration-items-grid">
              {foodTypeEntries.length > 0 ? (
                foodTypeEntries.map(([foodType, qty]) => (
                  <div key={foodType} className="ration-item-card">
                    <div>
                      <div className="ration-item-name">{foodType}</div>
                      <div className="ration-item-cat">Ration Stock Item</div>
                    </div>
                    <div className="ration-item-qty">{qty.toFixed(0)} kg</div>
                  </div>
                ))
              ) : (
                <>
                  <div className="ration-item-card">
                    <div>
                      <div className="ration-item-name">Hay & Produce</div>
                      <div className="ration-item-cat">Herbivore Base</div>
                    </div>
                    <div className="ration-item-qty">95 kg</div>
                  </div>
                  <div className="ration-item-card">
                    <div>
                      <div className="ration-item-name">Grade A Beef</div>
                      <div className="ration-item-cat">Carnivore Base</div>
                    </div>
                    <div className="ration-item-qty">50 kg</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Priority Action */}
        <div className="priority-column">
          <div className="section-head">
            <h2 className="section-head__title">Priority Action</h2>
          </div>

          {/* Low Inventory Alert */}
          <div className="alert-card-red">
            <div className="alert-card-red__head">
              <div className="alert-card-red__icon">!</div>
              <div className="alert-card-red__eyebrow">LOW INVENTORY ALERT</div>
            </div>

            <div className="alert-card-red__title">Carnivore Diet</div>

            <p className="alert-card-red__body">
              Current stock of Grade A Beef is projected to fall below minimum threshold within 48 hours. Recommend immediate resupply authorization.
            </p>

            <button className="alert-card-red__btn" onClick={() => alert("Resupply Order Authorized!")}>
              AUTHORIZE ORDER
            </button>
          </div>

          {/* Next Scheduled Event */}
          <div className="next-event-card">
            <div className="next-event-card__time">
              <span>14</span>
              <span className="next-event-card__time-sub">:00</span>
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "#526356", textTransform: "uppercase", marginBottom: "0.15rem" }}>
                NEXT SCHEDULED EVENT
              </div>
              <div className="next-event-card__title">Sector B Feeding</div>
              <div className="next-event-card__sub">Primate Enclosures 1-4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
