
import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Handler, Next, Request } from '../../types'

type DynamoDBStreamRecord = {
	eventName: string
	dynamodb: {
		OldImage?: Record<string, AttributeValue>
		NewImage?: Record<string, AttributeValue>
	}
}

type DynamoDBStreamInput = {
	Records?: DynamoDBStreamRecord[]
}

export const dynamodbStream = <I>({ input:I, handle: Handler) => {
	return (app: Request, next: Next) => {

		const input = app.input as DynamoDBStreamInput

		// ----------------------------------------------------
		// Single work processed

		if(!(typeof input === 'object' && input !== null)) {
			app.records = [ input ]
			return next()
		}

		const records = input.Records

		if(!Array.isArray(records)) {
			app.records = [ input ]
			return next()
		}

		// ----------------------------------------------------
		// Batch of work processed

		app.records = records.map(record => {
			const newImage = record.dynamodb.NewImage
			const oldImage = record.dynamodb.OldImage

			return {
				eventName: record.eventName,
				newImage: newImage && unmarshall(newImage),
				oldImage: oldImage && unmarshall(oldImage),
			}
		})

		return next()
	}
}
