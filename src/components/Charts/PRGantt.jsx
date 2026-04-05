import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useWidth } from "../common/useWidth";
import { Theme } from "../../lib/theme";

export  default function PRGantt({ prs }) {
    const wrap = useRef();
    const svg = useRef();
    const w = useWidth(wrap);

    useEffect(() => {
        if (!svg.current || !prs.length) return;
        d3.select(svg.current).selectAll("*").remove();

        const shown = prs.slice(0, 10);
        const barH = 16, gap = 4;
        const lw = Math.min(150, Math.floor(w * 0.30));
        const ml = lw + 6, mr = 8, mt = 20, mb = 20;
        const iw = Math.max(w - ml - mr, 10);
        const H = shown.length * (barH + gap) + mt + mb;
        const allD = shown.flatMap((p) => [p.openedAt, p.closedAt].filter(Boolean));

        if (allD.length < 2) return;
        const x = d3.scaleTime([d3.min(allD), d3.max(allD)], [0, iw]);
        const s = d3.select(svg.current).attr("width", w).attr("height", H);
        const g = s.append("g").attr("transform", `translate(${ml},${mt})`);
        const tc = Math.max(2, Math.floor(iw / 65));
        const fmt = w < 350 ? "%b" : "%b %d";
        g.append("g").call(d3.axisTop(x).ticks(tc).tickFormat(d3.timeFormat(fmt)))
            .call((a) => a.select(".domain").attr("stroke", Theme.border))
            .call((a) => a.selectAll("text").attr("fill", Theme.muted).attr("font-size", 8))
            .call((a) => a.selectAll(".tick line").attr("stroke", Theme.border));

        const sc = { merged: Theme.accent, open: Theme.green, closed: Theme.muted };
        shown.forEach((pr, i) => {
            const y0 = i * (barH + gap), col = sc[pr.state];
            const x1 = x(pr.openedAt), x2 = pr.closedAt ? x(pr.closedAt) : iw;
            g.append("rect").attr("x", x1).attr("y", y0).attr("width", Math.max(x2 - x1, 3)).attr("height", barH).attr("rx", 2).attr("fill", col).attr("opacity", 0.16);
            g.append("rect").attr("x", x1).attr("y", y0).attr("width", 3).attr("height", barH).attr("rx", 1.5).attr("fill", col);
            const mc = Math.floor(lw / 6.2);
            const title = pr.title.length > mc ? pr.title.slice(0, mc - 1) + "…" : pr.title;
            g.append("text").attr("x", -5).attr("y", y0 + barH / 2 + 3).attr("text-anchor", "end").attr("font-size", 8).attr("fill", Theme.text).text(title);
        });

        g.append("g").attr("transform", `translate(0,${shown.length * (barH + gap) + 2})`).call(d3.axisBottom(x).ticks(tc).tickFormat(d3.timeFormat(fmt)))
            .call((a) => a.select(".domain").attr("stroke", Theme.border))
            .call((a) => a.selectAll("text").attr("fill", Theme.muted).attr("font-size", 8))
            .call((a) => a.selectAll(".tick line").attr("stroke", Theme.border));
    }, [prs, w]);
    return <div ref={wrap} style={{ width: "100%" }}><svg ref={svg} style={{ display: "block" }} /></div>;
}