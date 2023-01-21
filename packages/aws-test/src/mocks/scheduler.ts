
import { SchedulerClient, CreateScheduleCommand, CreateScheduleCommandInput, DeleteScheduleCommand } from '@aws-sdk/client-scheduler'
import { mockObjectKeys } from '../helpers/mock'
import { mockClient } from 'aws-sdk-client-mock'

type Lambdas = {
	[key: string]: (payload:any) => any
}

export const mockScheduler = <T extends Lambdas>(lambdas:T) => {
	const list = mockObjectKeys(lambdas)

	mockClient(SchedulerClient)
		.on(CreateScheduleCommand)
		.callsFake(async (input: CreateScheduleCommandInput) => {
			const parts = input.Target.Arn.split(':')
			const name = parts[ parts.length - 1 ]
			const callback = list[ name ]

			if(!callback) {
				throw new TypeError(`Scheduler mock function not defined for: ${ name }`)
			}

			const payload = input.Target.Input ? JSON.parse(input.Target.Input) : undefined

			await callback(payload)
		})

		.on(DeleteScheduleCommand)
		.resolves({})

	beforeEach(() => {
		Object.values(list).forEach(fn => {
			fn.mockClear()
		})
	})

	return list
}
