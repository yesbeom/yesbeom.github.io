import { moleculePresets, DEFAULT_MOLECULE_PRESET_ID } from "../data/molecule-presets.js";
import { loadRDKit } from "../utils/rdkit-loader.js";
import { parseMolGraph } from "../utils/mol-json.js";
import { computeGasteigerCharges } from "../utils/gasteiger.js";
import { chargeToRgba, rgbaToCss, legendGradientCss } from "../utils/charge-color.js";

const presetSelect = document.querySelector("#molecule-preset-select");
const presetIupacNote = document.querySelector("#molecule-preset-iupac");
const smilesInput = document.querySelector("#smiles-input");
const renderButton = document.querySelector("#render-molecule-button");
const statusArea = document.querySelector("#electron-cloud-status");
const canvasWrap = document.querySelector("#electron-cloud-canvas-wrap");
const canvas = document.querySelector("#electron-cloud-canvas");
const tooltip = document.querySelector("#electron-cloud-tooltip");
const legendArea = document.querySelector("#electron-cloud-legend");
const outputList = document.querySelector("#electron-cloud-output");

const SUBSCRIPT_DIGITS = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄" };
const HOVER_RADIUS_PX = 14;

let rdkit = null;
let activated = false;
let current = null;
let screenPositions = [];

const setStatus = (html) => {
  if (statusArea) {
    statusArea.innerHTML = html;
  }
};

const setLoadingStatus = (message) => {
  setStatus(`
    <div class="loading-card">
      <span class="loading-spinner" aria-hidden="true"></span>
      <p>${message}</p>
    </div>
  `);
};

const setErrorStatus = (message, { retry = false } = {}) => {
  setStatus(`
    <div class="empty-state">
      <p>${message}</p>
      ${retry ? '<button class="button" type="button" id="electron-cloud-retry">다시 시도</button>' : ""}
    </div>
  `);

  const retryButton = statusArea?.querySelector("#electron-cloud-retry");
  retryButton?.addEventListener("click", () => {
    loadLibraryAndRender();
  });
};

const subscript = (count) =>
  String(count)
    .split("")
    .map((digit) => SUBSCRIPT_DIGITS[digit] ?? digit)
    .join("");

const atomLabelText = (atom) => {
  if (atom.implicitHs <= 0) {
    return atom.element;
  }
  return `${atom.element}H${atom.implicitHs > 1 ? subscript(atom.implicitHs) : ""}`;
};

const buildFormula = (atoms) => {
  const counts = {};
  atoms.forEach((atom) => {
    counts[atom.element] = (counts[atom.element] ?? 0) + 1;
    if (atom.implicitHs > 0) {
      counts.H = (counts.H ?? 0) + atom.implicitHs;
    }
  });

  const hillOrder = Object.keys(counts).sort((left, right) => {
    if (left === "C" || right === "C") {
      return left === "C" ? -1 : 1;
    }
    if (left === "H" || right === "H") {
      return left === "H" ? -1 : 1;
    }
    return left.localeCompare(right);
  });

  return hillOrder
    .map((element) => `${element}${counts[element] > 1 ? `<sub>${counts[element]}</sub>` : ""}`)
    .join("");
};

const isLabeledAtom = (atom, atomIndex, bonds) =>
  atom.element !== "C" ||
  atom.formalCharge !== 0 ||
  !bonds.some((bond) => bond.a === atomIndex || bond.b === atomIndex);

const computeTransform = (coords, cssWidth, cssHeight) => {
  const xs = coords.map((point) => point.x);
  const ys = coords.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const padding = Math.min(cssWidth, cssHeight) * 0.16;

  const scaleX = spanX > 1e-6 ? (cssWidth - 2 * padding) / spanX : Infinity;
  const scaleY = spanY > 1e-6 ? (cssHeight - 2 * padding) / spanY : Infinity;
  let scale = Math.min(scaleX, scaleY, 50);
  if (!Number.isFinite(scale) || scale <= 0) {
    scale = 40;
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    toScreen: (point) => ({
      x: cssWidth / 2 + (point.x - centerX) * scale,
      y: cssHeight / 2 - (point.y - centerY) * scale,
    }),
  };
};

const trimSegment = (from, to, trimFrom, trimTo) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length < 1e-6) {
    return { from, to };
  }
  const ux = dx / length;
  const uy = dy / length;
  return {
    from: { x: from.x + ux * trimFrom, y: from.y + uy * trimFrom },
    to: { x: to.x - ux * trimTo, y: to.y - uy * trimTo },
  };
};

const drawBondLines = (ctx, from, to, order) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length < 1e-6) {
    return;
  }
  const nx = -dy / length;
  const ny = dx / length;

  const offsets = order === 3 ? [-4, 0, 4] : order === 2 ? [-2.2, 2.2] : [0];
  offsets.forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(from.x + nx * offset, from.y + ny * offset);
    ctx.lineTo(to.x + nx * offset, to.y + ny * offset);
    ctx.stroke();
  });
};

