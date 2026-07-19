// PEOE(Gasteiger-Marsili) 전기음성도 파라미터: χ(q) = a + b·q + c·q² [eV]
// Source: Gasteiger & Marsili, Tetrahedron 36, 3219 (1980), Table 1.
// Values cross-checked against RDKit Code/GraphMol/PartialCharges/GasteigerParams.cpp.
export const GASTEIGER_PARAMETERS = {
  H: { a: 7.17, b: 6.24, c: -0.56 },
  "C.sp3": { a: 7.98, b: 9.18, c: 1.88 },
  "C.sp2": { a: 8.79, b: 9.32, c: 1.51 },
  "C.sp": { a: 10.39, b: 9.45, c: 0.73 },
  "N.sp3": { a: 11.54, b: 10.82, c: 1.36 },
  "N.sp2": { a: 12.87, b: 11.15, c: 0.85 },
  "N.sp": { a: 15.68, b: 11.7, c: -0.27 },
  "O.sp3": { a: 14.18, b: 12.92, c: 1.39 },
  "O.sp2": { a: 17.07, b: 13.79, c: 0.47 },
  F: { a: 14.66, b: 13.85, c: 2.31 },
  Cl: { a: 11.0, b: 9.69, c: 1.35 },
  Br: { a: 10.08, b: 8.47, c: 1.16 },
  I: { a: 9.9, b: 7.96, c: 0.96 },
  "S.sp3": { a: 10.14, b: 9.13, c: 1.38 },
  "P.sp3": { a: 8.9, b: 8.24, c: 0.96 },
  "P.sp2": { a: 9.665, b: 8.53, c: 0.735 },
};

// 수소가 전자를 공여할 때 분모로 쓰는 고정 양이온 전기음성도 (원 논문 및 RDKit의 IONXH).
export const HYDROGEN_CATION_ELECTRONEGATIVITY = 20.02;

export const GASTEIGER_REFERENCE_NOTE =
  "Partial charges: Gasteiger & Marsili, Tetrahedron 36, 3219 (1980) — PEOE iterative method";
