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

type Input = Infer<ReturnType<typeof sqsStruct>>

export const sqsRecords = (input:Input) => {
	return input.Records.map(item => item.body)
}
