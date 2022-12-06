
import { describe, it, expect } from 'vitest'
import { startDynamoDB } from '@heat/aws-test'
import { Table, getItem, putItem, query, ql, updateItem, pagination, deleteItem, scan } from '../../../src/services/dynamodb/index'

describe('DynamoDB Basic OPS', () => {

	const dynamo = startDynamoDB({ path: './test/aws/dynamodb.yml' })
	const client = dynamo.getDocumentClient()
	const posts = new Table(client, 'posts')

	type Post = {
		userId: number
		id: number
		title: string
		content?: string
	}

	describe('putItem', () => {
		it('should put item', async () => {
			await putItem<Post>(posts, {
				userId: 1,
				id: 1,
				title: 'First',
				content: 'Welcome'
			})

			await putItem<Post>(posts, {
				userId: 1,
				id: 2,
				title: 'Second',
			})
		})

		it('should put item with valid condition', async () => {
			await putItem<Post>(posts, {
				userId: 1,
				id: 3,
				title: 'Third',
			}, {
				condition: ql`attribute_not_exists(#id)`
			})
		})

		it('should not put item with invalid condition', async () => {
			const opt = putItem<Post>(posts, {
				userId: 1,
				id: 3,
				title: 'Third Again',
			}, {
				condition: ql`attribute_not_exists(#id)`
			})

			await expect(opt).rejects.toThrow(Error)
		})
	})

	describe('getItem', () => {
		it('should get item', async () => {
			const result = await getItem<Post>(posts, { userId: 1, id: 1 })
			expect(result).toStrictEqual({
				userId: 1,
				id: 1,
				title: 'First',
				content: 'Welcome'
			})
		})

		it('should not get unknown item', async () => {
			const result = await getItem<Post>(posts, { userId: 1, id: 99 })
			expect(result).toBeUndefined()
		})
	})

	describe('updateItem', () => {
		it('should update item', async () => {
			const content = 'updated 1'
			const result = await updateItem<Post>(posts, { userId: 1, id: 1 }, {
				update: ql`SET #content = ${content}`
			})
			expect(result).toBeUndefined()

			const result2 = await getItem<Post>(posts, { userId: 1, id: 1 })
			expect(result2).toStrictEqual({
				userId: 1,
				id: 1,
				title: 'First',
				content
			})
		})

		it('should return updated item', async () => {
			const content = 'updated 2'
			const result = await updateItem<Post>(posts, { userId: 1, id: 1 }, {
				update: ql`SET #content = ${content}`,
				return: 'ALL_NEW'
			})

			expect(result).toStrictEqual({
				userId: 1,
				id: 1,
				title: 'First',
				content
			})
		})

		it('should update with condition', async () => {
			const title = 'First'
			const content = 'updated 3'
			const result = await updateItem<Post>(posts, { userId: 1, id: 1 }, {
				update: ql`SET #content = ${content}`,
				condition: ql`#title = ${title}`,
				return: 'ALL_NEW'
			})

			expect(result).toStrictEqual({
				userId: 1,
				id: 1,
				title: 'First',
				content
			})
		})
	})

	describe('deleteItem', () => {
		it('should delete item', async () => {
			await putItem<Post>(posts, {
				userId: 2,
				id: 1,
				title: 'Temp'
			})

			const result = await deleteItem<Post>(posts, { userId: 2, id: 1 })
			expect(result).toBeUndefined()

			const result2 = await getItem<Post>(posts, { userId: 2, id: 1 })
			expect(result2).toBeUndefined()
		})

		it('should return deleted item', async () => {
			await putItem<Post>(posts, {
				userId: 2,
				id: 1,
				title: 'Temp'
			})

			const result = await deleteItem<Post>(posts, { userId: 2, id: 1 }, {
				return: 'ALL_OLD'
			})

			expect(result).toStrictEqual({
				userId: 2,
				id: 1,
				title: 'Temp'
			})
		})

		it('should delete with condition', async () => {
			await putItem<Post>(posts, {
				userId: 2,
				id: 1,
				title: 'Temp'
			})

			await deleteItem<Post>(posts, { userId: 2, id: 1 }, {
				condition: ql`#id = ${1}`,
			})

			const result = await getItem<Post>(posts, { userId: 2, id: 1 })
			expect(result).toBeUndefined()
		})
	})

	describe('query', () => {
		it('should query list', async () => {
			const result = await query<Post>(posts, {
				keyCondition: ql`#userId = ${1}`,
			})

			expect(result).toStrictEqual({
				cursor: undefined,
				count: 3,
				items: [
					{
						userId: 1,
						id: 1,
						title: 'First',
						content: 'updated 3'
					},
					{
						userId: 1,
						id: 2,
						title: 'Second',
					},
					{
						userId: 1,
						id: 3,
						title: 'Third',
					}
				]
			})
		})

		it('should support limit & cursor', async () => {
			const result1 = await query<Post>(posts, {
				keyCondition: ql`#userId = ${1}`,
				limit: 1
			})

			expect(result1).toStrictEqual({
				count: 1,
				cursor: expect.any(Object),
				items: [
					{
						userId: 1,
						id: 1,
						title: 'First',
						content: 'updated 3'
					}
				]
			})

			const result2 = await query<Post>(posts, {
				keyCondition: ql`#userId = ${1}`,
				limit: 1,
				cursor: result1.cursor
			})

			expect(result2).toStrictEqual({
				count: 1,
				cursor: expect.any(Object),
				items: [
					{
						userId: 1,
						id: 2,
						title: 'Second',
					}
				]
			})
		})
	})

	describe('pagination', () => {
		it('should query list', async () => {
			const result = await pagination<Post>(posts, {
				keyCondition: ql`#userId = ${1}`,
			})

			expect(result).toStrictEqual({
				cursor: undefined,
				count: 3,
				items: [
					{
						userId: 1,
						id: 1,
						title: 'First',
						content: 'updated 3'
					},
					{
						userId: 1,
						id: 2,
						title: 'Second',
					},
					{
						userId: 1,
						id: 3,
						title: 'Third',
					}
				]
			})
		})

		it('should support limit & cursor', async () => {
			const result1 = await pagination<Post>(posts, {
				keyCondition: ql`#userId = ${1}`,
				limit: 1
			})

			expect(result1).toStrictEqual({
				count: 1,
				cursor: expect.any(String),
				items: [
					{
						userId: 1,
						id: 1,
						title: 'First',
						content: 'updated 3'
					}
				]
			})

			const result2 = await pagination<Post>(posts, {
				keyCondition: ql`#userId = ${1}`,
				limit: 1,
				cursor: result1.cursor
			})

			expect(result2).toStrictEqual({
				count: 1,
				cursor: expect.any(String),
				items: [
					{
						userId: 1,
						id: 2,
						title: 'Second',
					}
				]
			})
		})
	})

	describe('scan', () => {
		it('should scan list', async () => {
			const result = await scan<Post>(posts)

			expect(result).toStrictEqual({
				cursor: undefined,
				count: 3,
				items: [
					{
						userId: 1,
						id: 1,
						title: 'First',
						content: 'updated 3'
					},
					{
						userId: 1,
						id: 2,
						title: 'Second',
					},
					{
						userId: 1,
						id: 3,
						title: 'Third',
					}
				]
			})
		})

		it('should support limit & cursor', async () => {
			const result1 = await scan<Post>(posts, {
				limit: 1
			})

			expect(result1).toStrictEqual({
				count: 1,
				cursor: expect.any(Object),
				items: [
					{
						userId: 1,
						id: 1,
						title: 'First',
						content: 'updated 3'
					}
				]
			})

			const result2 = await scan<Post>(posts, {
				limit: 1,
				cursor: result1.cursor
			})

			expect(result2).toStrictEqual({
				count: 1,
				cursor: expect.any(Object),
				items: [
					{
						userId: 1,
						id: 2,
						title: 'Second',
					}
				]
			})
		})
	})
})
