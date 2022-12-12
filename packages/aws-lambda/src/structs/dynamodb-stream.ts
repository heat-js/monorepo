import { array, enums, object, string, Struct, unknown } from 'superstruct'

type Base = Struct<any>

interface Options <N extends Base, O extends Base, K extends Base> {
	newImage: N
	oldImage?: O
	keys?: K
}

export const dynamodbStreamStruct = <N extends Base, O extends Base, K extends Base>({ newImage, oldImage, keys }: Options<N, O, K>) => {
	return object({
		Records: array(object({
			eventName: enums(['INSERT', 'MODIFY', 'REMOVE']),
			dynamodb: object({
				SequenceNumber: string(),
				NewImage: newImage,
				OldImage: oldImage || unknown(),
				Keys: keys || unknown(),
			})
		}))
	})
}
