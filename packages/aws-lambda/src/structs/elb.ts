
import { string, type, record, unknown, Struct } from '@heat/validate'

interface Options <A, B, C, D> {
	query?: Struct<A, B>
	body?: Struct<C, D>
}

type Opt = {
	(): Struct<unknown, null>
	<A, B>(struct?: Struct<A, B>): Struct<A, B>
}

const opt: Opt = <A, B>(struct?: Struct<A, B>) => {
	return struct || unknown()
}

export const elbStruct = <A, B, C, D>({ query, body }: Options<A, B, C, D> = {}) => {
	return type({
		queryStringParameters: opt(query),
		body: opt(body),
		headers: record(string(), string()),
	})
}

type Input<Q, B> = {
	headers: Record<string, string | undefined>
	queryStringParameters: Q
	body: B
}

export const elbRequest = <Q, B>(input:Input<Q, B>) => {
	return {
		headers: input.headers,
		query: input.queryStringParameters,
		body: input.body,
	}
}
