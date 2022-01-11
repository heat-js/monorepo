
import logStacks from '../../../src/feature/terminal/log-stacks'

describe 'Log Stacks', ->

	it 'log', ->
		logStacks [
			{
				Stack: 'stack-name'
				Name: 'test'
			}
		]

		return

	it 'log multiple', ->
		logStacks [
			{
				Stack: 'stack-name-1'
				Name: 'test'
			}
			{
				Stack: 'stack-name-2'
				Name: 'test'
			}
		]

		return
