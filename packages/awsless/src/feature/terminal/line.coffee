
import { into } from 'draftlog'

if process.env.NODE_ENV is 'test' or process.env.JEST_WORKER_ID
	class TerminalLine
		update: (text) ->
else
	into console
		.addLineListener process.stdin

	class TerminalLine
		constructor: ->
			@draft = console.draft()

		update: (text) ->
			@draft text

export default TerminalLine
