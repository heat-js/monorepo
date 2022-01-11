
import path from 'path'
import { spawn, Thread, Worker } from "threads"

# worker = await spawn new Worker './build'
# const hashed = await auth.hashPassword("Super secret password", "1234")

# console.log("Hashed password:", hashed)

# await Thread.terminate(auth)

# import Worker from 'jest-worker'

input	= path.join __dirname, 'input.coffee'
output	= path.join __dirname, 'output.js'

# worder = new Worker './build'

( ->
	# console.log 'build', input
	await Promise.all [ 0..1 ].map ->
		worker = await spawn new Worker './build'
		result = await worker.build input, output
		console.log  result
		await Thread.terminate worker

	# worker1 = await spawn new Worker './build'
	# worker2 = await spawn new Worker './build'
	# # console.log await worker.build input, output
	# # console.log await worker.build input, output
	# await Promise.all [
	# 	worker1.build input, output
	# 	worker2.build input, output
	# 	worker1.build input, output
	# ]
	# # await worker.end()
	# await Thread.terminate worker1
	# await Thread.terminate worker2
	console.log 'done'
)()
