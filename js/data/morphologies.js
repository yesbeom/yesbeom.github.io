export const morphologies = [
  {
    id: "spherical",
    label: "Spherical",
    params: [{ key: "radiusNm", label: "Radius R", unit: "nm", min: 0.5, max: 20, step: 0.1, default: 3 }],
  },
  {
    id: "tetrahedral",
    label: "Tetrahedral (regular)",
    params: [{ key: "edgeNm", label: "Edge length a", unit: "nm", min: 0.5, max: 20, step: 0.1, default: 5 }],
  },
  {
    id: "tetrapod",
    label: "Tetrapod",
    params: [
      { key: "coreRadiusNm", label: "Core radius", unit: "nm", min: 0.5, max: 10, step: 0.1, default: 2 },
      { key: "armRadiusNm", label: "Arm radius", unit: "nm", min: 0.2, max: 5, step: 0.1, default: 1 },
      { key: "armLengthNm", label: "Arm length", unit: "nm", min: 1, max: 30, step: 0.5, default: 10 },
    ],
  },
];
