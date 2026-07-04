import { renderPublications } from "../features/publications.js";
import { loadScholarMetrics } from "../features/citations.js";
import { setFooterYear } from "../utils/footer-year.js";

renderPublications();
loadScholarMetrics();
setFooterYear();
