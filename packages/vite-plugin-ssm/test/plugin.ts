import { describe, it, expect } from 'vitest'
import ssmPlugin, { string, integer } from '../src'
import { mockSSM } from '@awsless/ssm'

describe('Plugin', () => {
	const mock = mockSSM({
		'/domain': 'domain.dev',
		'/port': '8080',
	})

	it('should export the ssm parameters', async () => {
		const paths = {
			domain: string('/domain'),
			port: integer('/port'),
		}

		const plugin = ssmPlugin(paths, { profile: 'test' })
		// @ts-ignore
		const result = await plugin.load?.('\0virtual:ssm') as string

		expect(result).toBe('export const domain = "domain.dev"; export const port = 8080;')
		expect(mock).toBeCalled()
	})

	// it('should throw error if parameter is not found', async () => {
	// 	const paths = {
	// 		notFound: string('/not-exists'),
	// 	}

	// 	const plugin = ssmPlugin(paths, { profile: 'test' })
	// 	const result = await plugin.load?.('\0virtual:ssm') as string

	// 	expect(result).toBe('export const notFound = null;')
	// 	expect(mock).toBeCalled()
	// })
})
