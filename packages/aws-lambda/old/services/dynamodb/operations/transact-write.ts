
import { Table } from '../table.js'
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { Expression, Item, Key, Value } from '../types.js'
import { addExpression } from '../helper/expression.js'

interface TransactWriteOptions {
	idempotantKey?: string
	items: Transactable[]
}

interface Transactable {
	table: Table
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

export const transactWrite = async ({ items, idempotantKey }:TransactWriteOptions): Promise<void> => {
	const command = new TransactWriteCommand({
		ClientRequestToken: idempotantKey,
		TransactItems: items.map(item => item.command)
	})

	await items[0]?.table.db.send(command)
}

interface ConditionCheckOptions {
	condition: Expression
}

export const transactConditionCheck = (table: Table, key: Key, { condition }: ConditionCheckOptions): Transactable => {
	const command: ConditionCheck = {
		ConditionCheck: {
			TableName: table.name,
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

export const transactPut = <T extends Item>(table: Table, item: T, { condition }: PutOptions = {}): Transactable => {
	const command: Put = {
		Put: {
			TableName: table.name,
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

export const transactUpdate = (table: Table, key: Key, { update, condition }: UpdateOptions): Transactable => {
	const command: Update = {
		Update: {
			TableName: table.name,
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

export const transactDelete = (table: Table, key: Key, { condition }: DeleteOptions = {}): Transactable => {
	const command: Delete = {
		Delete: {
			TableName: table.name,
			Key: key,
		}
	}

	if(condition) {
		command.Delete.ConditionExpression = condition.expression
		addExpression(command.Delete, condition)
	}

	return { table, command }
}
