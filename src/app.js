import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AutoSizer from "react-virtualized-auto-sizer";
import * as d3 from 'd3';

import Chart from './chart/chart.js';

import { countries } from './utils/countries.js';
import { getTimeseriesData, getBriefData } from './utils/rest_api.js';
import { measures } from './utils/measures.js';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			country: "USA",
			metric: "confirmed",
			startDate: new Date(2020, 1, 1),
			endDate: new Date(),

			measuresData:[],
			timeseriesData:[],
			countryTotalConfirmed: null,
			countryTotalRecovered: null,
			countryTotalDeaths: null,

			measure: {},

			loading: false,
		}

		this.onPlot = this.onPlot.bind(this);
		this.onClick = this.onClick.bind(this);
	}

	componentDidMount() {
		var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S%Z");
		measures.forEach((measure) => measure.date_implemented = parseTime(measure.date_implemented));
		this.onPlot();
	}

	onClick(measure) {
		this.setState({
			measure: measure,
		})
	}

	async onPlot() {
		this.setState({
			loading:true
		}, async () => {
			// Get state.
			const { country, metric, startDate, endDate } = this.state;

			// Declare variables.
			let timeseriesData = [];
			
			let countryTotalConfirmed = 0;
			let countryTotalRecovered = 0;
			let countryTotalDeaths = 0;

			let worldTotalConfirmed = 0;
			let worldTotalRecovered = 0;
			let worldTotalDeaths = 0;
			
			// Get time series data.
			let data = await getTimeseriesData(country);
			if(data.data && data.data.length > 0) {
				data = data.data[0] && data.data[0].timeseries ? data.data[0].timeseries : {};

				var parseTime = d3.timeParse("%-m/%-d/%y");
				Object.keys(data).forEach((key) => {
					let date = parseTime(key);
					if(date >= startDate && date <= endDate) {
						const value = data[key][metric];
						timeseriesData.push({date:date, value:value});
					}

					countryTotalConfirmed = countryTotalConfirmed + data[key].confirmed;
					countryTotalRecovered = countryTotalRecovered + data[key].recovered;
					countryTotalDeaths = countryTotalDeaths + data[key].deaths;
				});
			}

			// Get brief data.
			data = await getBriefData();
			if(data.data) {
				worldTotalConfirmed = data.data.confirmed;
				worldTotalDeaths = data.data.deaths;
				worldTotalRecovered = data.data.recovered;
			}

			// Get measures data.
			let measuresData = [];
			measures.forEach((measure) => {
				if(measure.iso === country && measure.date_implemented <= endDate && measure.date_implemented >= startDate) {
					measuresData.push(measure);
				}
			});

			// Update state.
			this.setState({
				measuresData: measuresData,
				timeseriesData: timeseriesData,
				countryTotalConfirmed: countryTotalConfirmed,
				countryTotalRecovered: countryTotalRecovered,
				countryTotalDeaths: countryTotalDeaths,
				worldTotalConfirmed: worldTotalConfirmed,
				worldTotalDeaths: worldTotalDeaths,
				worldTotalRecovered: worldTotalRecovered,
				loading: false,
			})			
		})
	}

	render() {
		const { 
			country, 
			metric, 
			startDate, 
			endDate, 
			measuresData,
			timeseriesData,
			countryTotalDeaths,
			countryTotalRecovered,
			countryTotalConfirmed,
			worldTotalDeaths,
			worldTotalRecovered,
			worldTotalConfirmed,
			measure,
			loading,		
		} = this.state;

		return (
			<div className="d-flex flex-column" style={{height:"100vh", width:"100vw"}}>
				{loading && <div className="loader"><i className="fa fa-spinner fa-spin"></i></div>}
				<header style={{fontSize:"22px"}}>
					Monitor how well YOUR policy maker is dealing with the coronavirus
				</header>
				<div className="flex-grow-1 d-flex p-3">
					<div className="card flex-grow-1 mr-3">
						<div className="card-body d-flex flex-column">
							<Form
								country={country}
								metric={metric}
								startDate={startDate}
								endDate={endDate}

								onCountryChange={(e) => this.setState({country:e.target.value})}
								onMetricChange={(e) => this.setState({metric:e.target.value})}
								onStartDateChange={(val) => this.setState({startDate:val})}
								onEndDateChange={(val) => this.setState({endDate:val})}

								onPlot={this.onPlot}
							/>
							<div className="flex-grow-1" style={{position:"relative"}}>
								<AutoSizer>
									{({ height, width }) => (						
										<Chart
											height={height}
											width={width}
											metric={metric}
											timeseriesData={timeseriesData}
											measuresData={measuresData}
											onClick={this.onClick}
										/>	
									)}
								</AutoSizer>
							</div>
						</div>
					</div>
					<div className="card" style={{flex:"0 0 300px"}}>
						<div className="card-body">
							<div style={{position: "relative", height:"100%", width:"100%"}}>
								<div style={{
									position:"absolute", 
									left:"0px", 
									right:"0px", 
									top:"0px", 
									bottom:"0px", 
									overflowY:"auto", 
									overflowX:"hidden"
								}}>
									<MetricsTable 
										country={country}
										countryTotalDeaths={countryTotalDeaths}
										countryTotalRecovered={countryTotalRecovered}
										countryTotalConfirmed={countryTotalConfirmed}
										worldTotalConfirmed={worldTotalConfirmed}
										worldTotalDeaths={worldTotalDeaths}
										worldTotalRecovered={worldTotalRecovered}
									/>
									<MeasuresTable
										measure={measure}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<footer>
					<div>Last Updated: 10/10/2020</div>
					<div>Made by dittofi. The global ranking is computed as the total number of reported active cases as a % of the countries total population. Please note that the statistics are only based on those cases reported.</div>
				</footer>
			</div>
		);
	}
}

