import { materials } from "../data/materials.js";
import { computeBandgapEv, isWithinValidRange } from "../utils/brus-equation.js";
import { bandgapToEmission } from "../utils/wavelength-color.js";
import { createLinearScale, buildPolylinePath, sampleRange } from "../utils/chart-math.js";

const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;
const CHART_PADDING = 24;
const CURVE_SAMPLE_COUNT = 30;

const materialSelect = document.querySelector("#material-select");
const radiusSlider = document.querySelector("#radius-slider");
const radiusValue = document.querySelector("#radius-value");
const quantumOutput = document.querySelector("#quantum-output");
const emissionSwatch = document.querySelector("#emission-swatch");
const rangeWarning = document.querySelector("#quantum-range-warning");
const referenceNote = document.querySelector("#material-reference-note");
const chartContainer = document.querySelector("#bandgap-curve-chart");

const getSelectedMaterial = () => materials.find((material) => material.id === materialSelect.value);

const renderChart = (material, radiusNm) => {
  if (!chartContainer) {
    return;
  }

  const [minNm, maxNm] = material.validRadiusNm;
  const radii = sampleRange([minNm, maxNm], CURVE_SAMPLE_COUNT);
  const bandgaps = radii.map((radiusSampleNm) => computeBandgapEv({ radiusNm: radiusSampleNm, ...material }));

  const xScale = createLinearScale([minNm, maxNm], [CHART_PADDING, CHART_WIDTH - CHART_PADDING]);
  const yScale = createLinearScale(
    [Math.min(...bandgaps), Math.max(...bandgaps)],
    [CHART_HEIGHT - CHART_PADDING, CHART_PADDING],
  );

  const points = radii.map((radiusSampleNm, index) => ({
    x: xScale(radiusSampleNm),
    y: yScale(bandgaps[index]),
  }));

  const currentBandgapEv = computeBandgapEv({ radiusNm, ...material });
  const markerX = xScale(radiusNm);
  const markerY = yScale(currentBandgapEv);

  chartContainer.innerHTML = `
    <svg viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}" role="img" aria-label="Bandgap versus radius curve">
      <path d="${buildPolylinePath(points)}"></path>
      <circle cx="${markerX.toFixed(2)}" cy="${markerY.toFixed(2)}" r="4"></circle>
      <text x="${CHART_PADDING}" y="${CHART_HEIGHT - 6}">${minNm} nm</text>
      <text x="${CHART_WIDTH - CHART_PADDING}" y="${CHART_HEIGHT - 6}" text-anchor="end">${maxNm} nm</text>
    </svg>
  `;
};

const renderOutput = () => {
  const material = getSelectedMaterial();
  if (!material || !radiusSlider) {
    return;
  }

  const radiusNm = Number(radiusSlider.value);
  if (radiusValue) {
    radiusValue.textContent = `${radiusNm.toFixed(1)} nm`;
  }

  const bandgapEv = computeBandgapEv({ radiusNm, ...material });
  const emission = bandgapToEmission(bandgapEv);
  const inRange = isWithinValidRange(radiusNm, material.validRadiusNm);

  if (quantumOutput) {
    quantumOutput.innerHTML = `
      <div>
        <dt>Bandgap</dt>
        <dd>${bandgapEv.toFixed(3)} eV</dd>
      </div>
      <div>
        <dt>Emission wavelength</dt>
        <dd>${emission.visible ? `${emission.wavelengthNm.toFixed(0)} nm` : emission.colorName}</dd>
      </div>
      <div>
        <dt>Estimated color</dt>
        <dd>${emission.visible ? emission.colorName : `${emission.colorName} (outside visible range)`}</dd>
      </div>
    `;
  }

  if (emissionSwatch) {
    emissionSwatch.style.backgroundColor = emission.visible
      ? `rgb(${emission.rgb.r}, ${emission.rgb.g}, ${emission.rgb.b})`
      : "transparent";
    emissionSwatch.classList.toggle("is-non-visible", !emission.visible);
  }

  if (rangeWarning) {
    rangeWarning.hidden = inRange;
  }

  if (referenceNote) {
    referenceNote.textContent = material.referenceNote;
  }

  renderChart(material, radiusNm);
};

const populateMaterialSelect = () => {
  if (!materialSelect) {
    return;
  }

  materialSelect.innerHTML = materials
    .map((material) => `<option value="${material.id}">${material.label}</option>`)
    .join("");
};

const syncRadiusSliderToMaterial = () => {
  const material = getSelectedMaterial();
  if (!material || !radiusSlider) {
    return;
  }

  const [minNm, maxNm] = material.validRadiusNm;
  radiusSlider.min = String(minNm);
  radiusSlider.max = String(maxNm);
  radiusSlider.step = "0.1";
  radiusSlider.value = String(material.defaultRadiusNm ?? (minNm + maxNm) / 2);
};

export const initQuantumConfinementCalculator = () => {
  if (!materialSelect || !radiusSlider) {
    return;
  }

  populateMaterialSelect();
  syncRadiusSliderToMaterial();
  renderOutput();

  materialSelect.addEventListener("change", () => {
    syncRadiusSliderToMaterial();
    renderOutput();
  });

  radiusSlider.addEventListener("input", renderOutput);
};
