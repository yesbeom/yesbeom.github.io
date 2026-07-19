const HC_EV_NM = 1239.8419843320025;
const VISIBLE_MIN_NM = 380;
const VISIBLE_MAX_NM = 750;

const COLOR_NAME_BANDS = [
  { maxNm: 450, name: "violet" },
  { maxNm: 485, name: "blue" },
  { maxNm: 500, name: "cyan" },
  { maxNm: 565, name: "green" },
  { maxNm: 590, name: "yellow-green" },
  { maxNm: 625, name: "orange" },
  { maxNm: VISIBLE_MAX_NM, name: "red" },
];

const bandgapEvToWavelengthNm = (bandgapEv) => HC_EV_NM / bandgapEv;

const isVisibleWavelength = (wavelengthNm) =>
  wavelengthNm >= VISIBLE_MIN_NM && wavelengthNm <= VISIBLE_MAX_NM;

const wavelengthToColorName = (wavelengthNm) => {
  if (wavelengthNm < VISIBLE_MIN_NM) return "UV";
  if (wavelengthNm > VISIBLE_MAX_NM) return "IR";
  return COLOR_NAME_BANDS.find((band) => wavelengthNm <= band.maxNm)?.name ?? "red";
};

const gammaCorrect = (component, intensity) =>
  Math.round(255 * (component * intensity) ** 0.8);

const wavelengthToRgb = (wavelengthNm) => {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelengthNm >= 380 && wavelengthNm < 440) {
    r = -(wavelengthNm - 440) / (440 - 380);
    b = 1;
  } else if (wavelengthNm < 490) {
    g = (wavelengthNm - 440) / (490 - 440);
    b = 1;
  } else if (wavelengthNm < 510) {
    g = 1;
    b = -(wavelengthNm - 510) / (510 - 490);
  } else if (wavelengthNm < 580) {
    r = (wavelengthNm - 510) / (580 - 510);
    g = 1;
  } else if (wavelengthNm < 645) {
    r = 1;
    g = -(wavelengthNm - 645) / (645 - 580);
  } else if (wavelengthNm <= 750) {
    r = 1;
  }

  let intensity = 1;
  if (wavelengthNm < 420) {
    intensity = 0.3 + (0.7 * (wavelengthNm - 380)) / (420 - 380);
  } else if (wavelengthNm > 700) {
    intensity = 0.3 + (0.7 * (750 - wavelengthNm)) / (750 - 700);
  }

  return {
    r: gammaCorrect(r, intensity),
    g: gammaCorrect(g, intensity),
    b: gammaCorrect(b, intensity),
  };
};

export const bandgapToEmission = (bandgapEv) => {
  const wavelengthNm = bandgapEvToWavelengthNm(bandgapEv);
  const visible = isVisibleWavelength(wavelengthNm);

  return {
    wavelengthNm,
    colorName: wavelengthToColorName(wavelengthNm),
    rgb: visible ? wavelengthToRgb(wavelengthNm) : null,
    visible,
  };
};
