import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import * as d3 from "d3";

const PopularityGauge = ({popularity}) => {
    const gaugeRef = useRef();

    useEffect(() => {
        if (popularity === null) return;

        const width = 40, height = 100;
        const reversedPopularity = 100 - popularity;
        const svg = d3.select(gaugeRef.current)
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("*").remove(); 

        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#ddd");

        svg.append("rect")
            .attr("x", 0)
            .attr("y", (height * reversedPopularity) / 100)
            .attr("width", width)
            .attr("height", (height * popularity) / 100) 
            .attr("fill", "green");
        
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 15) 
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "black")
            .text(`${reversedPopularity}%`);
    }, [popularity]);

    return <svg ref={gaugeRef}></svg>
};

export default PopularityGauge;