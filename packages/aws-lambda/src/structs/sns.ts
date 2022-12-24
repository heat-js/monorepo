
import { json, array, object, string, date, Struct } from '@heat/validate'

export const snsStruct = <A, B>(message: Struct<A, B>) => {
	return object({
		Records: array(object({
			Sns: object({
				TopicArn: string(),
				MessageId: string(),
				Timestamp: date(),
				Message: json(message),
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

export const snsRecords = <T>(input:Input<T>) => {
	return input.Records.map(({ Sns: item }) => item.Message)
}
