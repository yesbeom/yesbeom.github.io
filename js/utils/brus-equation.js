const HBAR = 1.054571817e-34;
const ELEMENTARY_CHARGE = 1.602176634e-19;
const VACUUM_PERMITTIVITY = 8.8541878128e-12;
const ELECTRON_MASS = 9.1093837015e-31;
const NM_TO_M = 1e-9;

export const computeBandgapEv = ({ radiusNm, egBulkEv, meStar, mhStar, epsilonR }) => {
  const radiusM = radiusNm * NM_TO_M;

  const confinementEv =
    ((HBAR ** 2 * Math.PI ** 2) /
      (2 * radiusM ** 2) /
      ELECTRON_MASS) *
    (1 / meStar + 1 / mhStar) /
    ELEMENTARY_CHARGE;

  const coulombEv =
    (1.8 * ELEMENTARY_CHARGE) /
    (4 * Math.PI * VACUUM_PERMITTIVITY * epsilonR * radiusM);

  return egBulkEv + confinementEv - coulombEv;
};

export const isWithinValidRange = (radiusNm, [minNm, maxNm]) =>
  radiusNm >= minNm && radiusNm <= maxNm;
