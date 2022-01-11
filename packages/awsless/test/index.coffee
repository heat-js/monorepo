
import { load }	from '../src/index'
import path		from 'path'

describe 'Api Index', ->

	testDir = path.join process.cwd(), 'test/data/aws/dynamodb.yml'
	# tempDir = path.join process.cwd(), 'test/data/temp'

	it 'should', ->
		result = await load testDir
		console.log result

		# inputFile	= path.join testDir, 'unknown.coffee'
		# outputFile	= path.join tempDir, 'unknown.js'

		# await expect build inputFile, outputFile
		# 	.rejects.toThrow Error
