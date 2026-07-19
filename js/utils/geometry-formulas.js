const sphereSurfaceArea = (radiusNm) => 4 * Math.PI * radiusNm ** 2;
const sphereVolume = (radiusNm) => (4 / 3) * Math.PI * radiusNm ** 3;
const sphereSurfaceToVolumeRatio = (radiusNm) => 3 / radiusNm;

// Regular tetrahedron, edge length a: 4 equilateral faces (area = 4 * (√3/4)a²), volume = a³ / (6√2)
const tetrahedronSurfaceArea = (edgeNm) => Math.sqrt(3) * edgeNm ** 2;
const tetrahedronVolume = (edgeNm) => edgeNm ** 3 / (6 * Math.sqrt(2));
const tetrahedronSurfaceToVolumeRatio = (edgeNm) =>
  tetrahedronSurfaceArea(edgeNm) / tetrahedronVolume(edgeNm);

// Tetrapod approximated as a core sphere + 4 arms (cylinder + hemispherical tip).
// Each arm's flat joint against the core removes a disk of area pi*armRadius^2 from the
// core's exposed surface; this cancels against the hemisphere-cap terms to net +4*pi*armRadius^2
// below. Core/arm volume overlap at the joint is treated as negligible (documented simplification).
const tetrapodSurfaceArea = ({ coreRadiusNm, armRadiusNm, armLengthNm }) =>
  4 * Math.PI * (coreRadiusNm ** 2 + armRadiusNm ** 2) + 8 * Math.PI * armRadiusNm * armLengthNm;

const tetrapodVolume = ({ coreRadiusNm, armRadiusNm, armLengthNm }) =>
  (4 / 3) * Math.PI * coreRadiusNm ** 3 +
  4 * Math.PI * armRadiusNm ** 2 * armLengthNm +
  (8 / 3) * Math.PI * armRadiusNm ** 3;

const tetrapodSurfaceToVolumeRatio = (params) =>
  tetrapodSurfaceArea(params) / tetrapodVolume(params);

export const surfaceAreaCalculators = {
  spherical: ({ radiusNm }) => sphereSurfaceArea(radiusNm),
  tetrahedral: ({ edgeNm }) => tetrahedronSurfaceArea(edgeNm),
  tetrapod: (params) => tetrapodSurfaceArea(params),
};

export const volumeCalculators = {
  spherical: ({ radiusNm }) => sphereVolume(radiusNm),
  tetrahedral: ({ edgeNm }) => tetrahedronVolume(edgeNm),
  tetrapod: (params) => tetrapodVolume(params),
};

export const surfaceToVolumeCalculators = {
  spherical: ({ radiusNm }) => sphereSurfaceToVolumeRatio(radiusNm),
  tetrahedral: ({ edgeNm }) => tetrahedronSurfaceToVolumeRatio(edgeNm),
  tetrapod: (params) => tetrapodSurfaceToVolumeRatio(params),
};
