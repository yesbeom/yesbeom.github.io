import { initTabLayout } from "../features/tab-layout.js";
import { initQuoteCards } from "../features/quote-cards.js";
import { initVideoShowcase } from "../features/video-showcase.js";
import { setFooterYear } from "../features/footer-year.js";

initTabLayout({
  tablistSelector: "#lounge-tabs",
  panelSelector: ".tab-panel",
});
initQuoteCards();
initVideoShowcase();
setFooterYear();
