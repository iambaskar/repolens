import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useWidth } from "../common/useWidth";
import { Theme } from "../../lib/theme";


export default function TimelineChart({ commits }) {
    const wrap = useRef();
    const svg = useRef();
    const w = useWidth(wrap);

    useEffect(() => {
        if (!svg.current || !commits.length) return;

        d3.select(svg.current).selectAll("*").remove();

        const ml = 28, mr = 8, mt = 8, mb = 24, H = 120;
        const iw = Math.max(w - ml - mr, 10), ih = H - mt - mb;
        const byWeek = d3.rollup(commits, (v) => v.length, (c) => d3.timeWeek.floor(c.date));
        const data = Array.from(byWeek, ([date, count]) => ({ date, count })).sort((a, b) => a.date - b.date);

        if (data.length < 2) return;
        const x = d3.scaleTime([data[0].date, data[data.length - 1].date], [0, iw]);
        const y = d3.scaleLinear([0, d3.max(data, (d) => d.count) || 1], [ih, 0]);
        const gid = `g${Math.random().toString(36).slice(2)}`;
        const s = d3.select(svg.current).attr("width", w).attr("height", H);
        const defs = s.append("defs");
        const gr = defs.append("linearGradient").attr("id", gid).attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 1);

        gr.append("stop").attr("offset", "0%").attr("stop-color", Theme.accent).attr("stop-opacity", 0.3);
        gr.append("stop").attr("offset", "100%").attr("stop-color", Theme.accent).attr("stop-opacity", 0.02);

        const g = s.append("g").attr("transform", `translate(${ml},${mt})`);
        g.append("path").datum(data).attr("fill", `url(#${gid})`)
            .attr("d", d3.area().x((d) => x(d.date)).y0(ih).y1((d) => y(d.count)).curve(d3.curveMonotoneX));
        g.append("path").datum(data).attr("fill", "none").attr("stroke", Theme.accent).attr("stroke-width", 1.5)
            .attr("d", d3.line().x((d) => x(d.date)).y((d) => y(d.count)).curve(d3.curveMonotoneX));

        const tc = Math.max(2, Math.floor(iw / 80));
        g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(tc).tickFormat(d3.timeFormat(w < 300 ? "%b" : "%b %d")))
            .call((a) => a.select(".domain").attr("stroke", Theme.border))
            .call((a) => a.selectAll("text").attr("fill", Theme.muted).attr("font-size", 8))
            .call((a) => a.selectAll(".tick line").attr("stroke", Theme.border));
        g.append("g").call(d3.axisLeft(y).ticks(3))
            .call((a) => a.select(".domain").remove())
            .call((a) => a.selectAll("text").attr("fill", Theme.muted).attr("font-size", 8))
            .call((a) => a.selectAll(".tick line").attr("x2", iw).attr("stroke", Theme.border).attr("stroke-dasharray", "3 3").attr("opacity", 0.4));
    }, [commits, w]);

    return <div ref={wrap} style={{ width: "100%" }}><svg ref={svg} style={{ display: "block" }} /></div>;
}