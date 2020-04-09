import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: "https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu",
	headers: {
		'Content-Type': 'application/json;charset=UTF-8',
	}
}); 

export function getTimeseriesData(iso3) {
	return axiosInstance({
		url:"timeseries",
		method: "GET",
		params: {
			iso3,
			onlyCountries:true,
		}
	})
	.then((response) => {
		return response;
	}, (error) => {
		throw Error(error);
	});
}

export function getBriefData() {
	return axiosInstance({
		url:"brief",
		method: "GET",
	})
	.then((response) => {
		return response;
	}, (error) => {
		throw Error(error);
	});
}