const sphericalDiagram = () => `
  <svg viewBox="0 0 200 175" role="img" aria-label="Spherical morphology diagram">
    <defs>
      <radialGradient id="svc-sph-body" cx="37%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#bff0d9"></stop>
        <stop offset="40%" stop-color="#3fa87d"></stop>
        <stop offset="100%" stop-color="#0e3b2c"></stop>
      </radialGradient>
      <radialGradient id="svc-sph-shadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(14,59,44,0.30)"></stop>
        <stop offset="100%" stop-color="rgba(14,59,44,0)"></stop>
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="152" rx="54" ry="10" style="fill:url(#svc-sph-shadow)"></ellipse>
    <circle class="face" cx="100" cy="82" r="54" style="fill:url(#svc-sph-body)"></circle>
    <ellipse cx="80" cy="58" rx="17" ry="11" transform="rotate(-20 80 58)" style="fill:rgba(255,255,255,0.4)"></ellipse>
    <line class="dimension-line" x1="100" y1="82" x2="154" y2="82"></line>
    <circle cx="100" cy="82" r="2.6" style="fill:#0e3b2c"></circle>
    <text x="120" y="74">R</text>
  </svg>
`;

const tetrahedralDiagram = () => `
  <svg viewBox="0 0 200 175" role="img" aria-label="Tetrahedral morphology diagram">
    <defs>
      <linearGradient id="svc-tet-left" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8fdcbd"></stop>
        <stop offset="100%" stop-color="#2b8f69"></stop>
      </linearGradient>
      <linearGradient id="svc-tet-right" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2f9770"></stop>
        <stop offset="100%" stop-color="#0e3b2c"></stop>
      </linearGradient>
      <radialGradient id="svc-tet-shadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(14,59,44,0.28)"></stop>
        <stop offset="100%" stop-color="rgba(14,59,44,0)"></stop>
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="152" rx="62" ry="9" style="fill:url(#svc-tet-shadow)"></ellipse>
    <line class="edge-hidden" x1="44" y1="104" x2="156" y2="104"></line>
    <polygon class="face" points="100,24 44,104 100,140" style="fill:url(#svc-tet-left)"></polygon>
    <polygon class="face" points="100,24 156,104 100,140" style="fill:url(#svc-tet-right)"></polygon>
    <polyline class="edge" points="44,104 100,24 156,104"></polyline>
    <polyline class="edge" points="44,104 100,140 156,104"></polyline>
    <line class="edge" x1="100" y1="24" x2="100" y2="140"></line>
    <text x="52" y="132">a</text>
  </svg>
`;

const tetrapodDiagram = () => `
  <svg viewBox="0 0 220 210" role="img" aria-label="Tetrapod morphology diagram">
    <defs>
      <linearGradient id="svc-tp-arm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#17573f"></stop>
        <stop offset="38%" stop-color="#5cbf95"></stop>
        <stop offset="60%" stop-color="#2f9770"></stop>
        <stop offset="100%" stop-color="#0e3b2c"></stop>
      </linearGradient>
      <radialGradient id="svc-tp-core" cx="36%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#cdf3e1"></stop>
        <stop offset="45%" stop-color="#3fa87d"></stop>
        <stop offset="100%" stop-color="#0c3527"></stop>
      </radialGradient>
      <radialGradient id="svc-tp-tip" cx="42%" cy="38%" r="70%">
        <stop offset="0%" stop-color="#d7f6e6"></stop>
        <stop offset="55%" stop-color="#48b487"></stop>
        <stop offset="100%" stop-color="#12513b"></stop>
      </radialGradient>
      <radialGradient id="svc-tp-shadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(14,59,44,0.26)"></stop>
        <stop offset="100%" stop-color="rgba(14,59,44,0)"></stop>
      </radialGradient>
    </defs>
    <ellipse cx="112" cy="188" rx="78" ry="12" style="fill:url(#svc-tp-shadow)"></ellipse>

    <rect class="face" x="106" y="91" width="72" height="22" rx="11" transform="rotate(-90 110 102)" style="fill:url(#svc-tp-arm)"></rect>
    <rect class="face" x="106" y="91" width="72" height="22" rx="11" transform="rotate(145 110 102)" style="fill:url(#svc-tp-arm)"></rect>
    <rect class="face" x="106" y="91" width="72" height="22" rx="11" transform="rotate(35 110 102)" style="fill:url(#svc-tp-arm)"></rect>

    <circle class="face" cx="110" cy="102" r="26" style="fill:url(#svc-tp-core)"></circle>
    <ellipse cx="101" cy="94" rx="8" ry="5" transform="rotate(-20 101 94)" style="fill:rgba(255,255,255,0.4)"></ellipse>
    <circle class="face" cx="120" cy="112" r="14" style="fill:url(#svc-tp-tip)"></circle>

    <line class="dimension-line" x1="110" y1="102" x2="84" y2="102"></line>
    <text x="44" y="99">core R</text>

    <line class="dimension-line" x1="99" y1="70" x2="121" y2="70"></line>
    <text x="124" y="67">arm R</text>

    <line class="dimension-line" x1="110" y1="102" x2="166" y2="141"></line>
    <text x="150" y="160">arm L</text>
  </svg>
`;

const diagramRenderers = {
  spherical: sphericalDiagram,
  tetrahedral: tetrahedralDiagram,
  tetrapod: tetrapodDiagram,
};

export const renderMorphologyDiagram = (morphologyId) => diagramRenderers[morphologyId]?.() ?? "";
