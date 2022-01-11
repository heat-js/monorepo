
import { spawn } from 'child_process'

export default ->
	test = spawn 'yarn', [ 'test' ], {
		cwd: process.cwd()
		stdio: 'inherit'
	}

	return new Promise (resolve) ->
		test.on 'close', (code) ->
			resolve code is 0

	# test = spawn 'yarn test', {
	# 	cwd: process.cwd()
	# 	stdio: 'inherit'
	# }

	# return new Promise (resolve, reject) ->
	# 	test.stdout.on 'data', (data) ->
	# 		console.log 'STDOUT', data

	# 	test.stderr.on 'data', (data) ->
	# 		console.log 'STDERR', data

	# 	test.on 'close', (code) ->
	# 		console.log 'code', code
	# 		resolve()
