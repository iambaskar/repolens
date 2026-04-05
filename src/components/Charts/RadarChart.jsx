import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useWidth } from "../common/useWidth";
import { Theme } from "../../lib/theme";


export default function RadarChart({ contributors, commits }) {
    const wrap = useRef();
    const svg = useRef();
    const w = useWidth(wrap);

    useEffect(() => {
        if (!svg.current || !contributors.length) return;
        d3.select(svg.current).selectAll("*").remove();

        const sz = Math.min(w, 200), cx = sz / 2, cy = sz / 2, R = sz * 0.36;
        const metrics = ["Commits", "Adds", "Dels", "Files"];
        const data = contributors.map((c) => {
            const mc = commits.filter((cm) => cm.author.id === c.id);
            return { contributor: c, values: [mc.length, mc.reduce((s, cm) => s + cm.additions, 0), mc.reduce((s, cm) => s + cm.deletions, 0), [...new Set(mc.flatMap((cm) => cm.files))].length] };
        });
        const maxV = metrics.map((_, i) => d3.max(data, (d) => d.values[i]) || 1);
        const norm = data.map((d) => ({ ...d, norm: d.values.map((v, i) => v / maxV[i]) }));
        const angle = (i) => (i / metrics.length) * 2 * Math.PI - Math.PI / 2;
        const s = d3.select(svg.current).attr("width", sz).attr("height", sz);
        [0.25, 0.5, 0.75, 1].forEach((r) => {
            s.append("polygon").attr("points", metrics.map((_, i) => [cx + Math.cos(angle(i)) * R * r, cy + Math.sin(angle(i)) * R * r].join(",")).join(" ")).attr("fill", "none").attr("stroke", Theme.border).attr("stroke-width", 0.5);
        });
        metrics.forEach((m, i) => {
            const a = angle(i);
            s.append("line").attr("x1", cx).attr("y1", cy).attr("x2", cx + Math.cos(a) * R).attr("y2", cy + Math.sin(a) * R).attr("stroke", Theme.border).attr("stroke-width", 0.5);
            s.append("text").attr("x", cx + Math.cos(a) * (R + 11)).attr("y", cy + Math.sin(a) * (R + 11) + 3).attr("text-anchor", "middle").attr("font-size", 7).attr("fill", Theme.muted).text(m);
        });
        norm.forEach((d) => {
            s.append("polygon").attr("points", d.norm.map((v, i) => [cx + Math.cos(angle(i)) * R * Math.max(v, 0.04), cy + Math.sin(angle(i)) * R * Math.max(v, 0.04)].join(",")).join(" ")).attr("fill", d.contributor.color).attr("fill-opacity", 0.12).attr("stroke", d.contributor.color).attr("stroke-width", 1.5).attr("stroke-opacity", 0.8);
        });
    }, [contributors, commits, w]);
    return <div ref={wrap} style={{ width: "100%", display: "flex", justifyContent: "center" }}><svg ref={svg} style={{ display: "block" }} /></div>;
}