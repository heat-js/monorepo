
import { mask, number, object } from 'superstruct'
import { describe, it, expect } from 'vitest'
import { dynamodbStreamStruct, snsStruct, sqsStruct } from '../src'

describe('structs', () => {

	it('dynamodbStreamStruct', async () => {
		const struct = dynamodbStreamStruct({ newImage: object({ id: number() }) })
		const event = { Records: [ { eventName: 'MODIFY', dynamodb: { SequenceNumber: '1', NewImage: { id: 1 } } } ] }
		const result = mask(event, struct)

		expect(result.Records[0].dynamodb.NewImage).toStrictEqual({ id: 1 })
	})

	it('snsStruct', async () => {
		const struct = snsStruct(object({ id: number() }))
		const event = { Records: [{ Sns: {
			TopicArn: 'topic',
			Message: { id: 1 }
		} } ] }
		const result = mask(event, struct)

		expect(result.Records[0].Sns.Message).toStrictEqual({ id: 1 })
	})

	it('sqsStruct', async () => {
		const struct = sqsStruct(object({ id: number() }))
		const event = { Records:[{
			messageId: '1',
			body: { id: 1 }
		}]}

		const result = mask(event, struct)

		expect(result.Records[0].body).toStrictEqual({ id: 1 })
	})
})
