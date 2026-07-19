import { initTabLayout } from "../features/tab-layout.js";
import { initQuantumConfinementCalculator } from "../features/quantum-confinement-calculator.js";
import { initSurfaceVolumeCalculator } from "../features/surface-volume-calculator.js";
import {
  initElectronCloudViewer,
  activateElectronCloudViewer,
} from "../features/electron-cloud-viewer.js";
import { setFooterYear } from "../utils/footer-year.js";

initElectronCloudViewer();
initTabLayout({
  tablistSelector: "#calculator-tabs",
  panelSelector: ".tab-panel",
  onTabChange: (tabId) => {
    if (tabId === "electron-cloud") {
      activateElectronCloudViewer();
    }
  },
});
initQuantumConfinementCalculator();
initSurfaceVolumeCalculator();
setFooterYear();
