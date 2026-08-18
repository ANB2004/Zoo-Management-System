import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { DailyFoodTotal } from "../api/types";
import { Banner } from "../components/Banner";
import "./FoodSummary.css";

export function FoodSummary() {
  const [data, setData] = useState<DailyFoodTotal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<DailyFoodTotal>("/feeding/daily-total/");
        setData(res);
      } catch {
        setError("Couldn't calculate daily food totals.");
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

  if (!data) {
    return (
      <div className="ui-page">
        <p style={{ color: "var(--text-secondary)" }}>Loading Food Inventory Summary…</p>
      </div>
    );
  }

  const totalKg = data.total_kg;
  const herbivoreKg = data.by_diet_category.HERBIVORE ?? 0;
  const carnivoreKg = data.by_diet_category.CARNIVORE ?? 0;
  const foodTypeEntries = Object.entries(data.by_food_type);

  return (
    <div className="ui-page">
      <div className="feeding-top-row">
        <div>
          <h1 className="ui-page__title">Feeding Management</h1>
          <p className="ui-page__subtitle">Daily Schedule & Inventory Summary</p>
        </div>

        <div className="tab-pill-switch">
          <Link to="/feeding-schedule" className="tab-pill-btn">
            Schedule
          </Link>
          <Link to="/food-summary" className="tab-pill-btn tab-pill-btn--active">
            Summary
          </Link>
        </div>
      </div>

      {/* Main KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ background: "var(--bg-sand)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#526356", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            TOTAL DAILY PROVISION
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.75rem", color: "#111827", marginTop: "0.5rem" }}>
            {totalKg.toFixed(0)} kg
          </div>
        </div>

        <div style={{ background: "#d1fae5", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#065f46", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            HERBIVORE REQUIREMENT
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.75rem", color: "#065f46", marginTop: "0.5rem" }}>
            {herbivoreKg.toFixed(0)} kg
          </div>
        </div>

        <div style={{ background: "#fee2e2", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#991b1b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            CARNIVORE REQUIREMENT
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.75rem", color: "#991b1b", marginTop: "0.5rem" }}>
            {carnivoreKg.toFixed(0)} kg
          </div>
        </div>
      </div>

      {/* Breakdown by Food Type */}
      <div style={{ background: "var(--bg-sand-light)", borderRadius: "var(--radius-md)", padding: "1.75rem" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", marginBottom: "1.25rem" }}>
          Ration Breakdown by Item
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {foodTypeEntries.map(([foodType, qty]) => (
            <div
              key={foodType}
              style={{ background: "#ffffff", borderRadius: "var(--radius-sm)", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div style={{ fontWeight: 600, color: "#111827" }}>{foodType}</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#053b27" }}>
                {qty.toFixed(0)} kg
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
