import {fetchClimbInfo, parseBoolderExport} from "./lib/boolder.mjs";
import {ukcCragInfo, ukcCragSearch} from "./lib/ukc.mjs";

function randomSlug() {
    return Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6, "0")
}

for (const tick of (await parseBoolderExport()).ticks) {
    const id = tick.id;
    const result = await fetchClimbInfo(id);
    console.log(result)
    const ukcCragSearchResult = await ukcCragSearch(result.area_name);
    console.log(ukcCragSearchResult)
    const cragResult = ukcCragSearchResult.results[0];
    const cragInfo = await ukcCragInfo(cragResult.id)
    const climb = cragInfo.results.find(climb => climb.name.toLowerCase() === `${result.circuit_color} ${result.circuit_number}`.toLowerCase());
    console.log(`https://www.ukclimbing.com/logbook/crags/${randomSlug()}-${cragResult.id}/${randomSlug()}-${climb?.id}`)
    break
}