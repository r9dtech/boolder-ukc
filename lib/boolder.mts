import {z} from 'zod'
import initSqlJs, {Database} from 'sql.js'

const boolderExport$ = z.object({
	ticks: z.array(
		z.object({
			id: z.number(),
		}),
	),
})
export type BoolderExport = z.infer<typeof boolderExport$>

export async function parseBoolderExport(
	data: unknown,
): Promise<BoolderExport> {
	try {
		return boolderExport$.parse(data)
	} catch (e: unknown) {
		throw new Error('could not parse boolder file', {cause: e})
	}
}

export async function fetchBoolderDatabase(): Promise<Database> {
	const sql = await initSqlJs({
		locateFile: (file) => `/assets/${file}`,
	})
	const response = await fetch(
		'https://raw.githubusercontent.com/boolder-org/boolder-data/main/boolder.db',
	)
	return new sql.Database(new Uint8Array(await response.arrayBuffer()))
}

const db: Promise<Database> = fetchBoolderDatabase()

const dbResult$ = z.object({
	climb_name_en: z.string(),
	grade: z.string(),
	area_name: z.string(),
	cluster_name: z.string(),
	circuit_color: z.string().nullable(),
	circuit_number: z.string().nullable(),
})

export type BoolderClimb = z.infer<typeof dbResult$>

export async function boolderClimbInfo(id: number): Promise<BoolderClimb> {
	const queryExecResult = (await db).exec(
		`
			select p.name_en        as climb_name_en,
						 p.grade          as grade,
						 a.name           as area_name,
						 cl.name          as cluster_name,
						 p.circuit_color  as circuit_color,
						 p.circuit_number as circuit_number
			from problems p
						 join main.areas a on p.area_id = a.id
						 join main.clusters cl on a.cluster_id = cl.id
						 left join main.circuits c on c.id = p.circuit_id
			where p.id = ?
		`,
		[id],
	)
	if (queryExecResult.length !== 1) {
		throw new Error('Expecting single result from db')
	}
	const columns = [...queryExecResult.values()][0].columns
	const values = [...queryExecResult.values()][0].values[0]
	return dbResult$.parse(
		Object.fromEntries(columns.map((key, index) => [key, values[index]])),
	)
}
