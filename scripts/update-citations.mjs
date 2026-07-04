import { writeFile } from "node:fs/promises";

const authorId = "OSOr344AAAAJ";
const scholarUrl =
  `https://scholar.google.com/citations?hl=en&user=${authorId}&view_op=list_works&sortby=pubdate`;

const data = process.env.SERPAPI_KEY
  ? await fetchFromSerpApi(process.env.SERPAPI_KEY)
  : await fetchFromGoogleScholar();

await writeFile("citations.json", `${JSON.stringify(data, null, 2)}\n`, "utf8");

async function fetchFromSerpApi(apiKey) {
  const params = new URLSearchParams({
    engine: "google_scholar_author",
    author_id: authorId,
    api_key: apiKey,
  });
  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`SerpApi request failed: ${response.status}`);
  }

  const json = await response.json();
  const citedBy = json.cited_by;
  const table = citedBy?.table || [];
  const citations = table.find((item) => item.citations)?.citations || {};
  const hIndex = table.find((item) => item.h_index)?.h_index || {};
  const i10Index = table.find((item) => item.i10_index)?.i10_index || {};
  const recentKey =
    Object.keys(citations).find((key) => key !== "all" && key.startsWith("since_")) ||
    Object.keys(hIndex).find((key) => key !== "all" && key.startsWith("since_")) ||
    Object.keys(i10Index).find((key) => key !== "all" && key.startsWith("since_"));

  if (!citations.all && !hIndex.all && !i10Index.all) {
    throw new Error("SerpApi response did not include citation metrics.");
  }

  return {
    source: "Google Scholar via SerpApi",
    profileUrl: scholarUrl,
    updatedAt: new Date().toISOString().slice(0, 10),
    table: {
      "citations-all": formatMetric(citations.all),
      "citations-recent": formatMetric(citations[recentKey]),
      "h-all": formatMetric(hIndex.all),
      "h-recent": formatMetric(hIndex[recentKey]),
      "i10-all": formatMetric(i10Index.all),
      "i10-recent": formatMetric(i10Index[recentKey]),
    },
    yearly: (citedBy?.graph || [])
      .map((item) => ({ year: String(item.year), count: Number(item.citations) || 0 }))
      .filter((item) => item.year),
    note: "Citation metrics are loaded from citations.json.",
  };
}

async function fetchFromGoogleScholar() {
  const response = await fetch(scholarUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Google Scholar request failed: ${response.status}`);
  }

  const html = await response.text();
  const tableValues = [...html.matchAll(/<td class="gsc_rsb_std">([\s\S]*?)<\/td>/g)].map((match) =>
    stripTags(match[1]),
  );
  const years = [...html.matchAll(/<span class="gsc_g_t">([\s\S]*?)<\/span>/g)].map((match) =>
    stripTags(match[1]),
  );
  const counts = [...html.matchAll(/<span class="gsc_g_al">([\s\S]*?)<\/span>/g)].map((match) =>
    Number(stripTags(match[1])) || 0,
  );

  if (tableValues.length < 6) {
    throw new Error("Could not parse Google Scholar metrics. Scholar may have returned a CAPTCHA page.");
  }

  return {
    source: "Google Scholar",
    profileUrl: scholarUrl,
    updatedAt: new Date().toISOString().slice(0, 10),
    table: {
      "citations-all": tableValues[0],
      "citations-recent": tableValues[1],
      "h-all": tableValues[2],
      "h-recent": tableValues[3],
      "i10-all": tableValues[4],
      "i10-recent": tableValues[5],
    },
    yearly: years.map((year, index) => ({ year, count: counts[index] || 0 })).filter((item) => item.year),
    note: "Citation metrics are loaded from citations.json.",
  };
}

function formatMetric(value) {
  return value === undefined || value === null ? "" : String(value);
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}
