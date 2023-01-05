
import { json, array, type, string, record, Struct } from '@heat/validate'

export const sqsStruct = <A, B>(body: Struct<A, B>) => {
	return type({
		Records: array(type({
			body: json(body),
			messageId: string(),
			messageAttributes: record(string(), type({
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
