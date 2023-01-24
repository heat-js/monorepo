
import { asyncCall, mockObjectKeys } from '../helpers/mock'
import { InvokeCommand, InvokeCommandInput, LambdaClient } from '@aws-sdk/client-lambda'
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node'
import { mockClient } from 'aws-sdk-client-mock'

type Lambdas = {
	[key: string]: (payload:any) => any
}

export const mockLambda = <T extends Lambdas>(lambdas:T) => {
	const list = mockObjectKeys(lambdas)

	mockClient(LambdaClient)
		.on(InvokeCommand)
		.callsFake(async (input:InvokeCommandInput) => {
			const name = input.FunctionName || ''
			const type = input.InvocationType || 'RequestResponse'
			const payload = input.Payload ? JSON.parse(toUtf8(input.Payload)) : undefined
			const callback = list[ name ]

			if(!callback) {
				throw new TypeError(`Lambda mock function not defined for: ${ name }`)
			}

			const result = await asyncCall(callback, payload)

			if(type === 'RequestResponse' && result) {
				return {
					Payload: fromUtf8(JSON.stringify(result))
				}
			}

			return {
				Payload: undefined
			}
		})

	beforeEach(() => {
		Object.values(list).forEach(fn => {
			fn.mockClear()
		})
	})

	return list
}
