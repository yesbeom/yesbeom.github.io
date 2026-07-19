// RDKit.js의 JSMol.get_json() (commonchem JSON)을 렌더링/전하 계산용 분자 그래프로 변환한다.
const ATOMIC_SYMBOLS = {
  1: "H",
  5: "B",
  6: "C",
  7: "N",
  8: "O",
  9: "F",
  14: "Si",
  15: "P",
  16: "S",
  17: "Cl",
  34: "Se",
  35: "Br",
  53: "I",
};

const DEFAULT_ATOM = { z: 6, impHs: 0, chg: 0 };
const DEFAULT_BOND = { bo: 1 };

const parseMolblockCoords = (molblock) => {
  const lines = molblock.split(/\r?\n/);
  const countsLine = lines[3] ?? "";
  const atomCount = Number.parseInt(countsLine.slice(0, 3), 10);
  if (!Number.isFinite(atomCount) || atomCount <= 0) {
    return [];
  }

  return lines.slice(4, 4 + atomCount).map((line) => ({
    x: Number.parseFloat(line.slice(0, 10)),
    y: Number.parseFloat(line.slice(10, 20)),
  }));
};

export const parseMolGraph = (commonchem, molblockFallback) => {
  const molecule = commonchem?.molecules?.[0];
  if (!molecule || !Array.isArray(molecule.atoms)) {
    return { ok: false, reason: "invalid-json" };
  }

  const atomDefaults = { ...DEFAULT_ATOM, ...(commonchem.defaults?.atom ?? {}) };
  const bondDefaults = { ...DEFAULT_BOND, ...(commonchem.defaults?.bond ?? {}) };

  const rdkitExtension = (molecule.extensions ?? []).find(
    (extension) => extension.name === "rdkitRepresentation",
  );
  const aromaticAtoms = new Set(rdkitExtension?.aromaticAtoms ?? []);
  const aromaticBonds = new Set(rdkitExtension?.aromaticBonds ?? []);

  const atoms = molecule.atoms.map((atom, index) => {
    const z = atom.z ?? atomDefaults.z;
    return {
      z,
      element: ATOMIC_SYMBOLS[z] ?? `Z${z}`,
      formalCharge: atom.chg ?? atomDefaults.chg,
      implicitHs: atom.impHs ?? atomDefaults.impHs,
      aromatic: aromaticAtoms.has(index),
    };
  });

  const bonds = (molecule.bonds ?? []).map((bond, index) => ({
    a: bond.atoms[0],
    b: bond.atoms[1],
    order: bond.bo ?? bondDefaults.bo,
    aromatic: aromaticBonds.has(index),
  }));

  let coords = (molecule.conformers?.[0]?.coords ?? []).map(([x, y]) => ({ x, y }));
  if (coords.length !== atoms.length && typeof molblockFallback === "string") {
    coords = parseMolblockCoords(molblockFallback);
  }
  if (coords.length !== atoms.length) {
    return { ok: false, reason: "missing-coords" };
  }

  return { ok: true, atoms, bonds, coords };
};
