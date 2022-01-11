
import load				from '../../../src/feature/template/load'
import split			from '../../../src/feature/template/split'
import deploy			from '../../../src/feature/template/deploy'
import resolveResources	from '../../../src/feature/template/resolve-resources'
import output			from '../../../src/resource/output'
import lambdaFunction	from '../../../src/resource/lambda/function'
import path				from 'path'
import fs				from 'fs'

describe 'Template Deploy', ->

	dir = path.join process.cwd(), 'test/data'

	it 'should deploy', ->
		template = await load path.join dir, 'aws'
		context = await resolveResources template, {
			# 'Custom::Test': test
			'Custom::Output':			output
			'Custom::Lambda::Function': lambdaFunction
		}

		# stacks = split context
		# console.log template
		# console.log templates
		# await deploy { context, stacks }
		await deploy context


	# it 'should throw when directory is empty', ->
	# 	await expect load path.join dir, 'empty'
	# 		.rejects.toThrow "AWS template directory has not template files inside"

	# it 'should throw when directory doesn\'t exist', ->
	# 	await expect load path.join dir, 'unknown'
	# 		.rejects.toThrow "AWS template directory doesn't exist"
