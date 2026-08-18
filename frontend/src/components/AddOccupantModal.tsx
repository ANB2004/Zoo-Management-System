import React, { useState } from "react";
import { api, ApiError } from "../api/client";
import type { Enclosure, Occupant } from "../api/types";
import { IconHerbivore, IconCarnivore, IconX, IconPlus, IconSparkles } from "./Icons";
import { Banner } from "./Banner";
import "./AddOccupantModal.css";

interface AddOccupantModalProps {
  enclosure: Enclosure;
  onClose: () => void;
  onCreated: (occupant: Occupant) => void;
}

const SPECIES_PRESETS = [
  "African Lion",
  "Bengal Tiger",
  "Plains Zebra",
  "African Elephant",
  "Red Panda",
  "Blue Macaw",
  "Giraffe",
  "Snow Leopard",
];

const FOOD_PRESETS_HERBIVORE = ["Hay & Fruits", "Fresh Leaves & Grass", "Fruits & Seeds", "Grain & Vegetables"];
const FOOD_PRESETS_CARNIVORE = ["Raw Meat & Poultry", "Beef & Fish", "Whole Prey Diet", "Fresh Meat & Bone"];

export function AddOccupantModal({ enclosure, onClose, onCreated }: AddOccupantModalProps) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [dietCategory, setDietCategory] = useState<"HERBIVORE" | "CARNIVORE">("HERBIVORE");
  const [foodType, setFoodType] = useState("Hay & Fruits");
  const [quantity, setQuantity] = useState("5.0");
  const [feedingTimes, setFeedingTimes] = useState<string[]>(["08:00", "17:00"]);
  const [newTime, setNewTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFeedingTime(t: string) {
    const formatted = t.trim();
    if (!formatted) return;
    if (feedingTimes.includes(formatted)) return;
    setFeedingTimes([...feedingTimes, formatted].sort());
    setNewTime("");
  }

  function removeFeedingTime(t: string) {
    setFeedingTimes(feedingTimes.filter((item) => item !== t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter the occupant's name.");
    if (!species.trim()) return setError("Please enter the species.");
    if (!foodType.trim()) return setError("Please enter the food type.");
    if (feedingTimes.length === 0) return setError("Please add at least one feeding time.");

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return setError("Please enter a valid food quantity in kg.");

    setLoading(true);
    setError(null);

    try {
      const payload = {
        enclosure: enclosure.id,
        name: name.trim(),
        species: species.trim(),
        diet_category: dietCategory,
        food_type: foodType.trim(),
        quantity_per_feeding_kg: qty.toFixed(2),
        feedings_per_day: feedingTimes.length,
        feeding_times: feedingTimes,
      };

      const created = await api.post<Occupant>("/occupants/", payload, true);
      onCreated(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to log occupant. Is staff authorized?");
    } finally {
      setLoading(false);
    }
  }

  const totalDailyKg = (parseFloat(quantity) || 0) * feedingTimes.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Log New Occupant</h2>
            <div className="modal-subtitle">
              Assigning animal to <span className="mono" style={{ color: "var(--accent-emerald-light)" }}>{enclosure.name}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <Banner kind="error">{error}</Banner>}

            {/* Diet Category */}
            <div className="form-group">
              <label className="form-label">
                <span>Diet Category</span>
                <span className="form-hint">Requirement option</span>
              </label>
              <div className="diet-selector">
                <button
                  type="button"
                  className={`diet-option diet-option--herbivore ${dietCategory === "HERBIVORE" ? "diet-option--active" : ""}`}
                  onClick={() => {
                    setDietCategory("HERBIVORE");
                    setFoodType(FOOD_PRESETS_HERBIVORE[0]);
                  }}
                >
                  <IconHerbivore size={18} />
                  <span>Herbivore (Plants)</span>
                </button>

                <button
                  type="button"
                  className={`diet-option diet-option--carnivore ${dietCategory === "CARNIVORE" ? "diet-option--active" : ""}`}
                  onClick={() => {
                    setDietCategory("CARNIVORE");
                    setFoodType(FOOD_PRESETS_CARNIVORE[0]);
                  }}
                >
                  <IconCarnivore size={18} />
                  <span>Carnivore (Meat)</span>
                </button>
              </div>
            </div>

            {/* Animal Name & Species */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Occupant Name</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Ellie, Leo, Ziggy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Species</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. African Elephant"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Species Quick Suggestions */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <IconSparkles size={14} color="var(--accent-emerald)" /> Species Presets
              </label>
              <div className="preset-chips">
                {SPECIES_PRESETS.map((s) => (
                  <button key={s} type="button" className="chip-btn" onClick={() => setSpecies(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Type */}
            <div className="form-group">
              <label className="form-label">Food Type</label>
              <input
                type="text"
                className="glass-input"
                placeholder="e.g. Hay, Raw Meat, Seeds"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                required
              />
              <div className="preset-chips" style={{ marginTop: "0.3rem" }}>
                {(dietCategory === "HERBIVORE" ? FOOD_PRESETS_HERBIVORE : FOOD_PRESETS_CARNIVORE).map((preset) => (
                  <button key={preset} type="button" className="chip-btn" onClick={() => setFoodType(preset)}>
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity per feeding */}
            <div className="form-group">
              <label className="form-label">Quantity per Feeding (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="glass-input mono"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            {/* Feeding Times */}
            <div className="form-group">
              <label className="form-label">
                <span>Feeding Times Today ({feedingTimes.length} times/day)</span>
              </label>
              <div className="time-chips-container">
                {feedingTimes.map((t) => (
                  <div key={t} className="time-chip">
                    <span>{t}</span>
                    <button type="button" className="time-chip__remove" onClick={() => removeFeedingTime(t)}>
                      <IconX size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="time-input-row" style={{ marginTop: "0.5rem" }}>
                <input
                  type="time"
                  className="glass-input mono"
                  style={{ width: "140px" }}
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
                <button
                  type="button"
                  className="glass-button glass-button--secondary"
                  onClick={() => addFeedingTime(newTime)}
                >
                  <IconPlus size={16} /> Add Time
                </button>
              </div>

              <div className="preset-chips" style={{ marginTop: "0.5rem" }}>
                {["07:00", "09:00", "12:00", "15:00", "18:00"].map((pt) => (
                  <button key={pt} type="button" className="chip-btn" onClick={() => addFeedingTime(pt)}>
                    +{pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Total Math Box */}
            <div className="math-box">
              <span>Total Calculated Daily Requirement:</span>
              <span className="math-box__highlight">{totalDailyKg.toFixed(2)} kg / day</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="glass-button glass-button--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="glass-button glass-button--primary" disabled={loading}>
              {loading ? "Logging Occupant…" : "Save & Assign Occupant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
