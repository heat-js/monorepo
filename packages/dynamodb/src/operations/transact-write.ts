
import { TransactWriteCommand, TransactWriteCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Expression, Item, Key, Options, ReturnKeyType, ReturnModelType, Value } from '../types.js'
import { addExpression } from '../helper/expression.js'
import { send } from '../helper/send.js'
import { Table } from '../table.js'

interface TransactWriteOptions extends Options {
	idempotantKey?: string
	items: Transactable[]
}

type Transactable = ConditionCheck | Put | Update | Delete

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
		TransactItems: options.items
	})

	await send(command, options) as TransactWriteCommandOutput
}

interface ConditionCheckOptions {
	condition: Expression
}

export const transactConditionCheck = <T extends Table | string = string>(
	table: T,
	key: ReturnKeyType<T>,
	{ condition }: ConditionCheckOptions
): Transactable => {
	const command: ConditionCheck = {
		ConditionCheck: {
			TableName: table.toString(),
			Key: key,
			ConditionExpression: condition.expression
		}
	}

	addExpression(command.ConditionCheck, condition)
	return command
}

interface PutOptions {
	condition?: Expression
}

export const transactPut = <I extends Item, T extends Table | string = string>(
	table: T,
	item: ReturnModelType<I, T>,
	{ condition }: PutOptions = {}
): Transactable => {
	const command: Put = {
		Put: {
			TableName: table.toString(),
			Item: item,
		}
	}

	if(condition) {
		command.Put.ConditionExpression = condition.expression
		addExpression(command.Put, condition)
	}

	return command
}

interface UpdateOptions {
	update: Expression
	condition?: Expression
}

export const transactUpdate = <T extends Table | string = string>(
	table: T,
	key: ReturnKeyType<T>,
	{ update, condition }: UpdateOptions
): Transactable => {
	const command: Update = {
		Update: {
			TableName: table.toString(),
			Key: key,
			UpdateExpression: update.expression,
		}
	}

	addExpression(command.Update, update)

	if(condition) {
		command.Update.ConditionExpression = condition.expression
		addExpression(command.Update, condition)
	}

	return command
}

interface DeleteOptions {
	condition?: Expression
}

export const transactDelete = <T extends Table | string = string>(
	table: T,
	key: ReturnKeyType<T>,
	{ condition }: DeleteOptions = {}
): Transactable => {
	const command: Delete = {
		Delete: {
			TableName: table.toString(),
			Key: key,
		}
	}

	if(condition) {
		command.Delete.ConditionExpression = condition.expression
		addExpression(command.Delete, condition)
	}

	return command
}
