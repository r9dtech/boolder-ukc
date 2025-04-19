import {fetchClimbInfo, parseBoolderExport} from "./lib/boolder.mjs";
import {ukcCragSearch} from "./lib/ukc.mjs";

for (const tick of (await parseBoolderExport()).ticks) {
    const id = tick.id;
    const result = await fetchClimbInfo(id);
    console.log(result)
    const ukcCragSearchResult = await ukcCragSearch(result.area_name);
    console.log(ukcCragSearchResult)
    break
}