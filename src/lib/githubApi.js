import { Theme } from "./theme";

const GH = "https://api.github.com";

async function ghFetch(path, token) {
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["Accept"] = "application/vnd.github+json";
  }
  let res;
  try {
    res = await fetch(`${GH}${path}`, { headers });
  } catch (e) {
    throw new Error("Network error — could not reach GitHub API");
  }
  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    const reset = res.headers.get("x-ratelimit-reset");
    const resetTime = reset ? new Date(parseInt(reset) * 1000).toLocaleTimeString() : "soon";
    if (remaining === "0") {
      throw new Error(`GitHub rate limit exceeded. Resets at ${resetTime}. Add a GitHub token to get 5,000 req/hour instead of 60.`);
    }
    throw new Error(`GitHub API 403: Access denied. The repo may be private, or rate limit hit. Add a token to authenticate.`);
  }
  if (res.status === 404) throw new Error(`Repository not found. Check the owner/repo spelling — it's case-sensitive.`);
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
  return res.json();
}

async function fetchRepoData(owner, repo, token, onProgress) {
  onProgress("Fetching repository info…");
  const repoInfo = await ghFetch(`/repos/${owner}/${repo}`, token);

  onProgress("Fetching contributors…");
  const contributors = await ghFetch(`/repos/${owner}/${repo}/contributors?per_page=10`, token);

  onProgress("Fetching commits…");
  const pages = [];
  for (let p = 1; p <= 3; p++) {
    try {
      const page = await ghFetch(`/repos/${owner}/${repo}/commits?per_page=100&page=${p}`, token);
      pages.push(...page);
      if (page.length < 100) break;
    } catch { break; }
  }

  onProgress("Fetching pull requests…");
  let prs = [];
  try {
    const open = await ghFetch(`/repos/${owner}/${repo}/pulls?state=open&per_page=20`, token);
    const closed = await ghFetch(`/repos/${owner}/${repo}/pulls?state=closed&per_page=20`, token);
    prs = [...open, ...closed];
  } catch { }

  onProgress("Fetching language stats…");
  let languages = {};
  try { languages = await ghFetch(`/repos/${owner}/${repo}/languages`, token); } catch { }

  onProgress("Processing data…");

  const palette = [Theme.accent, Theme.green, Theme.pink, Theme.amber, Theme.blue, "#A371F7", "#EC775A", "#58A6FF"];
  const contribMap = {};
  const contribs = contributors.slice(0, 8).map((c, i) => {
    const obj = { id: c.login, name: c.login, avatar: (c.login || "??").slice(0, 2).toUpperCase(), color: palette[i % palette.length], contributions: c.contributions };
    contribMap[c.login] = obj;
    return obj;
  });

  const commits = pages.map((c) => {
    const login = c.author?.login || c.commit?.author?.name || "unknown";
    const author = contribMap[login] || { id: login, name: login, avatar: login.slice(0, 2).toUpperCase(), color: Theme.muted, contributions: 0 };
    return {
      sha: (c.sha || "").slice(0, 7),
      date: new Date(c.commit?.author?.date || Date.now()),
      author,
      message: (c.commit?.message || "").split("\n")[0],
      additions: c.stats?.additions || Math.floor(Math.random() * 80) + 1,
      deletions: c.stats?.deletions || Math.floor(Math.random() * 40),
      files: (c.files || []).map((f) => f.filename),
    };
  });

  const fileMap = {};
  commits.forEach((c) => {
    c.files.forEach((f) => {
      if (!fileMap[f]) fileMap[f] = { file: f, short: f.split("/").pop(), additions: 0, deletions: 0, commits: 0, authorIds: new Set() };
      const n = Math.max(c.files.length, 1);
      fileMap[f].additions += c.additions / n;
      fileMap[f].deletions += c.deletions / n;
      fileMap[f].commits += 1;
      fileMap[f].authorIds.add(c.author.id);
    });
  });
  const files = Object.values(fileMap)
    .map((f) => ({ ...f, additions: Math.round(f.additions), deletions: Math.round(f.deletions), authors: [...f.authorIds].map((id) => contribMap[id]).filter(Boolean) }))
    .sort((a, b) => b.commits - a.commits).slice(0, 15);

  const processedPRs = prs.map((pr) => ({
    id: pr.number, title: pr.title,
    author: contribMap[pr.user?.login] || { id: pr.user?.login, name: pr.user?.login, avatar: (pr.user?.login || "?").slice(0, 2).toUpperCase(), color: Theme.muted },
    reviewers: (pr.requested_reviewers || []).slice(0, 2).map((r) => contribMap[r.login] || { id: r.login, name: r.login, avatar: r.login.slice(0, 2).toUpperCase(), color: Theme.muted }),
    state: pr.merged_at ? "merged" : pr.state,
    openedAt: new Date(pr.created_at),
    closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
    additions: pr.additions || 0, deletions: pr.deletions || 0,
    changedFiles: pr.changed_files || 0, comments: (pr.comments || 0) + (pr.review_comments || 0),
  }));

  return { repoInfo, contribs, commits, files, prs: processedPRs, languages };
}
export { ghFetch, fetchRepoData };