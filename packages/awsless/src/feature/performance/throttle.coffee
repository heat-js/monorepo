
import os		from 'os'
import Queue	from 'promise-queue'

concurrency = Math.round os.cpus().length / 2
concurrency = Math.max 1, concurrency
queue		= new Queue concurrency

export default (callback) ->
	return queue.add callback
