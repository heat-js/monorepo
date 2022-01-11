
import chalk	from 'chalk'
import Confirm	from 'prompt-confirm'
import symbols	from 'log-symbols'
import util 	from 'util'
import options	from './options'

log = (...args) ->
	console.log ...args

export default {
	confirm: (message, options) ->
		entry = new Confirm {
			message
			default: false
			...options
		}

		return entry.run()

	warning: (message) ->
		log chalk.yellow "#{ symbols.warning } #{ message }"
		return @

	error: (message) ->
		if options.debug
			console.error message
		else
			if message instanceof Error
				{ message } = message

			log chalk.red "#{ symbols.error } #{ message }"

		return @

	info: (message) ->
		log chalk.blue "#{ symbols.info } #{ message }"
		return @

	success: (message) ->
		log chalk.green "#{ symbols.success } #{ message }"
		return @

	value: (key, value) ->
		log chalk"* {bold #{ key }}: {blue #{ value }}"
		return @

	object: (value) ->
		if typeof value is 'string'
			value = JSON.parse value

		log util.inspect value, false, null, true
		return @
}
