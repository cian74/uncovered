import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const PopularityGauge = ({ popularity }) => {
    const gaugeRef = useRef();

    useEffect(() => {
        if (popularity === null) return;

        const width = 30, height = 640; 
        const svg = d3.select(gaugeRef.current)
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("*").remove(); 

        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#d8ff0a");

        svg.append("rect")
            .attr("x", 0)
            .attr("y", (height * popularity) / 100) 
            .attr("width", width)
            .attr("height", height - (height * popularity) / 100)
            .attr("fill", "#EF5B5B");
        
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 20) 
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .text(`${popularity}%`);
    }, [popularity]);

    return <svg ref={gaugeRef}></svg>;
};

export default PopularityGauge;
