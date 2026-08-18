import React from "react";
import { IconCheck, IconAlert } from "./Icons";
import "./Banner.css";

interface BannerProps {
  kind: "error" | "success" | "info";
  children: React.ReactNode;
}

export function Banner({ kind, children }: BannerProps) {
  return (
    <div className={`glass-banner glass-banner--${kind}`}>
      <div className="glass-banner__icon">
        {kind === "success" ? <IconCheck size={18} /> : <IconAlert size={18} />}
      </div>
      <div className="glass-banner__content">{children}</div>
    </div>
  );
}
