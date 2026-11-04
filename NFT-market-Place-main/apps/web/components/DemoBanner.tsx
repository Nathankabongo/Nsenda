"use client";

import React from "react";

export function DemoBanner() {
  return (
    <aside
      aria-label="Avertissement environnement de démonstration"
      className="w-full border-b border-[#E8E1D5] bg-[#F4EFE6] px-4 py-1.5 text-center text-[11px] font-medium text-[#6B5E55]"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C86D3B] shrink-0" />
        <span>
          Prototype universitaire : réseau de test Polygon Amoy, jetons STT sans valeur réelle, œuvres fictives.
        </span>
      </div>
    </aside>
  );
}
