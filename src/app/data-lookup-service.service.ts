import {Injectable} from '@angular/core'
import {boolderClimbInfo, parseBoolderExport} from '../../lib/boolder.mjs'

interface EnrichedClimb {
	climbName: string
	grade: string
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
				grade: climb.grade,
				circuitColor: climb.circuit_color ?? undefined,
				circuitNumber: climb.circuit_number ?? undefined,
			})
			enrichedClimbsByArea.set(climb.area_name, enrichedClimbs)
		}
		return [...enrichedClimbsByArea.entries()]
			.map(([areaName, climbs]) => {
				return {
					areaName,
					climbs: [...climbs].sort((a, b) => {
						const colorComp =
							a.circuitColor && b.circuitColor
								? a.circuitColor.localeCompare(b.circuitColor)
								: a.circuitColor
									? -1
									: b.circuitColor
										? 1
										: 0

						const numberComp =
							parseInt(`${a.circuitNumber}`) - parseInt(`${b.circuitNumber}`)

						return (
							colorComp || numberComp || a.climbName.localeCompare(b.climbName)
						)
					}),
				}
			})
			.sort((a, b) => a.areaName.localeCompare(b.areaName))
	}
}
