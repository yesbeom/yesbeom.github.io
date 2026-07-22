const sphericalDiagram = () => `
  <svg viewBox="0 0 200 175" role="img" aria-label="Spherical morphology diagram">
    <circle class="edge" cx="100" cy="82" r="54"></circle>
    <ellipse class="edge-hidden" cx="100" cy="82" rx="54" ry="15"></ellipse>
    <line class="dimension-line" x1="100" y1="82" x2="154" y2="82"></line>
    <circle cx="100" cy="82" r="2.4" style="fill:var(--accent-dark)"></circle>
    <text x="120" y="74">R</text>
  </svg>
`;

const tetrahedralDiagram = () => `
  <svg viewBox="0 0 200 175" role="img" aria-label="Tetrahedral morphology diagram">
    <polyline class="edge-hidden" points="44,104 156,104"></polyline>
    <polyline class="edge" points="44,104 100,24 156,104"></polyline>
    <polyline class="edge" points="44,104 100,140 156,104"></polyline>
    <line class="edge" x1="100" y1="24" x2="100" y2="140"></line>
    <circle cx="100" cy="24" r="2.2" style="fill:var(--ink)"></circle>
    <circle cx="44" cy="104" r="2.2" style="fill:var(--ink)"></circle>
    <circle cx="156" cy="104" r="2.2" style="fill:var(--ink)"></circle>
    <circle cx="100" cy="140" r="2.2" style="fill:var(--ink)"></circle>
    <text x="52" y="132">a</text>
  </svg>
`;

const tetrapodDiagram = () => `
  <svg viewBox="0 0 220 210" role="img" aria-label="Tetrapod morphology diagram">
    <rect class="face" x="100" y="92" width="76" height="20" rx="10" style="fill:var(--accent)" transform="rotate(-90 110 102)"></rect>
    <rect class="face" x="100" y="92" width="76" height="20" rx="10" style="fill:var(--accent)" transform="rotate(30 110 102)"></rect>
    <rect class="face" x="100" y="92" width="76" height="20" rx="10" style="fill:var(--accent)" transform="rotate(150 110 102)"></rect>

    <circle class="face" cx="110" cy="102" r="24" style="fill:var(--accent-dark)"></circle>
    <circle cx="110" cy="102" r="2.2" style="fill:var(--ink)"></circle>

    <line class="dimension-line" x1="110" y1="102" x2="110" y2="124" style="stroke:rgba(255,255,255,0.85)"></line>
    <text x="94" y="142">core R</text>

    <line class="dimension-line" x1="100" y1="65" x2="120" y2="65"></line>
    <text x="124" y="68">arm R</text>

    <line class="dimension-line" x1="170" y1="110" x2="170" y2="36"></line>
    <text x="174" y="75">arm L</text>
  </svg>
`;

const diagramRenderers = {
  spherical: sphericalDiagram,
  tetrahedral: tetrahedralDiagram,
  tetrapod: tetrapodDiagram,
};

export const renderMorphologyDiagram = (morphologyId) => diagramRenderers[morphologyId]?.() ?? "";
