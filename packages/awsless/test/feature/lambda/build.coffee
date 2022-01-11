
import build	from '../../../src/feature/lambda/build'
import path		from 'path'
import fs		from 'fs'

describe 'Lambda Build', ->

	testDir = path.join process.cwd(), 'test/data/lambda'
	tempDir = path.join process.cwd(), 'test/data/temp'

	it 'should throw for unknown code', ->
		inputFile	= path.join testDir, 'unknown.coffee'
		outputFile	= path.join tempDir, 'unknown.js'

		await expect build inputFile, outputFile
			.rejects.toThrow Error

	it 'should throw for invalid code', ->
		inputFile	= path.join testDir, 'invalid-code.coffee'
		outputFile	= path.join tempDir, 'invalid-code.js'

		await expect build inputFile, outputFile
			.rejects.toThrow Error

	it 'should build valid code', ->
		inputFile	= path.join testDir, 'valid-code.coffee'
		outputFile	= path.join tempDir, 'valid-code.js'

		await build inputFile, outputFile

		result = await fs.promises.readFile outputFile
		result = result.toString 'utf-8'

		expect result.indexOf '!function'
			.toBe 0
