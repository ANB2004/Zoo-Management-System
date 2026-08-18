import { IconHerbivore, IconCarnivore } from "./Icons";
import "./StatusStamp.css";

export function StatusStamp({ occupied }: { occupied: boolean }) {
  return (
    <div className={`status-stamp ${occupied ? "status-stamp--occupied" : "status-stamp--vacant"}`}>
      <span className="status-stamp__dot" />
      <span>{occupied ? "Occupied" : "Vacant"}</span>
    </div>
  );
}

export function DietTag({ category }: { category: "HERBIVORE" | "CARNIVORE" | string }) {
  const isHerbivore = category === "HERBIVORE";
  return (
    <div className={`diet-tag ${isHerbivore ? "diet-tag--herbivore" : "diet-tag--carnivore"}`}>
      {isHerbivore ? <IconHerbivore size={14} /> : <IconCarnivore size={14} />}
      <span>{isHerbivore ? "Herbivore" : "Carnivore"}</span>
    </div>
  );
}
