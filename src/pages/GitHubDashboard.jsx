import { useState, useEffect, useRef } from "react";
import { Theme } from "../lib/theme";
import DonutChart from "../components/Charts/DonutChart";
import RadarChart from "../components/Charts/RadarChart";
import TimelineChart from "../components/Charts/TimelineChart";
import FileChart from "../components/Charts/FileChart";
import PRGantt from "../components/Charts/PRGantt";
import ObsidianGraph from "../components/Charts/ObsidianGraph";
import { fetchRepoData } from "../lib/githubApi";
import HeatmapChart from "../components/Charts/HeatmapChart";

const Card = ({ children, style }) => (
    <div style={{ background: Theme.surface, border: `1px solid ${Theme.border}`, borderRadius: 10, padding: "12px 14px", ...style }}>
        {children}
    </div>
);

const SHead = ({ children, sub }) => (
    <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: Theme.text, letterSpacing: 0.5, textTransform: "uppercase" }}>{children}</div>
        {sub && <div style={{ fontSize: 9, color: Theme.muted, marginTop: 2 }}>{sub}</div>}
    </div>
);

const Stat = ({ label, value, color = Theme.accent }) => (
    <div style={{ background: `${color}12`, borderRadius: 8, padding: "9px 10px", border: `1px solid ${color}25`, minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 9, color: Theme.muted, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
    </div>
);

const Tab = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 9px", fontSize: 10, fontWeight: active ? 600 : 400, color: active ? Theme.text : Theme.muted, borderBottom: `2px solid ${active ? Theme.accent : "transparent"}`, transition: "all 0.15s", whiteSpace: "nowrap" }}>{children}</button>
);

const Badge = ({ children, color = Theme.muted }) => (
    <span style={{ background: `${color}20`, color, borderRadius: 4, padding: "1px 5px", fontSize: 8, fontWeight: 600 }}>{children}</span>
);

function RepoSearch({ onLoad }) {
    const [input, setInput] = useState("");
    const [token, setToken] = useState("");
    const [showToken, setShowToken] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState("");
    const [error, setError] = useState("");

    const popular = ["facebook/react", "vercel/next.js", "tailwindlabs/tailwindcss", "microsoft/vscode", "torvalds/linux"];

    async function handleLoad(repoStr) {
        const clean = repoStr.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
        const parts = clean.split("/");
        if (parts.length < 2 || !parts[0] || !parts[1]) { setError("Enter as  owner/repo  or paste a GitHub URL"); return; }
        const [owner, repo] = parts;
        setLoading(true); setError(""); setProgress("");
        try {
            const data = await fetchRepoData(owner, repo, token || null, setProgress);
            onLoad({ owner, repo, token: token || null, ...data });
        } catch (e) { setError(e.message); }
        finally { setLoading(false); setProgress(""); }
    }

    return (
        <div style={{ minHeight: "100vh", background: Theme.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'JetBrains Mono','Fira Code',ui-monospace,monospace" }}>
            <style>{`*{box-sizing:border-box}input{outline:none;transition:border-color .15s}input:focus{border-color:${Theme.accent}!important}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: "100%", maxWidth: 460 }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{ marginBottom: 8 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="36" height="36">
                            <defs><linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#9d8fff"/><stop offset="100%" stopColor="#7C6EF7"/></linearGradient></defs>
                            <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="url(#fg)" opacity="0.15" stroke="#7C6EF7" strokeWidth="2.5"/>
                            <ellipse cx="32" cy="32" rx="10" ry="10" fill="none" stroke="#7C6EF7" strokeWidth="2.5"/>
                            <circle cx="32" cy="32" r="4" fill="#7C6EF7"/>
                            <line x1="14" y1="32" x2="22" y2="32" stroke="#7C6EF7" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                            <line x1="42" y1="32" x2="50" y2="32" stroke="#7C6EF7" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                        </svg>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: Theme.text }}>Repo<span style={{ color: Theme.accent }}>Lens</span></div>
                    <div style={{ fontSize: 11, color: Theme.muted, marginTop: 4 }}>GitHub repository analytics dashboard</div>
                </div>
                <Card>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                            <div style={{ fontSize: 9, color: Theme.muted, marginBottom: 5, letterSpacing: 0.5 }}>REPOSITORY</div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !loading && input.trim() && handleLoad(input)}
                                    placeholder="owner/repo or GitHub URL" disabled={loading}
                                    style={{ flex: 1, background: Theme.bg, border: `1px solid ${Theme.border}`, borderRadius: 7, padding: "8px 11px", color: Theme.text, fontSize: 12, fontFamily: "inherit" }} />
                                <button onClick={() => handleLoad(input)} disabled={loading || !input.trim()}
                                    style={{ background: Theme.accent, border: "none", borderRadius: 7, padding: "8px 16px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: loading || !input.trim() ? 0.5 : 1, whiteSpace: "nowrap", fontFamily: "inherit" }}>
                                    {loading ? "Loading…" : "Analyze →"}
                                </button>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                                <div style={{ fontSize: 9, color: Theme.muted, letterSpacing: 0.5 }}>GITHUB TOKEN <span style={{ color: Theme.subtle }}>(optional · higher rate limits)</span></div>
                                <button onClick={() => setShowToken(!showToken)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, color: Theme.subtle, fontFamily: "inherit" }}>{showToken ? "hide" : "show"}</button>
                            </div>
                            <input type={showToken ? "text" : "password"} value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_…"
                                style={{ width: "100%", background: Theme.bg, border: `1px solid ${Theme.border}`, borderRadius: 7, padding: "7px 11px", color: Theme.text, fontSize: 11, fontFamily: "inherit" }} />
                        </div>
                        {loading && progress && (
                            <div style={{ fontSize: 10, color: Theme.muted, display: "flex", gap: 7, alignItems: "center" }}>
                                <div style={{ width: 10, height: 10, border: `2px solid ${Theme.border}`, borderTopColor: Theme.accent, borderRadius: "50%", animation: "spin .8s linear infinite", flexShrink: 0 }} />
                                {progress}
                            </div>
                        )}
                        {error && (
                            <div style={{ fontSize: 10, background: `${Theme.red}12`, borderRadius: 6, padding: "9px 12px", lineHeight: 1.6 }}>
                                <div style={{ fontWeight: 600, color: Theme.red, marginBottom: 4 }}>⚠ Error</div>
                                <div style={{ color: "#f0a0a0" }}>{error}</div>
                                {(error.includes("sandboxed") || error.includes("Network error")) && (
                                    <div style={{ marginTop: 8, padding: "6px 8px", background: `${Theme.amber}15`, borderRadius: 4, color: Theme.amber, fontSize: 9 }}>
                                        <b>Quick fix:</b> Paste this .jsx into <a href="https://codesandbox.io" target="_blank" rel="noreferrer" style={{ color: Theme.amber }}>CodeSandbox</a> or a local Vite project — GitHub API calls work outside sandboxed iframes. Or add a GitHub token above.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
                <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 9, color: Theme.muted, marginBottom: 7, letterSpacing: 0.5 }}>POPULAR REPOS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {popular.map((r) => (
                            <button key={r} onClick={() => { setInput(r); handleLoad(r); }} disabled={loading}
                                style={{ background: Theme.surfaceHigh, border: `1px solid ${Theme.border}`, borderRadius: 6, padding: "4px 9px", color: Theme.muted, fontSize: 9, cursor: "pointer", fontFamily: "monospace", opacity: loading ? 0.5 : 1 }}>
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ textAlign: "center", marginTop: 24, fontSize: 9, color: Theme.subtle }}>
                    Made with care 💗 © {new Date().getFullYear()} Ponbaskar Uthamalakshmanan
                </div>
            </div>
        </div>
    );
}

export default function GitHubDashboard() {
    const [repoData, setRepoData] = useState(null);
    const [tab, setTab] = useState("overview");
    const [filterAuthor, setFilterAuthor] = useState(null);

    if (!repoData) return <RepoSearch onLoad={(d) => { setRepoData(d); setTab("overview"); setFilterAuthor(null); }} />;

    const { owner, repo, repoInfo, contribs, commits, files, prs, languages } = repoData;
    const filtered = filterAuthor ? commits.filter((c) => c.author.id === filterAuthor) : commits;
    const totalAdd = commits.reduce((s, c) => s + c.additions, 0);
    const totalDel = commits.reduce((s, c) => s + c.deletions, 0);
    const mergedPRs = prs.filter((p) => p.state === "merged").length;
    const openPRs = prs.filter((p) => p.state === "open").length;

    const commitTypes = ["feat", "fix", "refactor", "chore", "docs", "test", "perf", "style"].map((t) => ({
        label: t, value: commits.filter((c) => c.message.startsWith(t)).length,
        color: { feat: Theme.green, fix: Theme.red, refactor: Theme.accent, chore: Theme.amber, docs: Theme.blue, test: Theme.pink, perf: "#A371F7", style: "#EC775A" }[t],
    })).filter((d) => d.value > 0);

    const langTotal = Object.values(languages).reduce((s, v) => s + v, 0);
    const langData = Object.entries(languages).slice(0, 6).map(([name, bytes], i) => ({
        label: name, value: bytes, color: [Theme.accent, Theme.blue, Theme.green, Theme.pink, Theme.amber, "#A371F7"][i % 6],
    }));

    const tabs = [
        { key: "overview", label: "Overview" },
        { key: "commits", label: `Commits (${commits.length})` },
        { key: "files", label: "Files" },
        { key: "prs", label: `PRs (${prs.length})` },
        { key: "graph", label: "Graph" },
    ];

    const grid = (cols) => ({ display: "grid", gridTemplateColumns: cols, gap: 10 });

    return (
        <div style={{ background: Theme.bg, minHeight: "100vh", fontFamily: "'JetBrains Mono','Fira Code',ui-monospace,monospace", color: Theme.text, padding: 14 }}>
            <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:${Theme.bg}}::-webkit-scrollbar-thumb{background:${Theme.border};border-radius:3px}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <button onClick={() => setRepoData(null)} style={{ background: Theme.surfaceHigh, border: `1px solid ${Theme.border}`, borderRadius: 6, padding: "5px 9px", color: Theme.muted, cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>← Back</button>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="30" height="30">
                    <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#9d8fff"/><stop offset="100%" stopColor="#7C6EF7"/></linearGradient></defs>
                    <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="url(#hg)" opacity="0.15" stroke="#7C6EF7" strokeWidth="2.5"/>
                    <ellipse cx="32" cy="32" rx="10" ry="10" fill="none" stroke="#7C6EF7" strokeWidth="2.5"/>
                    <circle cx="32" cy="32" r="4" fill="#7C6EF7"/>
                    <line x1="14" y1="32" x2="22" y2="32" stroke="#7C6EF7" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                    <line x1="42" y1="32" x2="50" y2="32" stroke="#7C6EF7" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                </svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{ color: Theme.muted }}>{owner}</span><span style={{ color: Theme.subtle }}>/</span><span style={{ color: Theme.accent }}>{repo}</span>
                    </div>
                    {repoInfo.description && <div style={{ fontSize: 9, color: Theme.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{repoInfo.description}</div>}
                </div>
                {repoInfo.stargazers_count != null && <div style={{ fontSize: 10, color: Theme.amber }}>★ {repoInfo.stargazers_count.toLocaleString()}</div>}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {contribs.map((c) => (
                        <button key={c.id} title={c.name} onClick={() => setFilterAuthor(filterAuthor === c.id ? null : c.id)}
                            style={{ width: 26, height: 26, borderRadius: "50%", background: filterAuthor === c.id ? c.color : `${c.color}18`, border: `2px solid ${filterAuthor === c.id ? c.color : "transparent"}`, cursor: "pointer", fontSize: 8, fontWeight: 700, color: filterAuthor === c.id ? "#fff" : c.color, transition: "all .15s", fontFamily: "inherit" }}>
                            {c.avatar}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: `1px solid ${Theme.border}`, marginBottom: 12, display: "flex", overflowX: "auto" }}>
                {tabs.map((t) => <Tab key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>{t.label}</Tab>)}
            </div>

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        <Stat label="Commits" value={commits.length} color={Theme.accent} />
                        <Stat label="Lines +" value={`+${(totalAdd / 1000).toFixed(1)}k`} color={Theme.green} />
                        <Stat label="Lines −" value={`-${(totalDel / 1000).toFixed(1)}k`} color={Theme.red} />
                        <Stat label="Merged PRs" value={mergedPRs} color="#A371F7" />
                        <Stat label="Open PRs" value={openPRs} color={Theme.amber} />
                    </div>
                    <div style={{ ...grid("repeat(auto-fit,minmax(260px,1fr))") }}>
                        <Card><SHead sub="Daily commit frequency">Contribution Heatmap</SHead><HeatmapChart commits={filtered} /></Card>
                        <Card><SHead sub="Weekly commit volume">Commit Timeline</SHead><TimelineChart commits={filtered} /></Card>
                    </div>
                    <div style={{ ...grid("repeat(auto-fit,minmax(180px,1fr))") }}>
                        <Card>
                            <SHead sub="By conventional prefix">Commit Types</SHead>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                <DonutChart data={commitTypes.length ? commitTypes : [{ label: "commits", value: 1, color: Theme.muted }]} centerVal={commits.length} centerLabel="commits" />
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    {commitTypes.map((d) => (
                                        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                            <div style={{ width: 6, height: 6, borderRadius: 1, background: d.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: 8, color: Theme.muted }}>{d.label}</span>
                                            <span style={{ fontSize: 8, color: d.color, marginLeft: "auto", paddingLeft: 8 }}>{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                        {langData.length > 0 && (
                            <Card>
                                <SHead sub="Bytes by language">Languages</SHead>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                    <DonutChart data={langData} centerVal={Object.keys(languages).length} centerLabel="langs" />
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {langData.map((d) => (
                                            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: 1, background: d.color, flexShrink: 0 }} />
                                                <span style={{ fontSize: 8, color: Theme.muted }}>{d.label}</span>
                                                <span style={{ fontSize: 8, color: d.color, marginLeft: "auto", paddingLeft: 8 }}>{Math.round((d.value / langTotal) * 100)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        )}
                        <Card><SHead sub="Multi-metric contributor radar">Activity Radar</SHead><RadarChart contributors={contribs} commits={filtered} /></Card>
                    </div>
                </div>
            )}

            {/* ── COMMITS ── */}
            {tab === "commits" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Card><SHead sub="Weekly commit activity">Timeline</SHead><TimelineChart commits={filtered} /></Card>
                    <Card>
                        <SHead sub={`${filtered.length} commits`}>Commit Log</SHead>
                        <div style={{ maxHeight: 460, overflowY: "auto" }}>
                            {[...filtered].reverse().map((c, i) => (
                                <div key={c.sha + i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: `1px solid ${Theme.borderLight}` }}>
                                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${c.author.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: c.author.color, flexShrink: 0 }}>{c.author.avatar}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 10, color: Theme.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.message || "(no message)"}</div>
                                        <div style={{ display: "flex", gap: 6, fontSize: 8, color: Theme.muted, flexWrap: "wrap" }}>
                                            <span style={{ color: Theme.accent, fontFamily: "monospace" }}>{c.sha}</span>
                                            <span style={{ color: c.author.color }}>{c.author.name}</span>
                                            <span>{c.date.toLocaleDateString()}</span>
                                            <span style={{ color: Theme.green }}>+{c.additions}</span>
                                            <span style={{ color: Theme.red }}>-{c.deletions}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, maxWidth: 100, flexShrink: 0 }}>
                                        {c.files.slice(0, 2).map((f) => <Badge key={f} color={Theme.blue}>{f.split("/").pop().slice(0, 10)}</Badge>)}
                                        {c.files.length > 2 && <Badge color={Theme.muted}>+{c.files.length - 2}</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* ── FILES ── */}
            {tab === "files" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Card><SHead sub="Top 10 files · additions vs deletions">File Changes</SHead><FileChart files={files} /></Card>
                    <Card>
                        <SHead sub="File-level activity">File Details</SHead>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${Theme.border}` }}>
                                        {["File", "Commits", "+Lines", "−Lines", "Net", "Authors"].map((h) => (
                                            <th key={h} style={{ textAlign: "left", padding: "6px 5px", color: Theme.muted, fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...files].sort((a, b) => b.additions - a.additions).map((f) => (
                                        <tr key={f.file} style={{ borderBottom: `1px solid ${Theme.borderLight}` }}>
                                            <td style={{ padding: "6px 5px", color: Theme.accent, fontFamily: "monospace", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.file}>{f.short}</td>
                                            <td style={{ padding: "6px 5px", color: Theme.muted }}>{f.commits}</td>
                                            <td style={{ padding: "6px 5px", color: Theme.green }}>+{f.additions}</td>
                                            <td style={{ padding: "6px 5px", color: Theme.red }}>-{f.deletions}</td>
                                            <td style={{ padding: "6px 5px", color: f.additions - f.deletions >= 0 ? Theme.green : Theme.red }}>{f.additions - f.deletions >= 0 ? "+" : ""}{f.additions - f.deletions}</td>
                                            <td style={{ padding: "6px 5px" }}>
                                                <div style={{ display: "flex", gap: 2 }}>
                                                    {(f.authors || []).slice(0, 4).map((a) => a && (
                                                        <span key={a.id} title={a.name} style={{ width: 14, height: 14, borderRadius: "50%", background: `${a.color}20`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 6, color: a.color, fontWeight: 700 }}>{a.avatar}</span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ── PRs ── */}
            {tab === "prs" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Card><SHead sub="PR lifecycle · open to close">PR Timeline</SHead><PRGantt prs={prs} /></Card>
                    <div style={{ ...grid("repeat(auto-fill,minmax(220px,1fr))") }}>
                        {prs.map((pr) => (
                            <div key={pr.id} style={{ background: Theme.surface, border: `1px solid ${Theme.border}`, borderLeft: `3px solid ${pr.state === "merged" ? Theme.accent : pr.state === "open" ? Theme.green : Theme.border}`, borderRadius: 8, padding: "9px 11px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 5 }}>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: Theme.text, lineHeight: 1.4, flex: 1, overflow: "hidden" }}>#{pr.id} {pr.title}</div>
                                    <Badge color={pr.state === "merged" ? Theme.accent : pr.state === "open" ? Theme.green : Theme.muted}>{pr.state}</Badge>
                                </div>
                                <div style={{ display: "flex", gap: 7, fontSize: 8, color: Theme.muted, flexWrap: "wrap" }}>
                                    <span style={{ color: pr.author.color }}>@{pr.author.name}</span>
                                    {pr.additions > 0 && <span style={{ color: Theme.green }}>+{pr.additions}</span>}
                                    {pr.deletions > 0 && <span style={{ color: Theme.red }}>-{pr.deletions}</span>}
                                    {pr.changedFiles > 0 && <span>{pr.changedFiles} files</span>}
                                    {pr.comments > 0 && <span>💬 {pr.comments}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── GRAPH ── */}
            {tab === "graph" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Card>
                        <SHead sub="Force-directed · drag · scroll to zoom · hover to highlight">Obsidian Knowledge Graph</SHead>
                        <ObsidianGraph files={files} commits={filtered} contributors={contribs} />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                            {contribs.map((c) => (
                                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.color }} />
                                    <span style={{ fontSize: 8, color: c.color }}>{c.name}</span>
                                </div>
                            ))}
                            {[["TS/TSX", Theme.blue], ["CSS", Theme.pink], ["Config", Theme.amber], ["Other", Theme.green]].map(([l, col]) => (
                                <div key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: 1, background: col }} />
                                    <span style={{ fontSize: 8, color: Theme.muted }}>{l}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <div style={{ ...grid("repeat(auto-fill,minmax(130px,1fr))") }}>
                        {contribs.map((c) => {
                            const mc = commits.filter((cm) => cm.author.id === c.id);
                            const mf = [...new Set(mc.flatMap((cm) => cm.files))];
                            return (
                                <Card key={c.id} style={{ borderColor: `${c.color}30` }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: c.color, border: `2px solid ${c.color}45` }}>{c.avatar}</div>
                                        <div style={{ fontSize: 9, fontWeight: 600, color: Theme.text, textAlign: "center" }}>{c.name}</div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, width: "100%" }}>
                                            <div style={{ textAlign: "center" }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{mc.length}</div>
                                                <div style={{ fontSize: 7, color: Theme.muted }}>commits</div>
                                            </div>
                                            <div style={{ textAlign: "center" }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{mf.length}</div>
                                                <div style={{ fontSize: 7, color: Theme.muted }}>files</div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Watermark */}
            <div style={{ textAlign: "center", padding: "18px 0 8px", fontSize: 9, color: Theme.subtle }}>
                Made with care 💗 © {new Date().getFullYear()} Ponbaskar Uthamalakshmanan
            </div>
        </div>
    );
}