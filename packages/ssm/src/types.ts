
import { SSMClient } from '@aws-sdk/client-ssm'

export type Paths = Record<string, string | Transformer>

export type Options = {
	client?: SSMClient
	ttl?: number
}

export type Transformer = {
	path: string
	transform: (value:string) => any
}

export type Output<T> = {
	[ key in keyof T ]: T[key] extends Transformer ? ReturnType<T[key]['transform']> : string
}
