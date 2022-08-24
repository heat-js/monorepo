
import spawn from './spawn'

export exec = (inputFile, options = {}) ->
	node = await spawn inputFile, options
	return new Promise (resolve, reject) ->
		buffers = []

		node.stdout.on 'data', (data) ->
			buffers.push data

		node.on 'exit', ->
			resolve(
				Buffer
					.concat buffers
					.toString 'utf8'
			)

		node.on 'error', (error) ->
			reject error
