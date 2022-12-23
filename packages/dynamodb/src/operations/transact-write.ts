
import { TransactWriteCommand, TransactWriteCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Expression, Item, Key, Options, Value } from '../types.js'
import { addExpression } from '../helper/expression.js'
import { send } from '../helper/send.js'

interface TransactWriteOptions extends Options {
	idempotantKey?: string
	items: Transactable[]
}

interface Transactable {
	table: string
	command: ConditionCheck | Put | Update | Delete
}

interface Command {
	TableName: string
	ConditionExpression?: string
	ExpressionAttributeNames?: { [key: string]: string }
	ExpressionAttributeValues?: { [key: string]: Value }
}

interface ConditionCheck {
	ConditionCheck: Command & {
		Key: Key
		ConditionExpression: string
	}
}

interface Put {
	Put: Command & {
		Item: Item
	}
}

interface Update {
	Update: Command & {
		Key: Key
		UpdateExpression: string
	}
}

interface Delete {
	Delete: Command & {
		Key: Key
	}
}

export const transactWrite = async (options:TransactWriteOptions): Promise<void> => {
	const command = new TransactWriteCommand({
		ClientRequestToken: options.idempotantKey,
		TransactItems: options.items.map(item => item.command)
	})

	// await items[0]?.table.db.send(command)

	await send(command, options) as TransactWriteCommandOutput
}

interface ConditionCheckOptions {
	condition: Expression
}

export const transactConditionCheck = (table: string, key: Key, { condition }: ConditionCheckOptions): Transactable => {
	const command: ConditionCheck = {
		ConditionCheck: {
			TableName: table,
			Key: key,
			ConditionExpression: condition.expression
		}
	}

	addExpression(command.ConditionCheck, condition)
	return { table, command }
}

interface PutOptions {
	condition?: Expression
}

export const transactPut = <T extends Item>(table: string, item: T, { condition }: PutOptions = {}): Transactable => {
	const command: Put = {
		Put: {
			TableName: table,
			Item: item,
		}
	}

	if(condition) {
		command.Put.ConditionExpression = condition.expression
		addExpression(command.Put, condition)
	}

	return { table, command }
}

interface UpdateOptions {
	update: Expression
	condition?: Expression
}

export const transactUpdate = (table: string, key: Key, { update, condition }: UpdateOptions): Transactable => {
	const command: Update = {
		Update: {
			TableName: table,
			Key: key,
			UpdateExpression: update.expression,
		}
	}

	addExpression(command.Update, update)

	if(condition) {
		command.Update.ConditionExpression = condition.expression
		addExpression(command.Update, condition)
	}

	return { table, command }
}

interface DeleteOptions {
	condition?: Expression
}

export const transactDelete = (table: string, key: Key, { condition }: DeleteOptions = {}): Transactable => {
	const command: Delete = {
		Delete: {
			TableName: table,
			Key: key,
		}
	}

	if(condition) {
		command.Delete.ConditionExpression = condition.expression
		addExpression(command.Delete, condition)
	}

	return { table, command }
}
