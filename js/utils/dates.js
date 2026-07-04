export const getDateFromParts = (dateParts) => {
  const firstDate = dateParts?.[0];

  if (!firstDate) {
    return null;
  }

  const [year, month = 1, day = 1] = firstDate;
  return new Date(Date.UTC(year, month - 1, day));
};

export const getPublicationDate = (work) =>
  getDateFromParts(work["published-online"]?.["date-parts"]) ||
  getDateFromParts(work.published?.["date-parts"]) ||
  getDateFromParts(work.issued?.["date-parts"]) ||
  getDateFromParts(work["published-print"]?.["date-parts"]);
