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
    // citations.json을 불러오지 못하면 HTML에 하드코딩된 마지막 스냅샷 값을 그대로 노출한다.
  }
};
