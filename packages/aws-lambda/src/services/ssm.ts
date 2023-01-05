
import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm'
import chunk from 'chunk'
import { ssmClient } from '@heat/aws-clients'

interface Config<T extends Record<string, string>> {
	client?: SSMClient
	paths: T
}

/** Fetch the provided ssm paths */
export const ssm = async <T extends Record<string, string>>({ client = ssmClient.get(), paths }: Config<T>): Promise<T> => {
	const values: Record<string, string> = {}
	const list = Object.entries(paths).map(([key, path]) => {
		return {
			key,
			path: path[0] !== '/' ? `/${path}` : path
		}
	})

	await Promise.all(
		chunk(list, 10).map(async (list) => {
			const command = new GetParametersCommand({
				Names: list.map(item => item.path),
				WithDecryption: true
			})

			const result = await client.send(command)

			if (result.InvalidParameters && result.InvalidParameters.length) {
				throw new Error(`SSM parameter(s) not found - ['${result.InvalidParameters.join(`', '`)}']`)
			}

			result.Parameters?.forEach(parameter => {
				if(parameter.Value) {
					const item = list.find(item => parameter.Name === item.path)
					if(item) {
						values[item.key] = parameter.Value
					}
				}
			})
		})
	)

	return values as T
}