function Form(props) {
	return (
		<form className="form-inline">
			<label>Compare:</label>
			<select
				className="form-control ml-1" 
				value={props.country}
				onChange={props.onCountryChange}
			>
			{countries.map((country, i) => {
				return (
					<option key={i} value={country.iso3}>{country.Country}</option>
				);
			})}
			</select>
			<label className="ml-1">VS</label>
			<select
				className="form-control ml-1 mr-1" 
				onChange={props.onMetricChange}
				value={props.metric}
			>
				<option value="confirmed">Total confirmed cases</option>
				<option value="recovered">Total recovered</option>
				<option value="deaths">Total dead</option>
			</select>
			<DatePicker
				onChange={props.onStartDateChange}
				selected={props.startDate}
			/>
			<label className="ml-1 mr-1">-</label>
			<DatePicker
				onChange={props.onEndDateChange}
				selected={props.endDate}
			/>
			<button 
				className="btn ml-auto"
				onClick={(e) => {
					e.preventDefault();
					props.onPlot();
				}}
			>
				Submit
			</button>
		</form>
	);
}

function MetricsTable(props) {
	const { 
		country, 
		countryTotalConfirmed, 
		countryTotalRecovered, 
		countryTotalDeaths,
		worldTotalDeaths,
		worldTotalRecovered,
		worldTotalConfirmed,
	} = props;

	let countryTotalActive;
	if(countryTotalConfirmed && countryTotalRecovered && countryTotalDeaths) {
		countryTotalActive = countryTotalConfirmed - countryTotalRecovered - countryTotalDeaths;
	}

	let worldTotalActive;
	if(worldTotalConfirmed && worldTotalRecovered && worldTotalDeaths) {
		worldTotalActive = worldTotalConfirmed - worldTotalRecovered - worldTotalDeaths;
	}	

	return (
		<div>
			<table className="table">
			    <thead>
			        <tr>
			            <th></th>
			            <th>{country}</th>
			            <th>World</th>
			        </tr>
			    </thead>
			    <tbody>
			        <tr>
			            <td><span>Total Count</span></td>
			            <td>{countryTotalConfirmed}</td>
			            <td>{worldTotalConfirmed}</td>
			        </tr>
			        <tr>
			            <td><span>Total Active</span></td>
			            <td>{countryTotalActive}</td>
			            <td>{worldTotalActive}</td>
			        </tr>
			        <tr>
			            <td><span>Total Dead</span></td>
			            <td>{countryTotalDeaths}</td>
			            <td>{worldTotalDeaths}</td>
			        </tr>
			        <tr>
			            <td><span>Total Recovered</span></td>
			            <td>{countryTotalRecovered}</td>
			            <td>{worldTotalRecovered}</td>
			        </tr>
			    </tbody>
			</table>
		</div>
	);
}

function MeasuresTable(props) {
	const { measure } = props;
	var formatTime = d3.timeFormat("%B %d, %Y");
	return (
		<div>
			<table className="table">
			    <tbody>
			        <tr>
			            <td><span>Category</span></td>
			            <td>{measure.category}</td>
			        </tr>
			        <tr>
			            <td><span>Comments</span></td>
			            <td>{measure.comments}</td>
			        </tr>
			        <tr>
			            <td><span>Country</span></td>
			            <td>{measure.country}</td>
			        </tr>
			        <tr>
			            <td><span>Date Implemented</span></td>
			            <td>{measure.date_implemented ? formatTime(measure.date_implemented) : ""}</td>
			        </tr>
			        <tr>
			            <td><span>Entry Date</span></td>
			            <td>{measure.entry_date}</td>
			        </tr>
			    </tbody>
			</table>
		</div>
	);
}

export default App;