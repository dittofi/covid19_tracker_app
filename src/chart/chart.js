import React from 'react';
import * as d3 from 'd3';
import { select as d3Select } from 'd3-selection';
import uuidv1 from "uuid";

import Axis from './axis.js';
import Grid from './grid.js';
import LineChart from './line.js';
import ImageChart from './image.js';

class Chart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			zoomTransform: null,
		}

		this.uuid = `_${uuidv1()}`;
		this.zoom = d3.zoom().on("zoom", this.zoomFunction.bind(this));
	}

	componentDidMount() {
		const svg = d3Select(this.svg);
		svg.call(this.zoom);

		document.addEventListener("keyup", this.keyUp.bind(this));
	}

	zoomFunction() {
		this.setState({
			zoomTransform: d3.event.transform,
		})
	}

	keyUp(event) {
		const keyCode = event.which || event.keyCode;
		if(keyCode === 27) {
			this.zoom.transform(d3Select(this.svg), d3.zoomIdentity);
		}
	}

	render() {
		const { 
			timeseriesData, 
			measuresData, 
			height, 
			width, 
			onClick,
			measure,
		} = this.props;

		const { zoomTransform } = this.state;
		
		// Margins.
		const marginTop = 10;
		const marginRight = 25; 
		const marginBottom = 25; 
		const marginLeft = 50;

		// Find min & max values.
		let minX = Math.min(d3.min(timeseriesData, function(d) { return d.date; }), d3.min(measuresData, function(d) { return d.date_implemented; }))
		let maxX = Math.max(d3.max(timeseriesData, function(d) { return d.date; }), d3.max(measuresData, function(d) { return d.date_implemented; }))
		let minY = d3.min(timeseriesData, function(d) { return d.value; });
		let maxY = d3.max(timeseriesData, function(d) { return d.value; });

		if(!minX) { minX = new Date(2020, 1, 1); }
		if(!maxX) { maxX = new Date(); }
		if(!minY) { minY = 0 }
		if(!maxY) { maxY = 1 }

		// Build X & Y scale.
		const xScale = d3.scaleTime()
			.domain([minX, maxX])
			.range([marginLeft, width - marginRight]);

		const yScale = d3.scaleLinear()
			.domain([minY, maxY])
			.range([height - marginBottom, marginTop]);

		// Update zoom.
		if(zoomTransform) {
			xScale.domain(zoomTransform.rescaleX(xScale).domain());
			yScale.domain(zoomTransform.rescaleY(yScale).domain());
		}

		// Set grid & axis props.
		const xProps = {
			orient: 'Bottom',
			scale: xScale,
			translate: `translate(0, ${height - marginBottom})`,
			tickSize: height - marginTop - marginBottom,
		}

		const yProps = {
			orient: 'Left',
			scale: yScale,
			translate: `translate(${marginLeft}, 0)`,
			tickSize: width - marginLeft - marginRight,
		}

		return (
			<svg ref={(el) => { this.svg = el; }} style={{height:`${height}px`, width:`${width}px`}}>
				<defs>
		            <clipPath id={this.uuid}>
		                <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={height - marginTop - marginBottom}/>
		            </clipPath>
		        </defs>
	        	<Grid {...yProps} color={"#ddd"} />
				<Grid {...xProps} color={"#ddd"} />
				<Axis {...xProps} color={"#ddd"} />
				<Axis {...yProps} color={"#ddd"} />
				<g clipPath={`url(#${this.uuid})`}>
					<LineChart
						xScale={xScale}
						yScale={yScale}
						data={timeseriesData}
					/>
					<ImageChart
						xScale={xScale}
						data={measuresData}
						height={height}
						onClick={onClick}
					/>
				</g>
			</svg>
		);
	}
}

export default Chart;