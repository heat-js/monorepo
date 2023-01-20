
import { SchedulerClient, CreateScheduleCommand } from '@aws-sdk/client-scheduler'
import { schedulerClient } from '@heat/aws-clients'

interface Schedule {
	client?: SchedulerClient

	name: string
	payload: any
	date: Date
	idempotentKey: string
	roleArn: string

	timezone?: string
	accountId?: string
}

/** Create lambda scheduler */
export const schedule = ({ client = schedulerClient.get(), name, payload, date, idempotentKey, roleArn, timezone, accountId = process.env.AWS_ACCOUNT_ID }: Schedule) => {
	const command = new CreateScheduleCommand({
		ClientToken: idempotentKey,
		Name: `${name}|${idempotentKey}`,
		ScheduleExpression: `at(${date.toISOString()})`,
		ScheduleExpressionTimezone: timezone || undefined,
		FlexibleTimeWindow: { Mode: 'OFF' },
		Target: {
			Arn: `arn:aws:lambda:${client.config.region}:${accountId}:${name}`,
			Input: payload ? JSON.stringify(payload) : undefined,
			RoleArn: roleArn,
		}
	})

	return client.send(command)
}
