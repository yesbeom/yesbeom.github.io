// 부분전하 → 발산형 색상 매핑.
// 규약: 빨강 = δ− (전자 풍부), 파랑 = δ+ (전자 부족). 사이트 팔레트(--clay, --blue) 재사용.
const NEGATIVE_RGB = { r: 184, g: 92, b: 56 };
const POSITIVE_RGB = { r: 57, g: 95, b: 143 };

export const chargeToRgba = (charge, maxAbsCharge, alphaMax = 0.55) => {
  const base = charge < 0 ? NEGATIVE_RGB : POSITIVE_RGB;
  const intensity = maxAbsCharge > 0 ? Math.min(1, Math.abs(charge) / maxAbsCharge) : 0;
  return { ...base, a: alphaMax * intensity };
};

export const rgbaToCss = ({ r, g, b, a }) => `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;

export const legendGradientCss = () =>
  "linear-gradient(90deg, rgba(184, 92, 56, 0.8), rgba(184, 92, 56, 0) 48%, rgba(57, 95, 143, 0) 52%, rgba(57, 95, 143, 0.8))";
