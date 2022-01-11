
import path			from 'path'
import { run }		from '../terminal/task'
import filesize 	from 'filesize'
import { spawn, Thread, Worker } from 'threads'


build = (input, output, options) ->
	worker = await spawn new Worker './build'

	try
		result = await worker.build input, output, options

	catch error
		throw error

	finally
		await Thread.terminate worker

	return result

export default (handle) ->
	root = process.cwd()
	file = path.join root, handle

	return run (task) ->
		task.setPrefix 'CloudFront Functions'
		task.setContent 'Building...'

		code = await build file

		task.setContent 'Done'
		task.addMetadata 'Size', filesize Buffer.byteLength code, 'utf8'

		return code
