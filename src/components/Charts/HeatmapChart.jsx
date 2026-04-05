import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useWidth } from "../common/useWidth";
import { Theme } from "../../lib/theme";

export default function HeatmapChart({ commits }) {
    const wrap = useRef();
    const svg = useRef();

    const w = useWidth(wrap);

    useEffect(() => {
        if (!svg.current || !commits.length) return;

        d3.select(svg.current).selectAll("*").remove();

        const cell = Math.max(Math.floor((w - 28) / 26) - 2, 7), gap = 2;
        const weeks = Math.floor((w - 28) / (cell + gap));
        const H = 7 * (cell + gap) + 28;
        const byDay = {};

        commits.forEach((c) => { const k = c.date.toISOString().slice(0, 10); byDay[k] = (byDay[k] || 0) + 1; });

        const color = d3.scaleSequential([0, Math.max(...Object.values(byDay), 1)], [Theme.surfaceHigh, Theme.accent]);
        const s = d3.select(svg.current).attr("width", w).attr("height", H);
        const sorted = [...commits].sort((a, b) => a.date - b.date);
        const start = sorted.length ? d3.timeWeek.floor(sorted[0].date) : new Date();
        const days = Array.from({ length: weeks * 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });

        s.selectAll("rect").data(days).join("rect")
            .attr("x", (d) => Math.floor(d3.timeDay.count(start, d) / 7) * (cell + gap) + 26)
            .attr("y", (d) => d.getDay() * (cell + gap) + 4)
            .attr("width", cell).attr("height", cell).attr("rx", 2)
            .attr("fill", (d) => color(byDay[d.toISOString().slice(0, 10)] || 0))
            .attr("stroke", Theme.border).attr("stroke-width", 0.4);
        ["M", "", "W", "", "F", "", ""].forEach((l, i) => {
            if (!l) return;
            s.append("text").attr("x", 22).attr("y", i * (cell + gap) + 4 + cell / 2 + 3)
                .attr("text-anchor", "end").attr("font-size", 8).attr("fill", Theme.muted).text(l);
        });
    }, [commits, w]);

    return <div ref={wrap} style={{ width: "100%" }}><svg ref={svg} style={{ display: "block" }} /></div>;
}
