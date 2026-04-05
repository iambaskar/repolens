import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useWidth } from "../common/useWidth";
import { Theme } from "../../lib/theme";


export default function FileChart({ files }) {
    const wrap = useRef();
    const svg = useRef();
    const w = useWidth(wrap);

    useEffect(() => {
        if (!svg.current || !files.length) return;
        d3.select(svg.current).selectAll("*").remove();

        const sorted = [...files].sort((a, b) => b.additions + b.deletions - (a.additions + a.deletions)).slice(0, 10);
        const barH = 18, gap = 5;
        const lw = Math.min(110, Math.floor(w * 0.26));
        const ml = lw + 4, mr = 6, mt = 4, mb = 24;
        const iw = Math.max(w - ml - mr, 20), ih = sorted.length * (barH + gap);
        const H = ih + mt + mb;
        const maxV = d3.max(sorted, (d) => d.additions + d.deletions) || 1;
        const mid = iw / 2;
        const xA = d3.scaleLinear([0, maxV], [0, mid]);
        const xD = d3.scaleLinear([0, maxV], [0, mid]);
        const s = d3.select(svg.current).attr("width", w).attr("height", H);
        const g = s.append("g").attr("transform", `translate(${ml},${mt})`);
        g.append("line").attr("x1", mid).attr("x2", mid).attr("y1", -2).attr("y2", ih)
            .attr("stroke", Theme.border).attr("stroke-dasharray", "3 3").attr("stroke-width", 0.5);

        const row = g.selectAll(".r").data(sorted).join("g").attr("class", "r")
            .attr("transform", (_, i) => `translate(0,${i * (barH + gap)})`);
        row.append("rect").attr("x", (d) => mid - xA(d.additions)).attr("y", 0).attr("width", (d) => xA(d.additions)).attr("height", barH).attr("rx", 2).attr("fill", Theme.green).attr("opacity", 0.7);
        row.append("rect").attr("x", mid).attr("y", 0).attr("width", (d) => xD(d.deletions)).attr("height", barH).attr("rx", 2).attr("fill", Theme.red).attr("opacity", 0.7);

        const maxChars = Math.floor(lw / 6);
        row.append("text").attr("x", -5).attr("y", barH / 2 + 3).attr("text-anchor", "end")
            .attr("font-size", 9).attr("fill", Theme.text)
            .text((d) => d.short.length > maxChars ? d.short.slice(0, maxChars - 1) + "…" : d.short);

        const ly = ih + 12;
        g.append("rect").attr("x", mid - 55).attr("y", ly).attr("width", 7).attr("height", 7).attr("rx", 1).attr("fill", Theme.green);
        g.append("text").attr("x", mid - 45).attr("y", ly + 6).attr("font-size", 8).attr("fill", Theme.muted).text("Additions");
        g.append("rect").attr("x", mid + 18).attr("y", ly).attr("width", 7).attr("height", 7).attr("rx", 1).attr("fill", Theme.red);
        g.append("text").attr("x", mid + 28).attr("y", ly + 6).attr("font-size", 8).attr("fill", Theme.muted).text("Deletions");
    }, [files, w]);
    return <div ref={wrap} style={{ width: "100%" }}><svg ref={svg} style={{ display: "block" }} /></div>;
}
