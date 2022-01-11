
import Table	from 'tty-table'
import chalk	from 'chalk'
import boxen	from 'boxen'

export default (stacks = []) ->
	options = {
		borderStyle: 'round'
		borderColor: 'blue'
		dimBorder: true
		padding: 1
		margin: 1
	}

	if stacks.length is 1
		single stacks[ 0 ], options
		return

	multi stacks, options

single = (stack, options) ->
	rows = [ [
		Object
			.keys stack
			.map (name) ->
				return chalk"{yellow #{ name }:}"
			.join '\n'

		Object
			.values stack
			.join '\n'
	] ]

	table = Table [], rows, {
		showHeader: false
		headerAlign: 'left'
		align: 'left'
		marginTop: 0
		marginLeft: 0
		# paddingTop: 0
		paddingLeft: 1
		borderStyle: 'none'
		compact: true
	}

	console.log boxen chalk"""
		{blue.bold  Stack Information}
		#{ table.render() }
	""", {
		...options
		padding: { top:1, left: 2, right: 2 }
	}

multi = (stacks, options) ->
	headers = [
		{ }
		...stacks.map (_, index) -> {
			value: chalk"{blue.bold Stack #{ index + 1 }.}"
			align: 'left'
		}
	]

	rows = [ [
		Object
			.keys stacks[ 0 ]
			.map (name) ->
				return chalk"{yellow #{ name }:}"
			.join '\n'

		...stacks.map (stack) ->
			return Object
				.values stack
				.join '\n'
	] ]

	table = Table headers, rows, {
		headerAlign: 'left'
		marginTop: 0
		marginLeft: 0
		paddingTop: 1
		paddingLeft: 1
		borderStyle: 'none'
		compact: true
	}

	console.log boxen table.render(), { ...options, padding: { left: 2, right: 2 } }
