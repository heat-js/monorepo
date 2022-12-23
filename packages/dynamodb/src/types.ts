
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

export interface Options {
	client?: DynamoDBDocumentClient
}

export interface MutateOptions extends Options {
	condition?: Expression
	return?: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW'
}

export type Expression = {
	expression: string
	names:{ [ key:string ]: string }
	values:{ [ key:string ]: unknown }
}

export type Key = { [ key: string ]: string | number }
// export type Value = string | number | boolean | null | undefined
export type Value = string | number | boolean | null | undefined | Value[] | { [key:string]:Value }
export type Item = { [ key: string ]: Value | Item | [ Value | Item ] }
