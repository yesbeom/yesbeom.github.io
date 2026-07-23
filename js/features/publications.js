import { publicationData } from "../data/publications.js";

const renderPublicationCard = (publication, label) => {
  const card = `
  <article class="publication-card ${label === "Latest" ? "publication-card-featured" : ""}">
    <h3>${publication.title}</h3>
    <p>${publication.journal}</p>
  </article>
`;

  if (!publication.url) return card;

  return `
  <a
    class="publication-card-link"
    href="${publication.url}"
    target="_blank"
    rel="noreferrer"
    aria-label="${publication.title} — ${publication.journal} 원문 열기"
  >${card}</a>
`;
};

export const renderPublications = () => {
  const latestPublication = [...publicationData].sort(
    (first, second) => second.sortRank - first.sortRank,
  )[0];

  const latestPublicationContainer = document.querySelector("#latest-publication");

  if (latestPublicationContainer && latestPublication) {
    latestPublicationContainer.innerHTML = renderPublicationCard(latestPublication, "Latest");
  }

  const selectedPublicationsContainer = document.querySelector("#selected-publications");

  if (selectedPublicationsContainer) {
    selectedPublicationsContainer.innerHTML = publicationData
      .filter((publication) => publication.group === "selected")
      .map((publication) => renderPublicationCard(publication, "Selected"))
      .join("");
  }
};
