import chunk from 'chunk'
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm'
import { Next, Request } from '../../types.js'

export const ssm = () => {
	let resolved = false
	return async (_:Request, next: Next) => {
		if (!resolved) {
			const env = await resolve(process.env)
			Object.assign(process.env, env)
			resolved = true
		}

		return next()
	}
}

interface Paths {
	[key:string]: string | undefined
}

const resolve = async (input: Paths) => {
	const region = process.env.AWS_REGION || 'eu-west-1'
	const paths = ssmPaths(input)
	const names = paths.map(({ path }) => path)

	if (!names.length) return {}

	const client = new SSMClient({ region })
	const values: { [key: string]: string } = {}

	await Promise.all(
		chunk(names, 10).map(async batch => {
			const result = await client.send(
				new GetParametersCommand({
					Names: batch,
					WithDecryption: true
				})
			)

			if (result.InvalidParameters && result.InvalidParameters.length) {
				throw new Error(
					`SSM parameter(s) not found - ['ssm:${result.InvalidParameters.join(
						'\', \'ssm:'
					)}']`
				)
			}

			result.Parameters?.forEach(({ Type, Name, Value }) => {
				if(Value) {
					const value = Type === 'StringList' ? Value.split(',') : Value
					const item = paths.find(item => Name === item.path)
					if(item) {
						values[item.key] = String(value)
					}
				}
			})
		})
	)
}

const ssmPaths = (input:Paths) => {
	return Object.entries(input)
		.filter(([_, value]) => typeof value === 'string' && 0 === value.indexOf('ssm:'))
		.map(([key, value]) => {
			const path = String(value).substr(4)
			return { key, path: path[0] !== '/' ? `/${path}` : path }
		})
}
