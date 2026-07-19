import { morphologies } from "../data/morphologies.js";
import {
  surfaceAreaCalculators,
  volumeCalculators,
  surfaceToVolumeCalculators,
} from "../utils/geometry-formulas.js";
import { renderMorphologyDiagram } from "../utils/morphology-diagrams.js";

const morphologySelect = document.querySelector("#morphology-select");
const morphologyParams = document.querySelector("#morphology-params");
const morphologyDiagram = document.querySelector("#morphology-diagram");
const surfaceVolumeOutput = document.querySelector("#surface-volume-output");

const getSelectedMorphology = () => morphologies.find((morphology) => morphology.id === morphologySelect.value);

const readParamValues = (morphology) => {
  const values = {};
  morphology.params.forEach((param) => {
    const input = morphologyParams.querySelector(`[name="${param.key}"]`);
    values[param.key] = Number(input.value);
  });
  return values;
};

const renderOutput = () => {
  const morphology = getSelectedMorphology();
  if (!morphology || !surfaceVolumeOutput) {
    return;
  }

  const params = readParamValues(morphology);
  const surfaceArea = surfaceAreaCalculators[morphology.id](params);
  const volume = volumeCalculators[morphology.id](params);
  const ratio = surfaceToVolumeCalculators[morphology.id](params);

  surfaceVolumeOutput.innerHTML = `
    <div>
      <dt>Surface area</dt>
      <dd>${surfaceArea.toFixed(2)} nm&sup2;</dd>
    </div>
    <div>
      <dt>Volume</dt>
      <dd>${volume.toFixed(2)} nm&sup3;</dd>
    </div>
    <div>
      <dt>Surface-to-volume ratio</dt>
      <dd>${ratio.toFixed(3)} nm&#8315;&sup1;</dd>
    </div>
  `;
};

const renderDiagram = (morphology) => {
  if (!morphologyDiagram) {
    return;
  }

  morphologyDiagram.innerHTML = renderMorphologyDiagram(morphology.id);
};

const renderParamInputs = () => {
  const morphology = getSelectedMorphology();
  if (!morphology || !morphologyParams) {
    return;
  }

  renderDiagram(morphology);

  morphologyParams.innerHTML = morphology.params
    .map(
      (param) => `
        <label class="param-field">
          <span>${param.label} (${param.unit})</span>
          <input
            type="range"
            name="${param.key}"
            min="${param.min}"
            max="${param.max}"
            step="${param.step}"
            value="${param.default}"
          />
          <output>${param.default} ${param.unit}</output>
        </label>
      `,
    )
    .join("");

  morphology.params.forEach((param) => {
    const input = morphologyParams.querySelector(`[name="${param.key}"]`);
    const output = input.nextElementSibling;

    input.addEventListener("input", () => {
      output.textContent = `${Number(input.value).toFixed(1)} ${param.unit}`;
      renderOutput();
    });
  });

  renderOutput();
};

const populateMorphologySelect = () => {
  if (!morphologySelect) {
    return;
  }

  morphologySelect.innerHTML = morphologies
    .map((morphology) => `<option value="${morphology.id}">${morphology.label}</option>`)
    .join("");
};

export const initSurfaceVolumeCalculator = () => {
  if (!morphologySelect || !morphologyParams) {
    return;
  }

  populateMorphologySelect();
  renderParamInputs();

  morphologySelect.addEventListener("change", renderParamInputs);
};
