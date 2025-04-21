import {z} from 'zod'

const ukcCragSearchResult$ = z.object({
	success: z.number().optional(),
	results: z.array(
		z.object({
			id: z.number(),
			name: z
				.string()
				.or(z.number())
				.transform((v) => v.toString()),
		}),
	),
})
export type UkcCragSearchResult = z.infer<typeof ukcCragSearchResult$>

export async function ukcCragSearch(
	name: string,
): Promise<UkcCragSearchResult> {
	const url = new URL('https://api.ukclimbing.com/site/logbook/v1/crag_search/')
	const params = new URLSearchParams({
		name,
		location: 'fontainebleau, france',
		distance: '50',
	})
	url.search = params.toString()
	const result = await fetch(url.toString())
	const resultJson = await result.json()
	if (typeof resultJson['results'] === 'string') {
		// bizarrely the results come back as a string instead of an array
		return {
			success: 0,
			results: [],
		}
	}
	return ukcCragSearchResult$.parse(resultJson)
}

const ukcClimbInfo$ = z.object({
	id: z.number(),
	name: z
		.string()
		.or(z.number())
		.transform((v) => v.toString()),
	description: z.string().nullable().optional(),
	grade_name: z.string().nullable().optional(),
})
export type UkcClimbInfo = z.infer<typeof ukcClimbInfo$>
export const ukcCragInfoResult$ = z.object({
	success: z.number().optional(),
	results: z.array(ukcClimbInfo$),
})
export type UkcCragInfoResult = z.infer<typeof ukcCragInfoResult$>

export async function ukcCragInfo(id: number): Promise<UkcCragInfoResult> {
	const url = new URL(
		'https://api.ukclimbing.com/site/logbook/v1/climbs_at_crag/',
	)
	url.search = new URLSearchParams({
		crag_id: `${id}`,
	}).toString()
	const result = await fetch(url.toString())
	const resultJson = await result.json()
	return ukcCragInfoResult$.parse(resultJson)
}
