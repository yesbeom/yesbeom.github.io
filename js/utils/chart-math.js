export const createLinearScale = ([domainMin, domainMax], [rangeMin, rangeMax]) => (value) =>
  rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);

export const buildPolylinePath = (points) =>
  points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");

export const sampleRange = ([min, max], steps) =>
  Array.from({ length: steps }, (_, index) => min + ((max - min) * index) / (steps - 1));
