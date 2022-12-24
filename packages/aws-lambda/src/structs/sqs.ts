
import { json, array, object, string, record, Struct } from '@heat/validate'

export const sqsStruct = <A, B>(body: Struct<A, B>) => {
	return object({
		Records: array(object({
			body: json(body),
			messageId: string(),
			messageAttributes: record(string(), object({
				dataType: string(),
				stringValue: string()
			}))
		}))
	})
}

type Input<T> = {
	Records: {
		body: T
	}[]
}

export const sqsRecords = <T>(input:Input<T>) => {
	return input.Records.map(item => item.body)
}
