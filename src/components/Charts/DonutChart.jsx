import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Theme } from "../../lib/theme";

export default function DonutChart({ data, centerVal, centerLabel }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    d3.select(ref.current).selectAll("*").remove();

    const S = 130,
      R = 48,
      IR = 32;
    const s = d3
      .select(ref.current)
      .attr("viewBox", `0 0 ${S} ${S}`)
      .attr("width", S)
      .attr("height", S);
    const g = s.append("g").attr("transform", `translate(${S / 2},${S / 2})`);
    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);
    const arc = d3.arc().innerRadius(IR).outerRadius(R);
    const arcH = d3
      .arc()
      .innerRadius(IR)
      .outerRadius(R + 5);
    g.selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", Theme.bg)
      .attr("stroke-width", 2)
      .on("mouseover", function () {
        d3.select(this).attr("d", arcH);
      })
      .on("mouseout", function () {
        d3.select(this).attr("d", arc);
      });
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -4)
      .attr("font-size", 15)
      .attr("font-weight", 700)
      .attr("fill", Theme.text)
      .text(centerVal);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 9)
      .attr("font-size", 8)
      .attr("fill", Theme.muted)
      .text(centerLabel);
  }, [data, centerVal, centerLabel]);
  return <svg ref={ref} style={{ display: "block" }} />;
}
