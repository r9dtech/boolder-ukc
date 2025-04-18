import {z} from "zod";
import {boolderExportSample} from "../Boolder_export_sample.mjs";

const boolderExport$ = z.object({
    ticks: z.array(z.object({
        id: z.number(),
    }))
});
type BoolderExport = z.infer<typeof boolderExport$>

export async function parseBoolderExport(): Promise<BoolderExport> {
    try {
        return boolderExport$.parse(boolderExportSample)
    } catch (e: unknown) {
        throw new Error("could not parse boolder file", {cause: e})
    }
}