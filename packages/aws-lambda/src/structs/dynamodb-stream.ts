
import { array, enums, object, type, string, Struct, unknown, coerce } from '@heat/validate'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { AttributeValue } from '@aws-sdk/client-dynamodb'

type Base = Struct<any>

interface Options <N extends Base, O extends Base, K extends Base> {
	newImage: N
	oldImage?: O
	keys?: K
}

const unmarshallStruct = <A, B>(struct:Struct<A, B>): Struct<A, B> => {
	return coerce(struct, object(), (value) => {
		return unmarshall(value as Record<string, AttributeValue>)
	})
}

export const dynamodbStreamStruct = <N extends Base, O extends Base, K extends Base>({ newImage, oldImage, keys }: Options<N, O, K>) => {
	return type({
		Records: array(type({
			eventName: enums(['INSERT', 'MODIFY', 'REMOVE']),
			dynamodb: type({
				SequenceNumber: string(),
				NewImage: unmarshallStruct(newImage) as N,
				OldImage: oldImage ? unmarshallStruct(oldImage) as O : unknown(),
				Keys: keys ? unmarshallStruct(keys) as K : unknown(),
			})
		}))
	})
}

type Input<K, N, O> = {
	Records: {
		eventName: 'INSERT' | 'MODIFY' | 'REMOVE'
		dynamodb: {
			SequenceNumber: string
			NewImage: N
			OldImage?: O
			Keys?: K
		}
	}[]
}

export const dynamodbStreamRecords = <K, N, O>(input:Input<K, N, O>) => {
	return input.Records.map(({ eventName, dynamodb }) => ({
		event: eventName,
		sequence: dynamodb.SequenceNumber,
		newImage: dynamodb.NewImage,
		oldImage: dynamodb.OldImage,
		keys: dynamodb.Keys,
	}))
}
