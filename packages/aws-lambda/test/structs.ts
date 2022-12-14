
import { mask, number, object } from 'superstruct'
import { describe, it, expect } from 'vitest'
import { dynamodbStreamStruct, handle, snsRecords, snsStruct, sqsRecords, sqsStruct } from '../src'

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
			MessageId: '1',
			Message: { id: 1 },
			Timestamp: new Date().toISOString()
		} } ] }

		const result = mask(event, struct)
		const records = snsRecords(result)

		expect(result.Records[0].Sns.Message).toStrictEqual({ id: 1 })
		expect(records).toStrictEqual([{ id: 1 }])
	})

	it('sqsStruct', async () => {
		const struct = sqsStruct(object({ id: number() }))
		const event = { Records:[{
			messageId: '1',
			body: { id: 1 },
			messageAttributes: []
		}]}

		const result = mask(event, struct)
		const records = sqsRecords(result)

		expect(result.Records[0].body).toStrictEqual({ id: 1 })
		expect(records).toStrictEqual([{ id: 1 }])
	})
})
