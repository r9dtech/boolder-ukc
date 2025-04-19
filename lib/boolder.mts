import {z} from "zod";
import initSqlJs, {Database} from 'sql.js';

const boolderExport$ = z.object({
  ticks: z.array(z.object({
    id: z.number(),
  }))
});
export type BoolderExport = z.infer<typeof boolderExport$>

export async function parseBoolderExport(data: unknown): Promise<BoolderExport> {
  try {
    return boolderExport$.parse(data)
  } catch (e: unknown) {
    throw new Error("could not parse boolder file", {cause: e})
  }
}

export async function fetchBoolderDatabase(): Promise<Database> {
  const sql = await initSqlJs();
  const response = await fetch('https://raw.githubusercontent.com/boolder-org/boolder-data/main/boolder.db');
  return new sql.Database(new Uint8Array(await response.arrayBuffer()))
}

const db: Promise<Database> = new Promise(() => {
  // fetchBoolderDatabase()
})

const dbResult$ = z.object({
  'climb_name_fr': z.string(),
  'climb_name_en': z.string(),
  'climb_name_searchable': z.string().nullable(),
  'area_name': z.string(),
  'area_name_searchable': z.string(),
  'circuit_color': z.string().nullable(),
  'circuit_number': z.string().nullable(),
})

export type DbResult = z.infer<typeof dbResult$>

export async function fetchClimbInfo(id: number): Promise<DbResult> {
  const queryExecResult = (await db).exec(`
    select p.name            as climb_name_fr,
           p.name_en         as climb_name_en,
           p.name_searchable as climb_name_searchable,
           a.name            as area_name,
           a.name_searchable as area_name_searchable,
           p.circuit_color   as circuit_color,
           p.circuit_number  as circuit_number
    from problems p
           join main.areas a
                on p.area_id = a.id
           left join main.circuits c on c.id = p.circuit_id
    where p.id = ?
  `, [id]);
  if (queryExecResult.length !== 1) {
    throw new Error("Expecting single result from db");
  }
  const columns = [...queryExecResult.values()][0].columns;
  const values = [...queryExecResult.values()][0].values[0];
  return dbResult$.parse(Object.fromEntries(
    columns.map((key, index) => [key, values[index]])
  ));
}
