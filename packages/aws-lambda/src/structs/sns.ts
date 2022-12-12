import { array, Infer, object, string, Struct } from 'superstruct'
import { date } from '../services/validate'

export const snsStruct = <T extends Struct<any>>(message: T) => {
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

type Input = Infer<ReturnType<typeof snsStruct>>

export const snsRecords = (input:Input) => {
	return input.Records.map(({ Sns: item }) => item.Message)
}
