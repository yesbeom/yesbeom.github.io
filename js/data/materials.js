export const materials = [
  {
    id: "inp",
    label: "InP (Indium Phosphide)",
    egBulkEv: 1.35,
    meStar: 0.0795,
    mhStar: 0.6,
    epsilonR: 12.5,
    validRadiusNm: [1, 10],
    defaultRadiusNm: 3,
    referenceNote:
      "Band-edge effective masses and static dielectric constant from Vurgaftman, Meyer & Ram-Mohan, \"Band parameters for III-V compound semiconductors and their alloys,\" J. Appl. Phys. 89, 5815 (2001); bulk bandgap is the commonly cited 300 K value used across InP quantum-dot literature.",
  },
  {
    id: "cdse",
    label: "CdSe (Cadmium Selenide)",
    egBulkEv: 1.74,
    meStar: 0.13,
    mhStar: 0.45,
    epsilonR: 10.6,
    validRadiusNm: [1, 8],
    referenceNote:
      "Bandgap and effective masses from Kippeny, Swafford & Rosenthal, \"Semiconductor Nanocrystals: A Powerful Visual Aid for Introducing the Particle in a Box,\" J. Chem. Educ. 79, 1094 (2002), the standard pedagogical reference for the Brus equation; static dielectric constant is a commonly cited literature value (~10-11 range across sources).",
  },
  {
    id: "cds",
    label: "CdS (Cadmium Sulfide)",
    egBulkEv: 2.42,
    meStar: 0.21,
    mhStar: 0.8,
    epsilonR: 9.2,
    validRadiusNm: [1, 6],
    referenceNote:
      "Bulk bandgap, electron effective mass, and dielectric constant are commonly cited CdS literature values used in Brus-equation quantum-dot calculations; the hole effective mass uses a simplified isotropic approximation (wurtzite CdS hole mass is actually anisotropic, roughly 0.2-0.7 m0 depending on direction) — verify against a specific source before treating as precise.",
  },
  {
    id: "pbs",
    label: "PbS (Lead Sulfide)",
    egBulkEv: 0.41,
    meStar: 0.085,
    mhStar: 0.085,
    epsilonR: 17.2,
    validRadiusNm: [2, 15],
    referenceNote:
      "Bulk bandgap and near-equal electron/hole effective masses reflect the well-known PbS band-mirroring result (see e.g. Kang & Wise, J. Opt. Soc. Am. B 14, 1632 (1997)); dielectric constant uses the high-frequency value (~17-18.5) rather than the anomalously large static value (~190) since the high-frequency constant is the one conventionally used to screen the electron-hole Coulomb term in Brus-equation-style calculations.",
  },
];
