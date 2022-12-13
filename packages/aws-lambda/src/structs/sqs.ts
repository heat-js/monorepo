import { array, Infer, object, string, Struct } from 'superstruct'

type Base = Struct<any>

export const sqsStruct = <B extends Base>(body: B) => {
	return object({
		Records: array(object({
			body,
			messageId: string(),
			messageAttributes: array(object({
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

export const sqsRecords = <T>(input:Input<T>):T[] => {
	return input.Records.map(item => item.body)
}
