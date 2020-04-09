import React from 'react';
import * as d3 from 'd3';

export default function LineChart(props) {
	// Get props.
	const { xScale, yScale, data } = props;

	// Build line function.
	var line = d3.line()
		.x(function(d) { return xScale(d.date); })
		.y(function(d) { return yScale(d.value); });

	var linePlot = line(data);

	// Plot.
	return (
		<path 
			className="line" 
			d={linePlot} 
			style={{fill:'none', strokeWidth:'1.5px', stroke:"red"}}
		/>
	);
}
