
import objectPath		from '../object-path'
import deployStack		from '../cloudformation/deploy-stack'
import validateTemplate	from '../cloudformation/validate-template'
import stringify		from '../template/stringify'
import split 			from '../template/split'
import util 			from 'util'
import path 			from 'path'
import writeFile 		from '../fs/write-file'

import { task, warn, info, err, confirm, box }	from '../console'
import chalk									from 'chalk'
import logStacks								from '../terminal/log-stacks'

export default (context) ->

	stacks = split context

	# stackName	= context.string '@Config.Stack'
	# # region		= context.string '@Config.Region'
	# profile 	= context.string '@Config.Profile'

	# # console.log context, context.string '@Config.Stack'
	# # console.log templates

	# console.log util.inspect stacks, {
	# 	depth:	Infinity
	# 	colors: true
	# }

	# return

	logStacks stacks.map (stack) -> {
		Stack:		stack.name
		Region:		stack.region
		Profile:	stack.profile
		# resources:	Object.keys(template.Resources).length
		# outputs:	Object.keys(template.Outputs).length
	}

	# if not await confirm 'Are u sure?'
	# 	warn 'Cancelled.'
	# 	return

	# -----------------------------------------------------
	# Run events before stack update

	await task(
		'Cleaning up'
		context.emitter.emit 'cleanup'
	)

	# await context.emitter.emit 'cleanup'
	await context.emitter.emit 'validate-resource'
	await context.emitter.emit 'prepare-resource'

	# await context.emitter.emit 'pre-generate-template'
	# await context.emitter.emit 'generate-template'
	# await context.emitter.emit 'post-generate-template'

	# await context.emitter.emit 'pre-stack-deploy'
	# await context.emitter.emit 'beforeStackDeploy'

	# try
	# 	await context.emitter.emit 'beforeStackDeploy'

	# catch error
	# 	return err error.message

	# -----------------------------------------------------
	# Convert the template to JSON

	await context.emitter.emit 'before-preparing-template'

	stacks = split context

	for stack in stacks
		stack.template = stringify stack.template

	# -----------------------------------------------------
	# Save stack templates in the build folder

	buildDir = path.join process.cwd(), '.awsless', 'cloudformation'
	for stack in stacks
		file = path.join buildDir, "#{ stack.name }.#{ stack.region }.json"
		await writeFile file, stack.template

	# -----------------------------------------------------
	# Validate Templates

	await context.emitter.emit 'before-validating-template'

	# if
	# for stack in stacks
	# 	console.log util.inspect JSON.parse(stack.template), {
	# 		depth:	Infinity
	# 		colors: true
	# 	}

	# return

	try
		capabilities = await task(
			'Validate templates'
			Promise.all stacks.map (stack) ->
				return stack.capabilities = await validateTemplate stack
		)

	catch error
		return err error.message

	list = capabilities.flat()
	if list.length > 0
		info chalk"{white The stack is using the following capabilities:} #{ list.join ', ' }"

	# try
	# 	capabilities = await task(
	# 		'Validate templates'
	# 		validateTemplate { profile, region, template }
	# 	)

	# catch error
	# 	return err error.message

	# -----------------------------------------------------
	# Deploying stack

	await context.emitter.emit 'before-deploying-stack'

	try
		await task(
			"Deploying stack"
			Promise.all stacks.map (stack) ->
				return deployStack {
					stackName:		stack.name
					profile:		stack.profile
					region:			stack.region
					template:		stack.template
					capabilities:	stack.capabilities
				}
		)

	catch error
		return err error.message

	# -----------------------------------------------------
	# Run events after stack update

	try
		await context.emitter.emit 'after-deploying-stack'

	catch error
		return err error.message
