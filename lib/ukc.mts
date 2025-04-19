import {z} from "zod";

const ukcCragSearchResult$ = z.object({
    success: z.number().optional(),
    results: z.array(z.object({
        id: z.number(),
        name: z.string(),
    }))
});
type UkcCragSearchResult = z.infer<typeof ukcCragSearchResult$>

export async function ukcCragSearch(name: string): Promise<UkcCragSearchResult> {
    try {
        const url = new URL('https://api.ukclimbing.com/site/logbook/v1/crag_search/');
        const params = new URLSearchParams({
            name,
            location: 'fontainebleau, france',
            distance: '50'
        });
        url.search = params.toString();
        const result = await fetch(url.toString());
        const resultJson = await result.json();
        return ukcCragSearchResult$.parse(resultJson);
    } catch (e: unknown) {
        throw new Error("could not fetch from ukc", {cause: e})
    }
}

const ukcCragInfoResult$ = ukcCragSearchResult$;
type UkcCragInfoResult = z.infer<typeof ukcCragInfoResult$>

export async function ukcCragInfo(id: number): Promise<UkcCragInfoResult> {
    try {
        const url = new URL('https://api.ukclimbing.com/site/logbook/v1/climbs_at_crag/?crag_id=1658');
        url.search = new URLSearchParams({
            crag_id: `${id}`,
        }).toString();
        const result = await fetch(url.toString());
        const resultJson = await result.json();
        return ukcCragSearchResult$.parse(resultJson);
    } catch (e: unknown) {
        throw new Error("could not fetch from ukc", {cause: e})
    }
}
