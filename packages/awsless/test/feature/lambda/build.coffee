
import path		from 'path'
import fs		from 'fs'
import renderJsx from 'preact-render-to-string'
import removeDir from '../../../src/feature/fs/remove-directory'
import { spawn, Thread, Worker } from 'threads'

describe 'Lambda Build', ->

	build = (input, output, options = {}) ->
		worker = await spawn new Worker '../../../src/feature/lambda/build.js'

		try
			result = await worker.build input, output, options

		catch error
			throw error

		finally
			await Thread.terminate worker

		return result

	testDir = path.join process.cwd(), 'test/data/lambda'
	tempDir = path.join process.cwd(), 'test/data/temp'

	afterAll ->
		await removeDir tempDir

	it 'should throw for unknown coffee', ->
		inputFile	= path.join testDir, 'unknown.coffee'
		outputFile	= path.join tempDir, 'unknown.js'

		await expect build inputFile, outputFile
			.rejects.toThrow Error

	it 'should throw for invalid coffee', ->
		inputFile	= path.join testDir, 'invalid-code.coffee'
		outputFile	= path.join tempDir, 'invalid-code.js'

		await expect build inputFile, outputFile
			.rejects.toThrow Error

	it 'should build valid coffee', ->
		inputFile	= path.join testDir, 'valid-code.coffee'
		outputFile	= path.join tempDir, 'valid-code.js'

		await build inputFile, outputFile

		result = await fs.promises.readFile outputFile
		result = result.toString 'utf-8'

		expect result.indexOf '(()=>{'
			.toBe 0

	it 'should build valid jsx', ->
		inputFile	= path.join testDir, 'test.jsx'
		outputFile	= path.join tempDir, 'jsx.js'

		await build inputFile, outputFile

		jsx  = require outputFile
		html = renderJsx jsx.default()

		expect html
			.toBe '<p>Hello World Jack</p>'

	it 'should build valid markdown', ->
		inputFile	= path.join testDir, 'test.md'
		outputFile	= path.join tempDir, 'markdown.js'

		await build inputFile, outputFile

		markdown = require outputFile

		result = await fs.promises.readFile inputFile
		result = result.toString 'utf-8'

		expect markdown.default
			.toBe result

	it 'should build valid html', ->
		inputFile	= path.join testDir, 'test.html'
		outputFile	= path.join tempDir, 'html.js'

		await build inputFile, outputFile

		html = require outputFile

		result = await fs.promises.readFile inputFile
		result = result.toString 'utf-8'

		expect html.default
			.toBe result

	# it 'should build valid top level await support', ->
	# 	inputFile	= path.join testDir, 'top-level-await.coffee'
	# 	outputFile	= path.join tempDir, 'top-level-await.js'

	# 	await build inputFile, outputFile

	# 	require outputFile

	# 	# result = await fs.promises.readFile inputFile
	# 	# result = result.toString 'utf-8'

	# 	# expect html.default
	# 	# 	.toBe result
