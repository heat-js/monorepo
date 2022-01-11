
import load				from '../feature/template/load'
import resolveResources	from '../feature/template/resolve-resources'
import resolveVariables	from '../feature/template/resolve-variables'
# import stringify		from '../feature/template/stringify'
# import deployStack		from '../feature/cloudformation/deploy-stack'
# import validateTemplate	from '../feature/cloudformation/validate-template'
import split 			from '../feature/template/split'
# import uploadTemplate 	from '../feature/template/upload'
# import writeFile 		from '../feature/fs/write-file'
# import removeDirectory 	from '../feature/fs/remove-directory'
import logStacks		from '../feature/terminal/log-stacks'
import { run }			from '../feature/terminal/task'
import log				from '../feature/terminal/log'
import runTests			from '../feature/test/run'
import say				from '../feature/sound/say'
# import { playSuccess, playError }	from '../feature/sound'
import path 			from 'path'
import chalk			from 'chalk'
# import util				from 'util'
# import jsonFormat		from 'json-format'

import { localResolvers, remoteResolvers, logicalResolvers, resources } from '../config'

export default (options) ->
	try

		# -----------------------------------------------------
		# Run tests

		if options.test
			if not await runTests()
				throw new Error 'Tests failed'

		# -----------------------------------------------------
		# Load the template files
		context = await run (task) ->

			task.setContent "Loading templates..."

			template = await load path.join process.cwd(), 'aws'

			# -----------------------------------------------------
			# Resolve the local variable resolvers

			task.setContent "Resolve variables..."

			template = await resolveVariables template, localResolvers

			# -----------------------------------------------------
			# Resolve the remote variable resolvers

			template = await resolveVariables template, remoteResolvers

			# -----------------------------------------------------
			# Resolve the logical resolvers

			template = await resolveVariables template, logicalResolvers

			# -----------------------------------------------------
			# Parse our custom resources

			task.setContent "Parsing resources..."

			context = await resolveResources template, resources

			# task.setContent "Parsing resources"

			return context

		# -----------------------------------------------------
		# Split the stack into multiple stacks if needed

		stacks = split context

		# -----------------------------------------------------
		# Log stack(s) information

		logStacks stacks.map (stack) -> {
			Stack:		stack.stack
			Region:		stack.region
			Profile:	stack.profile
		}

		# -----------------------------------------------------
		# Show confirm prompt

		if not options.skipPrompt
			if not await log.confirm chalk"Are u sure you want to {green sync}?"
				log.warning 'Cancelled.'
				return

		# -----------------------------------------------------
		# Run events

		# 1
		await context.emitter.emit 'validate-resource'

		# 2
		await context.emitter.emit 'before-sync'

		# 3
		await context.emitter.emit 'sync'

		# 4
		await context.emitter.emit 'after-sync'

		# -----------------------------------------------------
		# play success sound

		# await playSuccess()
		say "The #{ stacks[ 0 ].stack } service has been synced."

	catch error

		log.error error

		# -----------------------------------------------------
		# play error sound

		# await playError()
		say "An error occurred syncing the #{ stacks[ 0 ].stack } service."

	process.exit 0
