import { unmarshall } from '@aws-sdk/util-dynamodb'
import { any, array, create, object, optional, record, string, Struct, validate } from '../../services/validate'

const streamStruct = object({
	Records: array(object({
		eventName: string(),
		dynamodb: object({
			NewImage: optional(any()),
			OldImage: optional(any()),
		})
	}))
})

export const dynamoDbStreamTransformer = () => {
	return {
		input(event, struct:Struct): any {
			return create(event, streamStruct).Records.map(record => {
				const o = record.dynamodb.NewImage
				const n = record.dynamodb.OldImage

				return create({
					event: record.eventName,
					newImage: n && unmarshall(n),
					oldImage: o && unmarshall(o),
				}, struct)
			})
		},
		output(object, struct:Struct): any {
			return create(object, struct)
		}
	}
}

// app.records = records.map(record => {
// 	const newImage = record.dynamodb.NewImage
// 	const oldImage = record.dynamodb.OldImage

// 	return {
// 		eventName: record.eventName,
// 		newImage: newImage && unmarshall(newImage),
// 		oldImage: oldImage && unmarshall(oldImage),
// 	}
// })


// import { AttributeValue } from '@aws-sdk/client-dynamodb'
// import { unmarshall } from '@aws-sdk/util-dynamodb'
// import { Handler, Next, Request } from '../../types'
// import { string } from 'bigfloat-esnext'

// type DynamoDBStreamRecord = {
// 	eventName: string
// 	dynamodb: {
// 		OldImage?: Record<string, AttributeValue>
// 		NewImage?: Record<string, AttributeValue>
// 	}
// }

// type DynamoDBStreamInput = {
// 	Records?: DynamoDBStreamRecord[]
// }

// export const dynamodbStream = <I>({ input:I, output, handle: Handler) => {
// 	return (app: Request, next: Next) => {

// 		const input = app.input as DynamoDBStreamInput

// 		// ----------------------------------------------------
// 		// Single work processed

// 		if(!(typeof input === 'object' && input !== null)) {
// 			app.records = [ input ]
// 			return next()
// 		}

// 		const records = input.Records

// 		if(!Array.isArray(records)) {
// 			app.records = [ input ]
// 			return next()
// 		}

// 		// ----------------------------------------------------
// 		// Batch of work processed

// 		app.records = records.map(record => {
// 			const newImage = record.dynamodb.NewImage
// 			const oldImage = record.dynamodb.OldImage

// 			return {
// 				eventName: record.eventName,
// 				newImage: newImage && unmarshall(newImage),
// 				oldImage: oldImage && unmarshall(oldImage),
// 			}
// 		})

// 		return next()
// 	}
// }
