import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import * as d3 from "d3";

const PopularityGauge = ({popularity}) => {
    const gaugeRef = useRef();

    useEffect(() => {
        if (popularity === null) return;

        const width = 150, height = 100, radius = width / 2;
        const svg = d3.select(gaugeRef.current)
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("*").remove(); // Clear previous render

        const arc = d3.arc()
            .innerRadius(radius - 15)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .endAngle((Math.PI / 2) * (popularity / 100) - Math.PI / 2);

        svg.append("path")
            .attr("d", arc)
            .attr("fill", "green")
            .attr("transform", `translate(${width / 2},${height})`);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "black")
            .text(`${popularity}%`);
    }, [popularity]);

    return <svg ref={gaugeRef}></svg>;
};

export default PopularityGauge;