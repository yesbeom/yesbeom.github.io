import {
  watchedJournals,
  watchedKeywords,
  watchWindowDays,
  maxVisiblePapers,
} from "../data/watchlist-config.js";
import { getPublicationDate } from "../utils/dates.js";
import { formatFollowDate, escapeHtml } from "../utils/format.js";
import { fetchJournalWorks } from "../utils/crossref.js";

const researchFollowList = document.querySelector("#research-follow-list");
const researchFollowStatus = document.querySelector("#research-follow-status");

let allFollowItems = [];

const hasWatchedKeyword = (title) => {
  const normalizedTitle = title.toLowerCase();

  return watchedKeywords.some((keyword) => normalizedTitle.includes(keyword));
};

const isWithinWatchWindow = (date) => {
  if (!date) {
    return false;
  }

  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(now.getDate() - watchWindowDays);
  windowStart.setHours(0, 0, 0, 0);

  return date >= windowStart && date <= now;
};

const getVisibleItems = () =>
  allFollowItems.slice(0, maxVisiblePapers);

const renderFollowLoading = () => {
  if (!researchFollowList) {
    return;
  }

  researchFollowList.innerHTML = `
    <article class="loading-card">
      <span class="loading-spinner" aria-hidden="true"></span>
      <div>
        <h3>Loading recent papers...</h3>
        <p>Crossref에서 최근 논문 데이터를 불러오고 있습니다.</p>
      </div>
    </article>
  `;
};

const renderFollowItems = () => {
  if (!researchFollowList) {
    return;
  }

  const items = getVisibleItems();

  if (items.length === 0) {
    researchFollowList.innerHTML = `
      <article class="empty-state">
        <h3>No matching papers in the last ${watchWindowDays} days.</h3>
        <p>The watchlist is working, but no recent titles from the selected journals currently contain the tracked keywords.</p>
      </article>
    `;
    return;
  }

  researchFollowList.innerHTML = items
    .map(
      (item) => `
        <article class="follow-card">
          <div class="follow-card-meta">
            <span class="follow-date">${formatFollowDate(item.publishedAt)}</span>
            <span class="follow-topic">${escapeHtml(item.journal)}</span>
          </div>
          <div class="follow-card-body">
            <h3>${escapeHtml(item.title)}</h3>
            <p class="follow-doi">${item.doi ? `DOI: ${escapeHtml(item.doi)}` : "DOI unavailable"}</p>
          </div>
          <a class="text-link follow-open" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">
            Open paper
          </a>
        </article>
      `,
    )
    .join("");
};

const updateFollowStatus = (checkedCount, loadedJournalCount, failedCount) => {
  if (!researchFollowStatus) {
    return;
  }

  const visibleCount = getVisibleItems().length;
  const totalCount = allFollowItems.length;
  const failedText =
    failedCount > 0 ? ` ${failedCount} journal source${failedCount === 1 ? "" : "s"} could not be loaded.` : "";

  researchFollowStatus.textContent = `Loaded from Crossref for the last ${watchWindowDays} days. Checked ${checkedCount} recent records across ${loadedJournalCount} journal source${
    loadedJournalCount === 1 ? "" : "s"
  }. Showing ${visibleCount}${totalCount > visibleCount ? ` of ${totalCount}` : ""} matching paper${
    visibleCount === 1 ? "" : "s"
  } from all watched journals.${failedText}`;
};

export const loadResearchFollowItems = async () => {
  if (!researchFollowList || !researchFollowStatus) {
    return;
  }

  try {
    renderFollowLoading();

    // 순차 호출 필수: Crossref 익명 API는 병렬 버스트에 429를 반환한다.
    const journalResults = [];
    for (const journal of watchedJournals) {
      try {
        journalResults.push({
          status: "fulfilled",
          value: await fetchJournalWorks(journal, watchWindowDays),
        });
      } catch (error) {
        journalResults.push({ status: "rejected", reason: error });
      }
    }

    const successfulResults = journalResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);
    const failedCount = journalResults.filter((result) => result.status === "rejected").length;
    const loadedJournalCount = watchedJournals.length - failedCount;

    const mappedItems = successfulResults
      .map(({ journal, work }) => ({
        title: work.title?.[0] || "",
        journal: journal.name,
        publishedAt: getPublicationDate(work),
        doi: work.DOI,
        url: work.URL || (work.DOI ? `https://doi.org/${work.DOI}` : "#"),
      }))
      .filter(
        (item) =>
          item.title &&
          hasWatchedKeyword(item.title) &&
          isWithinWatchWindow(item.publishedAt),
      );

    allFollowItems = mappedItems
      .sort((first, second) => second.publishedAt - first.publishedAt);

    renderFollowItems();
    updateFollowStatus(successfulResults.length, loadedJournalCount, failedCount);
  } catch (error) {
    researchFollowStatus.textContent =
      "Could not load Crossref updates. Please refresh later or check the browser network connection.";
    researchFollowList.innerHTML = "";
  }
};
