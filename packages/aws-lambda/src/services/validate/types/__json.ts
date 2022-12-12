
import { Struct } from 'superstruct'
// import { ObjectType, print } from 'superstruct/lib/utils'

// type Json = string | number | boolean | null | object | []

// export function json(): Struct<Record<string, unknown>, null>
// export function json<S extends Struct>(struct:S): Struct<ObjectType<S>, S>
export function json<S extends Struct<any>>(struct?: S): any {
	// const Never = never()
	return new Struct({
		type: 'json',
		schema: null,
		*entries(value) {
			console.log(value)
			if(struct) {
				const json = JSON.parse(value as string)
				console.log(json)

				yield [ 0, json, struct ]
			}
		},
		validator(value) {
			console.log(value)
			try {
				JSON.parse(value as string)
			} catch (error) {
				return `Expected a json string`
			}
		},
		coercer(value) {
			return JSON.parse(value as string)

			// try {
			// 	JSON.parse(value as string)
			// }
			// return isObject(value) ? { ...value } : value
		},
	})
}

// export const json = ():Struct<Json, null> => {
// 	// return define<Json>('json', (value) => {
// 	// 	return JSON.parse(String(value))
// 	// })

// 	return new Struct({
// 		type: 'json'

// 	})
// }


// export function object(): Struct<Record<string, unknown>, null>
// export function object<S extends ObjectSchema>(
//   schema: S
// ): Struct<ObjectType<S>, S>
// export function object<S extends ObjectSchema>(schema?: S): any {
//   const knowns = schema ? Object.keys(schema) : []
//   const Never = never()
//   return new Struct({
//     type: 'object',
//     schema: schema ? schema : null,
//     *entries(value) {
//       if (schema && isObject(value)) {
//         const unknowns = new Set(Object.keys(value))

//         for (const key of knowns) {
//           unknowns.delete(key)
//           yield [key, value[key], schema[key]]
//         }

//         for (const key of unknowns) {
//           yield [key, value[key], Never]
//         }
//       }
//     },
//     validator(value) {
//       return (
//         isObject(value) || `Expected an object, but received: ${print(value)}`
//       )
//     },
//     coercer(value) {
//       return isObject(value) ? { ...value } : value
//     },
//   })
// }
