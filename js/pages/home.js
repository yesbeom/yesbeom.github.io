import { renderPublications } from "../features/publications.js";
import { loadScholarMetrics } from "../features/citations.js";
import { setFooterYear } from "../features/footer-year.js";

renderPublications();
loadScholarMetrics();
setFooterYear();
