import {Injectable} from '@angular/core'
import {
	BoolderClimb,
	boolderClimbInfo,
	parseBoolderExport,
} from '../../lib/boolder.mjs'
import {UkcClimbInfo, ukcCragInfoResult$} from '../../lib/ukc.mjs'
import {z} from 'zod'

interface EnrichedClimb {
	climbName: string
	grade: string
	circuitColor?: string
	circuitNumber?: string
	ukcClimbs: {
		link: string
		name: string
		grade_name?: string | null | undefined
	}[]
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
		const dbResultsByArea = new Map<string, [string, BoolderClimb[]]>()
		const boolderData = await parseBoolderExport(JSON.parse(json))
		for (const tick of boolderData.ticks) {
			const climb = await boolderClimbInfo(tick.id)
			const [clusterName, dbResults] = dbResultsByArea.get(climb.area_name) ?? [
				climb.cluster_name,
				[],
			]
			dbResults.push(climb)
			dbResultsByArea.set(climb.area_name, [clusterName, dbResults])
		}
		const enrichedClimbsByArea = new Map<string, EnrichedClimb[]>()
		for (const [areaName, [clusterName, climbs]] of dbResultsByArea.entries()) {
			const enrichedClimbs: EnrichedClimb[] = []
			let apiResult: ApiResult | null = null
			try {
				apiResult = apiResult$.parse(
					await (
						await fetch(
							'/api/crag?name=' +
								encodeURIComponent(areaName) +
								'&cluster=' +
								encodeURIComponent(clusterName),
						)
					).json(),
				)
			} catch (e: unknown) {
				console.error(e)
			}
			if (apiResult) {
				for (const result of apiResult.info.results) {
					result.name = decodeHtml(result.name)
					if (result.description) {
						result.description = decodeHtml(result.description)
					}
				}
			}
			for (const climb of climbs) {
				const enrichedClimb: EnrichedClimb = {
					climbName: climb.climb_name_en,
					grade: climb.grade,
					circuitColor: climb.circuit_color ?? undefined,
					circuitNumber: climb.circuit_number ?? undefined,
					ukcClimbs: [],
				}
				if (apiResult) {
					enrichedClimb.ukcClimbs = findClimb(climb, apiResult).map(
						(climbInfo) => ({
							name: climbInfo.name,
							link: `https://www.ukclimbing.com/logbook/crags/crag-${apiResult.cragId}/climb-${climbInfo.id}`,
							grade_name: climbInfo.grade_name,
						}),
					)
				}
				enrichedClimbs.push(enrichedClimb)
			}
			enrichedClimbsByArea.set(areaName, enrichedClimbs)
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

function findClimb(climb: BoolderClimb, apiResult: ApiResult): UkcClimbInfo[] {
	const possibleMatches: UkcClimbInfo[] = []
	const confidentMatches: UkcClimbInfo[] = []

	const sectorName = normalizeName(
		climb.area_name.replace(climb.cluster_name, ' '),
	)

	for (const climbInfo of apiResult.info.results) {
		const ukcClimbName = normalizeName(climbInfo.name)
		const circuitClimbName1 = normalizeName(
			`${climb.circuit_color} ${climb.circuit_number}`,
		)
		const circuitClimbName2 = normalizeName(
			`${climb.circuit_number} ${climb.circuit_color}`,
		)
		const circuitRegex = new RegExp(
			`\\b(${regexQuote(circuitClimbName1)}|${regexQuote(
				circuitClimbName2,
			)})\\b`,
		)
		const boolderClimbName = normalizeName(climb.climb_name_en)
		const boolderClimbRegex = new RegExp(
			`\\b${regexQuote(boolderClimbName)}\\b`,
		)
		if (
			boolderClimbRegex.test(ukcClimbName) ||
			circuitRegex.test(ukcClimbName)
		) {
			possibleMatches.push(climbInfo)
			if (
				boolderClimbRegex.test(ukcClimbName) &&
				circuitRegex.test(ukcClimbName) &&
				!circuitRegex.test(boolderClimbName)
			) {
				// name and circuit match, name!=circuit
				confidentMatches.push(climbInfo)
			} else if (
				ukcClimbName === boolderClimbName &&
				!circuitRegex.test(boolderClimbName)
			) {
				// not a circuit and exact name match
				confidentMatches.push(climbInfo)
			} else if (
				circuitRegex.test(ukcClimbName) &&
				sectorName.length &&
				ukcClimbName.includes(sectorName)
			) {
				// Sector name, e.g. butte aux dames + circuit match
				confidentMatches.push(climbInfo)
			} else if (
				climbInfo.description?.includes(`${climb.bleau_info_id}.html`)
			) {
				// link to bleau info page in ukc description
				confidentMatches.push(climbInfo)
			}
		}
	}
	// if (climb.circuit_number === '1')
	// 	console.log(
	// 		`${climb.area_name} ${climb.climb_name_en} ${climb.circuit_color} ${climb.circuit_number}`,
	// 		confidentMatches,
	// 		possibleMatches,
	// 	)
	return confidentMatches.length ? confidentMatches : possibleMatches
}

function normalizeName(name: string) {
	return name
		.toLowerCase()
		.replace(/\bl[ea]\b/g, ' ') // people on uk get le/la wrong
		.replace(/[()]/g, '') // brackets may be inconsistent between ukc and boolder
		.replace(/ +/g, ' ')
		.trim()
}

function regexQuote(str: string) {
	return str.replace(/[.\\+*?[^\]$(){}=!<>|:#-]/g, '\\$&')
}

function decodeHtml(html: string) {
	const txt = document.createElement('textarea')
	txt.innerHTML = html
	return txt.value
}
