
import { IApp } from '../../app'
import { Next } from '../../compose'
import { unmarshall } from '@aws-sdk/util-dynamodb'

export const dynamodbStream = () => {
	return (app: IApp, next: Next) => {

		const input = app.input

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
