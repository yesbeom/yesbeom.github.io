import {
  GASTEIGER_PARAMETERS,
  HYDROGEN_CATION_ELECTRONEGATIVITY,
} from "../data/gasteiger-parameters.js";

// 접미사 없이 단일 파라미터를 쓰는 원소들.
const SUFFIX_FREE_ELEMENTS = new Set(["H", "F", "Cl", "Br", "I"]);

const inferHybridization = (atomIndex, atoms, bonds) => {
  const incident = bonds.filter((bond) => bond.a === atomIndex || bond.b === atomIndex);
  const tripleCount = incident.filter((bond) => bond.order === 3).length;
  const doubleCount = incident.filter((bond) => bond.order === 2).length;

  if (tripleCount > 0 || doubleCount >= 2) {
    return "sp";
  }
  if (doubleCount === 1 || atoms[atomIndex].aromatic || incident.some((bond) => bond.aromatic)) {
    return "sp2";
  }
  return "sp3";
};

const atomTypeKey = (element, hybridization) => {
  if (SUFFIX_FREE_ELEMENTS.has(element)) {
    return element;
  }
  // 황/인은 sp3 항목만 존재 (S.sp2 파라미터 없음 — sulfoxide 등은 sp3 근사).
  if (element === "S") {
    return "S.sp3";
  }
  if (element === "P") {
    return GASTEIGER_PARAMETERS[`P.${hybridization}`] ? `P.${hybridization}` : "P.sp3";
  }
  return `${element}.${hybridization}`;
};

const expandImplicitHydrogens = (molGraph) => {
  const atoms = molGraph.atoms.map((atom) => ({ ...atom }));
  const bonds = molGraph.bonds.map((bond) => ({ ...bond }));
  const heavyAtomOf = [];

  molGraph.atoms.forEach((atom, heavyIndex) => {
    for (let h = 0; h < atom.implicitHs; h += 1) {
      const hydrogenIndex = atoms.length;
      atoms.push({ z: 1, element: "H", formalCharge: 0, implicitHs: 0, aromatic: false });
      bonds.push({ a: heavyIndex, b: hydrogenIndex, order: 1, aromatic: false });
      heavyAtomOf[hydrogenIndex] = heavyIndex;
    }
  });

  return { atoms, bonds, heavyAtomOf };
};

// PEOE 반복 계산 (Gasteiger & Marsili 1980; RDKit GasteigerCharges.cpp와 동일한 규칙):
// 초기 전하 = 형식전하, 감쇠 0.5^n, 전하 이동량 dq = (χ_high − χ_low) / χ⁺(공여 원자),
// 수소의 χ⁺는 20.02 고정.
export const computeGasteigerCharges = (molGraph, { iterations = 12 } = {}) => {
  const { atoms, bonds, heavyAtomOf } = expandImplicitHydrogens(molGraph);

  const types = [];
  const unsupportedAtoms = [];
  atoms.forEach((atom, index) => {
    const hybridization = inferHybridization(index, atoms, bonds);
    const key = atomTypeKey(atom.element, hybridization);
    if (!GASTEIGER_PARAMETERS[key]) {
      unsupportedAtoms.push({ index, element: atom.element, hybridization });
      return;
    }
    types[index] = GASTEIGER_PARAMETERS[key];
  });

  if (unsupportedAtoms.length > 0) {
    return { ok: false, unsupportedAtoms };
  }

  const chiPlus = atoms.map((atom, index) => {
    if (atom.element === "H") {
      return HYDROGEN_CATION_ELECTRONEGATIVITY;
    }
    const { a, b, c } = types[index];
    return a + b + c;
  });

  const charges = atoms.map((atom) => atom.formalCharge);

  for (let n = 1; n <= iterations; n += 1) {
    const damping = 0.5 ** n;
    const chi = charges.map((q, index) => {
      const { a, b, c } = types[index];
      return a + b * q + c * q * q;
    });

    const deltas = new Array(atoms.length).fill(0);
    bonds.forEach((bond) => {
      const donor = chi[bond.a] <= chi[bond.b] ? bond.a : bond.b;
      const acceptor = donor === bond.a ? bond.b : bond.a;
      const dq = ((chi[acceptor] - chi[donor]) / chiPlus[donor]) * damping;
      deltas[donor] += dq;
      deltas[acceptor] -= dq;
    });

    let maxDelta = 0;
    deltas.forEach((delta, index) => {
      charges[index] += delta;
      maxDelta = Math.max(maxDelta, Math.abs(delta));
    });

    if (maxDelta < 1e-4) {
      break;
    }
  }

  const heavyCount = molGraph.atoms.length;
  const heavyCharges = charges.slice(0, heavyCount);
  const hydrogenCharges = molGraph.atoms.map(() => []);
  charges.slice(heavyCount).forEach((charge, offset) => {
    hydrogenCharges[heavyAtomOf[heavyCount + offset]].push(charge);
  });

  const condensedCharges = heavyCharges.map(
    (charge, index) => charge + hydrogenCharges[index].reduce((sum, value) => sum + value, 0),
  );
  const maxAbsCondensed = condensedCharges.reduce((max, value) => Math.max(max, Math.abs(value)), 0);

  return { ok: true, charges: heavyCharges, hydrogenCharges, condensedCharges, maxAbsCondensed };
};
