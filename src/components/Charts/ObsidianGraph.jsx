import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useWidth } from "../common/useWidth";
import { Theme } from "../../lib/theme";

export default function ObsidianGraph({ commits, contributors }) {
  const wrap = useRef(); 
  const svgRef = useRef(); 
  const simRef = useRef(null);
  const w = useWidth(wrap);

  useEffect(() => {
    if (!svgRef.current || !commits.length || !contributors.length) return;
    d3.select(svgRef.current).selectAll("*").remove();
    if (simRef.current) simRef.current.stop();
    const H = Math.max(Math.floor(w * 0.6), 300);

    const weekMap = {};
    commits.forEach((c) => {
      const wk = d3.timeWeek.floor(c.date).toISOString().slice(0, 10);
      if (!weekMap[wk]) weekMap[wk] = { id: wk, label: wk.slice(5), type: "week", count: 0, authors: new Set() };
      weekMap[wk].count++;
      weekMap[wk].authors.add(c.author.id);
    });
    const weeks = Object.values(weekMap).sort((a, b) => a.id.localeCompare(b.id)).slice(-20);
    const weekIds = new Set(weeks.map((w) => w.id));

    const nodes = [
      ...contributors.map((c) => ({ id: c.id, label: c.name.slice(0, 10), type: "contributor", size: 10, color: c.color })),
      ...weeks.map((wk) => ({ id: wk.id, label: wk.label, type: "week", size: Math.sqrt(wk.count) * 2.5 + 4, color: Theme.accent })),
    ];

    const links = [];
    weeks.forEach((wk) => {
      wk.authors.forEach((aid) => {
        if (contributors.find((c) => c.id === aid)) links.push({ source: aid, target: wk.id });
      });
    });

    const s = d3.select(svgRef.current).attr("width", w).attr("height", H);
    s.append("rect").attr("width", w).attr("height", H).attr("fill", Theme.bg).attr("rx", 8);
    const g = s.append("g");
    s.call(d3.zoom().scaleExtent([0.3, 4]).on("zoom", (e) => g.attr("transform", e.transform)));

    const link = g.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", Theme.accent).attr("stroke-opacity", 0.15).attr("stroke-width", 0.8);

    const node = g.append("g").selectAll("g").data(nodes).join("g").attr("cursor", "grab")
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) simRef.current.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) simRef.current.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.filter((d) => d.type === "contributor")
      .append("circle").attr("r", (d) => d.size + 6).attr("fill", (d) => d.color).attr("opacity", 0.12);

    node.append("circle")
      .attr("r", (d) => d.size)
      .attr("fill", (d) => d.color)
      .attr("fill-opacity", (d) => d.type === "contributor" ? 0.85 : 0.35)
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", (d) => d.type === "contributor" ? 2 : 1)
      .attr("stroke-opacity", 0.9);

    node.append("text")
      .attr("dy", (d) => d.size + 9)
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => d.type === "contributor" ? 8 : 7)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.9)
      .text((d) => d.label);

    node.on("mouseover", function (_, hov) {
      const conn = new Set([hov.id]);
      links.forEach((l) => {
        const sid = l.source.id ?? l.source;
        const tid = l.target.id ?? l.target;
        if (sid === hov.id || tid === hov.id) { conn.add(sid); conn.add(tid); }
      });
      node.attr("opacity", (d) => conn.has(d.id) ? 1 : 0.1);
      link.attr("stroke-opacity", (l) => {
        const sid = l.source.id ?? l.source;
        const tid = l.target.id ?? l.target;
        return (sid === hov.id || tid === hov.id) ? 0.7 : 0.02;
      });
    }).on("mouseout", () => { node.attr("opacity", 1); link.attr("stroke-opacity", 0.15); });

    simRef.current = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(60).strength(0.4))
      .force("charge", d3.forceManyBody().strength(-80))
      .force("center", d3.forceCenter(w / 2, H / 2))
      .force("collision", d3.forceCollide((d) => d.size + 8))
      .on("tick", () => {
        link.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });
    return () => simRef.current?.stop();
  }, [commits, contributors, w]);
  return <div ref={wrap} style={{ width: "100%", borderRadius: 8, overflow: "hidden" }}><svg ref={svgRef} style={{ display: "block" }} /></div>;
}