const draw = () => {
  if (!current || !canvas || !canvasWrap) {
    return;
  }

  const cssWidth = canvasWrap.clientWidth;
  if (cssWidth <= 0) {
    return;
  }
  const cssHeight = Math.min(420, Math.max(240, cssWidth * 0.75));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.height = `${cssHeight}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const { molGraph, chargesResult } = current;
  const { toScreen } = computeTransform(molGraph.coords, cssWidth, cssHeight);
  screenPositions = molGraph.coords.map(toScreen);

  // Layer 1 — 전하 구름 (radial gradient)
  molGraph.atoms.forEach((atom, index) => {
    const charge = chargesResult.condensedCharges[index];
    const rgba = chargeToRgba(charge, chargesResult.maxAbsCondensed);
    if (rgba.a <= 0.01) {
      return;
    }
    const { x, y } = screenPositions[index];
    const radius =
      10 + 26 * Math.sqrt(Math.abs(charge) / (chargesResult.maxAbsCondensed || 1));
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgbaToCss(rgba));
    gradient.addColorStop(1, rgbaToCss({ ...rgba, a: 0 }));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Layer 2 — 결합선
  ctx.strokeStyle = "rgba(28, 37, 33, 0.8)";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  molGraph.bonds.forEach((bond) => {
    const labeledA = isLabeledAtom(molGraph.atoms[bond.a], bond.a, molGraph.bonds);
    const labeledB = isLabeledAtom(molGraph.atoms[bond.b], bond.b, molGraph.bonds);
    const { from, to } = trimSegment(
      screenPositions[bond.a],
      screenPositions[bond.b],
      labeledA ? 11 : 0,
      labeledB ? 11 : 0,
    );
    drawBondLines(ctx, from, to, bond.order);
  });

  // Layer 3 — 원자 라벨 (헤테로원자/하전 원자/고립 원자만, 골격식 관례)
  ctx.font = "700 12px Inter, 'Noto Sans KR', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  molGraph.atoms.forEach((atom, index) => {
    if (!isLabeledAtom(atom, index, molGraph.bonds)) {
      return;
    }
    const { x, y } = screenPositions[index];
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1c2521";
    ctx.fillText(atomLabelText(atom), x, y + 0.5);
  });
};

const renderLegend = () => {
  if (!legendArea || !current) {
    return;
  }
  const maxAbs = current.chargesResult.maxAbsCondensed;
  legendArea.innerHTML = `
    <div class="electron-cloud-legend-bar" style="background: ${legendGradientCss()}" aria-hidden="true"></div>
    <div class="electron-cloud-legend-labels">
      <span>&delta;&minus; (전자 풍부)</span>
      <span>|q|<sub>max</sub> = ${maxAbs.toFixed(3)} e</span>
      <span>&delta;+ (전자 부족)</span>
    </div>
  `;
};

const renderOutput = () => {
  if (!outputList || !current) {
    return;
  }
  const { molGraph, chargesResult } = current;
  const condensed = chargesResult.condensedCharges;

  let mostNegative = 0;
  let mostPositive = 0;
  condensed.forEach((charge, index) => {
    if (charge < condensed[mostNegative]) {
      mostNegative = index;
    }
    if (charge > condensed[mostPositive]) {
      mostPositive = index;
    }
  });

  const describeAtom = (index) =>
    `${atomLabelText(molGraph.atoms[index])} (q = ${condensed[index].toFixed(3)} e)`;

  outputList.innerHTML = `
    <div>
      <dt>Molecular formula</dt>
      <dd>${buildFormula(molGraph.atoms)}</dd>
    </div>
    <div>
      <dt>Most <span class="keep-case">&delta;&minus;</span> atom</dt>
      <dd>${describeAtom(mostNegative)}</dd>
    </div>
    <div>
      <dt>Most <span class="keep-case">&delta;+</span> atom</dt>
      <dd>${describeAtom(mostPositive)}</dd>
    </div>
  `;
};

const renderMolecule = (smiles) => {
  if (!rdkit) {
    return;
  }
  const trimmed = smiles.trim();
  if (!trimmed) {
    setErrorStatus("SMILES 코드를 입력해주세요. 예: CC(=O)O (아세트산)");
    return;
  }

  let mol = null;
  let commonchem = null;
  let molblock = null;
  try {
    mol = rdkit.get_mol(trimmed);
    if (!mol || (typeof mol.is_valid === "function" && !mol.is_valid())) {
      setErrorStatus("유효하지 않은 SMILES 코드입니다. 입력을 확인해주세요.");
      return;
    }
    try {
      mol.set_new_coords();
    } catch {
      // 좌표 생성 실패 시 get_json의 기본 conformer 또는 molblock fallback 사용
    }
    commonchem = JSON.parse(mol.get_json());
    molblock = mol.get_molblock();
  } catch {
    setErrorStatus("유효하지 않은 SMILES 코드입니다. 입력을 확인해주세요.");
    return;
  } finally {
    mol?.delete?.();
  }

  const molGraph = parseMolGraph(commonchem, molblock);
  if (!molGraph.ok) {
    setErrorStatus("분자 구조를 해석하지 못했습니다. 다른 SMILES를 시도해주세요.");
    return;
  }

  const chargesResult = computeGasteigerCharges(molGraph);
  if (!chargesResult.ok) {
    const elements = [...new Set(chargesResult.unsupportedAtoms.map((atom) => atom.element))];
    setErrorStatus(
      `지원하지 않는 원소가 포함되어 있습니다: ${elements.join(", ")} — H, C, N, O, F, Cl, Br, I, S, P만 지원합니다.`,
    );
    return;
  }

  current = { molGraph, chargesResult };
  setStatus("");
  canvas?.setAttribute(
    "aria-label",
    `SMILES ${trimmed} 분자의 Gasteiger 부분전하 시각화. 빨강은 전자가 풍부한 부분, 파랑은 부족한 부분입니다.`,
  );
  draw();
  renderLegend();
  renderOutput();
};

const loadLibraryAndRender = () => {
  setLoadingStatus("분자 구조 라이브러리(RDKit.js)를 불러오는 중입니다&hellip; 최초 1회, 수 MB");
  loadRDKit()
    .then((module) => {
      rdkit = module;
      setStatus("");
      renderMolecule(smilesInput?.value ?? "");
    })
    .catch(() => {
      setErrorStatus("라이브러리를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.", {
        retry: true,
      });
    });
};

const handlePointerMove = (event) => {
  if (!current || !tooltip || !canvas) {
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  let nearest = -1;
  let nearestDistance = HOVER_RADIUS_PX;
  screenPositions.forEach((position, index) => {
    const distance = Math.hypot(position.x - x, position.y - y);
    if (distance < nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  });

  if (nearest < 0) {
    tooltip.hidden = true;
    return;
  }

  const atom = current.molGraph.atoms[nearest];
  const heavyCharge = current.chargesResult.charges[nearest];
  const condensedCharge = current.chargesResult.condensedCharges[nearest];
  const condensedNote =
    atom.implicitHs > 0 ? ` &middot; H 포함 ${condensedCharge.toFixed(3)} e` : "";
  tooltip.innerHTML = `${atomLabelText(atom)} &middot; q = ${heavyCharge.toFixed(3)} e${condensedNote}`;
  tooltip.hidden = false;
  tooltip.style.left = `${screenPositions[nearest].x}px`;
  tooltip.style.top = `${screenPositions[nearest].y - 14}px`;
};

export const activateElectronCloudViewer = () => {
  if (activated || !canvas) {
    return;
  }
  activated = true;
  loadLibraryAndRender();
};

const updatePresetIupacNote = (preset) => {
  if (!presetIupacNote) {
    return;
  }
  if (preset?.iupac) {
    presetIupacNote.textContent = `${preset.label} = ${preset.iupac}`;
    presetIupacNote.hidden = false;
  } else {
    presetIupacNote.hidden = true;
  }
};

export const initElectronCloudViewer = () => {
  if (!presetSelect || !smilesInput || !renderButton || !canvas) {
    return;
  }

  presetSelect.innerHTML = moleculePresets
    .map((preset) => `<option value="${preset.id}">${preset.label}</option>`)
    .join("");
  const defaultPreset =
    moleculePresets.find((preset) => preset.id === DEFAULT_MOLECULE_PRESET_ID) ??
    moleculePresets[0];
  presetSelect.value = defaultPreset.id;
  smilesInput.value = defaultPreset.smiles;
  updatePresetIupacNote(defaultPreset);

  presetSelect.addEventListener("change", () => {
    const preset = moleculePresets.find((candidate) => candidate.id === presetSelect.value);
    if (preset) {
      smilesInput.value = preset.smiles;
      updatePresetIupacNote(preset);
      renderMolecule(preset.smiles);
    }
  });

  smilesInput.addEventListener("input", () => {
    const preset = moleculePresets.find((candidate) => candidate.id === presetSelect.value);
    if (!preset || smilesInput.value.trim() !== preset.smiles) {
      updatePresetIupacNote(null);
    }
  });

  renderButton.addEventListener("click", () => renderMolecule(smilesInput.value));
  smilesInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      renderMolecule(smilesInput.value);
    }
  });

  canvas.addEventListener("mousemove", handlePointerMove);
  canvas.addEventListener("mouseleave", () => {
    if (tooltip) {
      tooltip.hidden = true;
    }
  });

  let resizeFrame = 0;
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(draw);
  });
  observer.observe(canvasWrap);
};
