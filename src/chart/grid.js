import React from 'react';
import * as d3Axis from 'd3-axis';
import { select as d3Select } from 'd3-selection';

export default class Grid extends React.Component {
	componentDidMount() {
		this.renderGrid();
	}

	componentDidUpdate(prevProps, prevState) {
		this.renderGrid();
	}

	renderGrid() {
		const axisElement = d3Select(this.axisElement);

		// Render the axis.
		const axisType = `axis${this.props.orient}`
		const axis = d3Axis[axisType]()
			.scale(this.props.scale)
			.tickSize(-this.props.tickSize)
			.tickFormat("");

		axisElement.call(axis);

		// Color the axis.
		axisElement.selectAll('line').style('stroke', this.props.color);
	}

	render() {
		return (
			<g
				className={`Grid Grid-${this.props.orient}`}
				ref={(el) => { this.axisElement = el; }}
				transform={this.props.translate}
			/>
		);
	}
}