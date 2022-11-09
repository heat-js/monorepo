
import { basename } from 'path'
# os = require 'node:os'

describe 'Coffee Test 222', ->

	it 'should be able to use imported modules', ->
		expect basename __dirname
			.toBe 'test'

	# it 'should be able to use required modules', ->
	# 	expect typeof os.platform()
	# 		.toBe 'string'
