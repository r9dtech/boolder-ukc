import {ukcCragInfo, ukcCragSearch} from './lib/ukc.mjs'

export default {
	async fetch(request: Request, env: unknown) {
		const url = new URL(request.url)
		let name = url.searchParams.get('name')
		if (request.method !== 'GET' || url.pathname !== '/api/crag' || !name) {
			return new Response(`Not found`, {
				status: 404,
				headers: {'Cache-control': 'max-age=86400'},
			})
		}

		if (name.toLowerCase().includes('apremont')) {
			name = 'Apremont' // ukc can't find e.g. Apremont Est
		}
		try {
			const ukcCragSearchResult = await ukcCragSearch(name.toLowerCase())
			if (ukcCragSearchResult.results.length < 1) {
				return new Response(`No results`, {
					status: 404,
					headers: {'Cache-control': 'max-age=86400'},
				})
			}
			const cragId = ukcCragSearchResult.results[0].id
			const ukcCragInfoResult = await ukcCragInfo(cragId)
			return new Response(
				JSON.stringify({
					cragId,
					info: ukcCragInfoResult,
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						'Cache-control': 'max-age=86400',
					},
					status: 200,
				},
			)
		} catch (e: unknown) {
			console.error(e)
			return new Response(`Error: ${e}`, {
				status: 500,
				headers: {'Cache-control': 'max-age=86400'},
			})
		}
	},
}
