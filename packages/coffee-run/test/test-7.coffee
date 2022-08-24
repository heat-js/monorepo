
import { exec } from '../src/index.coffee'

( ->
	output = await exec process.cwd() + '/test/test-6.jsx'
	console.log output
)()
