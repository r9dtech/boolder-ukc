import {Injectable} from '@angular/core'
import {boolderClimbInfo, parseBoolderExport} from '../../lib/boolder.mjs'

interface EnrichedClimb {
	climbName: string
	circuitColor?: string
	circuitNumber?: string
}

export type DataLookupResult = {
	areaName: string
	climbs: EnrichedClimb[]
}[]

@Injectable({
	providedIn: 'root',
})
export class DataLookupServiceService {
	async enrich(json: string): Promise<DataLookupResult> {
		const enrichedClimbsByArea = new Map<string, EnrichedClimb[]>()
		const boolderData = await parseBoolderExport(JSON.parse(json))
		for (const tick of boolderData.ticks) {
			const climb = await boolderClimbInfo(tick.id)
			const enrichedClimbs = enrichedClimbsByArea.get(climb.area_name) ?? []
			enrichedClimbs.push({
				climbName: climb.climb_name_en,
				circuitColor: climb.circuit_color ?? undefined,
				circuitNumber: climb.circuit_number ?? undefined,
			})
			enrichedClimbsByArea.set(climb.area_name, enrichedClimbs)
		}
		return [...enrichedClimbsByArea.entries()]
			.map(([areaName, climbs]) => {
				return {
					areaName,
					climbs: [...climbs].sort((a, b) =>
						a.climbName.localeCompare(b.climbName),
					),
				}
			})
			.sort((a, b) => a.areaName.localeCompare(b.areaName))
	}
}
