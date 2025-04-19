import {Injectable} from '@angular/core'
import {boolderClimbInfo, parseBoolderExport} from '../../lib/boolder.mjs'
import {ukcCragInfoResult$} from '../../lib/ukc.mjs'
import {z} from 'zod'

interface EnrichedClimb {
	climbName: string
	grade: string
	circuitColor?: string
	circuitNumber?: string
	link?: string
}

export type DataLookupResult = {
	areaName: string
	climbs: EnrichedClimb[]
}[]

const apiResult$ = z.object({
	cragId: z.number(),
	info: ukcCragInfoResult$,
})
type ApiResult = z.infer<typeof apiResult$>

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
		for (const [areaName, climbs] of enrichedClimbsByArea.entries()) {
			try {
				const apiResult = apiResult$.parse(
					await (
						await fetch('/api/crag?name=' + encodeURIComponent(areaName))
					).json(),
				)
				for (const climb of climbs) {
					const ukcClimbId = findClimb(climb, apiResult)
					if (ukcClimbId) {
						climb.link = `https://www.ukclimbing.com/logbook/crags/crag-${apiResult.cragId}/climb-${ukcClimbId}`
					}
				}
			} catch (e: unknown) {
				console.error(e)
			}
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

function findClimb(climb: EnrichedClimb, apiResult: ApiResult) {
	for (const climbInfo of apiResult.info.results) {
		if (
			`${climb.circuitColor} ${climb.circuitNumber}`.toLowerCase().trim() ===
				climbInfo.name.toLowerCase().trim() ||
			climbInfo.name.toLowerCase().trim() ===
				climb.climbName.toLowerCase().trim()
		) {
			return climbInfo.id
		}
	}
	return undefined
}
