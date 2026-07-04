import { escapeHtml } from "../utils/format.js";

const citationNote = document.querySelector("#citation-note");
const citationChart = document.querySelector("#citation-chart");
const citationYears = document.querySelector("#citation-years");

const applyCitationMetrics = (metrics) => {
  Object.entries(metrics.table || {}).forEach(([key, value]) => {
    const target = document.querySelector(`[data-citation-value="${key}"]`);

    if (target) {
      target.textContent = value || "-";
    }
  });

  if (citationChart && metrics.yearly?.length) {
    const maxCount = Math.max(...metrics.yearly.map((item) => item.count), 1);
    citationChart.innerHTML = metrics.yearly
      .map(
        (item) => `
          <span style="--bar-height: ${Math.max(8, Math.round((item.count / maxCount) * 100))}%"></span>
        `,
      )
      .join("");
  }

  if (citationYears && metrics.yearly?.length) {
    citationYears.innerHTML = metrics.yearly.map((item) => `<span>${escapeHtml(item.year)}</span>`).join("");
  }

  if (citationNote) {
    const updatedAt = metrics.updatedAt ? ` Last updated: ${metrics.updatedAt}.` : "";
    citationNote.textContent = `${metrics.note || "Updated from local citation data."}${updatedAt}`;
  }
};

const fallbackCitationMetrics = {
  table: {
    "citations-all": "169",
    "citations-recent": "168",
    "h-all": "8",
    "h-recent": "8",
    "i10-all": "7",
    "i10-recent": "7",
  },
  yearly: [
    { year: "2020", count: 1 },
    { year: "2021", count: 16 },
    { year: "2022", count: 17 },
    { year: "2023", count: 31 },
    { year: "2024", count: 33 },
    { year: "2025", count: 38 },
    { year: "2026", count: 35 },
  ],
  updatedAt: "2026-07-02",
  note: "Citation metrics are manually updated from Google Scholar.",
};

export const loadScholarMetrics = async () => {
  if (!citationNote) {
    return;
  }

  try {
    const response = await fetch("citations.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Citation data file could not be loaded.");
    }

    const metrics = await response.json();
    applyCitationMetrics(metrics);
  } catch (error) {
    applyCitationMetrics(fallbackCitationMetrics);
  }
};
