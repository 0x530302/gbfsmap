import { IStationInformation } from "./interfaces/IStationInformation";
import { IStationStatus } from "./interfaces/IStationStatus";

export class Gbfs {
	constructor (gbfsUrl: string) {
		this.gbfsRootUrl = this.getCleanRootUrl(gbfsUrl)
		
		this.ready = new Promise<void>((resolve, reject)=>{
			Promise.all([
				this.loadStations(),
				this.loadStationStatus()
			]).then(()=>{
				resolve()
			}).catch(reject)
		})
	}

	public loadStations() {
		return new Promise<void>((resolve, reject)=>{
			let url = this.gbfsRootUrl + "station_information.json"
			fetch(url).then((res)=>{
				res.json().then(json=>{
					this.stationInformation = json
					resolve()
				}).catch(reject)
			}).catch(reject)
		})
	}

	public loadStationStatus() {
		return new Promise<void>((resolve, reject)=>{
			let url = this.gbfsRootUrl + "station_status.json"
			fetch(url).then((res)=>{
				res.json().then(json=>{
					this.stationStatus = json
					resolve()
				}).catch(reject)
			}).catch(reject)
		})
	}

	/**
	 * remove gbfs.json from URL
	 * @param gbfsUrl
	 */
	protected getCleanRootUrl(gbfsUrl: string) {
		let fragments = gbfsUrl.split("/");
		if (fragments[fragments.length-1] === "gbfs.json"){
			fragments.pop()
			return fragments.join("/") + "/";
		} else {
			if (gbfsUrl[gbfsUrl.length-1] !== "/"){
				gbfsUrl = gbfsUrl + "/"
			}
			return gbfsUrl
		}
	}

	public getGeoJson() {
		console.log(this.stationInformation, this.stationStatus)
		if (!(this.stationInformation && this.stationStatus)){
			throw("stationInformation and/or stationStatus not loaded. Please wait for .ready")
		}

		let fCollection = {
			"type": "FeatureCollection",
			"features": []
		}

		this.stationInformation.stations.forEach((station)=>{
			let point = {
				"type": "Feature",
				"properties": Object.assign({}, station),
				"geometry": {
					"type": "Point",
					"coordinates": [
						station.lon,
						station.lat
					]
				}
			}
			this.stationStatus.stations.forEach(status_station=>{
				if (status_station.station_id == station.station_id){
					Object.assign(point.properties, status_station)
				}
			})
			
			fCollection.features.push(point)
		})

		return fCollection
	}


	public ready: Promise<void>
	
	protected gbfsRootUrl: string
	protected stationInformation: IStationInformation
	protected stationStatus: IStationStatus
}