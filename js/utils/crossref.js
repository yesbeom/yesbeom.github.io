const getCrossrefUrl = (issn, watchWindowDays) => {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - watchWindowDays);
  const toIsoDate = (date) => date.toISOString().slice(0, 10);
  const params = new URLSearchParams({
    filter: [
      `issn:${issn}`,
      "type:journal-article",
      `from-pub-date:${toIsoDate(fromDate)}`,
      `until-pub-date:${toIsoDate(today)}`,
    ].join(","),
    select: "DOI,title,container-title,published,published-online,published-print,issued,URL",
    sort: "published",
    order: "desc",
    rows: "100",
  });

  return `https://api.crossref.org/works?${params.toString()}`;
};

export const fetchJournalWorks = async (journal, watchWindowDays) => {
  const works = [];
  let failedIssnCount = 0;

  for (const issn of journal.issns) {
    try {
      const response = await fetch(getCrossrefUrl(issn, watchWindowDays));

      if (!response.ok) {
        throw new Error(`Crossref request failed for ${journal.name} ${issn}`);
      }

      const data = await response.json();
      works.push(...(data.message?.items || []));
    } catch (error) {
      failedIssnCount += 1;
    }
  }

  if (works.length === 0 && failedIssnCount === journal.issns.length) {
    throw new Error(`Crossref request failed for ${journal.name}`);
  }

  const uniqueWorks = [...new Map(works.map((work) => [work.DOI || work.URL || work.title?.[0], work])).values()];
  return uniqueWorks.map((work) => ({ journal, work }));
};
