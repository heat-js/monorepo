import { array, object, string, Struct } from 'superstruct'
import { date } from '../services/validate/index.js'

export const snsStruct = <T extends Struct<any, any>>(message: T) => {
	return object({
		Records: array(object({
			Sns: object({
				TopicArn: string(),
				MessageId: string(),
				Timestamp: date(),
				Message: message,
				// MessageAttributes
			})
		}))
	})
}

type Input<T> = {
	Records: {
		Sns: {
			Message: T
		}
	}[]
}

export const snsRecords = <T>(input:Input<T>):T[] => {
	return input.Records.map(({ Sns: item }) => item.Message)
}
