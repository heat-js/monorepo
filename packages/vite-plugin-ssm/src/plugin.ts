import type { Plugin } from 'vite'
import type { Paths } from '@awsless/ssm'
import { ssm, SSMClient } from '@awsless/ssm'
import { fromIni } from '@aws-sdk/credential-providers'

export default function VitePluginSsm(
	paths: Paths,
	{
		profile,
		region = 'eu-west-1',
	}: {
		profile: string
		region?: string
	}
): Plugin {
	const virtualModuleId = 'virtual:ssm'
	const resolvedVirtualModuleId = `\0${virtualModuleId}`

	return {
		name: 'ssm',
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId
			}
		},
		async load(id) {
			if (id === resolvedVirtualModuleId) {
				const client = new SSMClient({
					credentials: fromIni({ profile }),
					region,
				})

				const parameters = await ssm(paths, { client })

				return Object.entries(parameters)
					.map(([key, value]) => {
						return `export const ${key} = ${JSON.stringify(value)};`
					})
					.join(' ')
			}
		},
	}
}
