import {z} from "zod";

const ukcCragSearchResult$ = z.object({
    success: z.number().optional(),
    results: z.array(z.object({
        id: z.number(),
        name: z.string(),
    }))
});
type UkcCragSearchResult = z.infer<typeof ukcCragSearchResult$>

async function ukcCragSearch(): Promise<UkcCragSearchResult> {
    try {
        const url = new URL('https://api.ukclimbing.com/site/logbook/v1/crag_search/');
        const params = new URLSearchParams({
            name: 'Apremont Butte aux Dames',
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

console.log(await ukcCragSearch())