import {ukcCragInfo, ukcCragSearch} from './lib/ukc.mjs'

export default {
	async fetch(request: Request) {
		const url = new URL(request.url)
		const name = url.searchParams.get('name')
		const cluster = url.searchParams.get('cluster')
		if (
			request.method !== 'GET' ||
			url.pathname !== '/api/crag' ||
			!name ||
			!cluster
		) {
			return new Response(`Not found`, {
				status: 404,
				headers: {'Cache-control': 'max-age=86400'},
			})
		}

		try {
			let ukcCragSearchResult = await ukcCragSearch(name.toLowerCase())
			if (ukcCragSearchResult.results.length < 1) {
				ukcCragSearchResult = await ukcCragSearch(cluster.toLowerCase())
				if (ukcCragSearchResult.results.length < 1) {
					return new Response(`No results`, {
						status: 404,
						headers: {'Cache-control': 'max-age=86400'},
					})
				}
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
