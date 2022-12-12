
import { describe, it, expect } from 'vitest'
import { handle, dynamodbStream } from '../../src'

describe('DynamoDB Stream', () => {

	const fn = handle(
		dynamodbStream(),
		(app) => app.output = app.records
	)

	it('should format a dynamodb stream response', async () => {
		const result = await fn({
			Records: [
				{
					eventName: 'INSERT',
					dynamodb: {
						NewImage: {
							id: { S: '2' }
						},
						OldImage: {
							id: {
								S: '1'
							}
						}
					}
				},
				{
					eventName: 'MODIFY',
					dynamodb: {
						OldImage: {
							id: {
								S: '1'
							}
						}
					}
				}
			]
		})

		expect(result).toStrictEqual([
			{
				eventName: 'INSERT',
				newImage: { id: '2' },
				oldImage: { id: '1' }
			},
			{
				eventName: 'MODIFY',
				newImage: undefined,
				oldImage: { id: '1' }
			}
		])
	})

})
