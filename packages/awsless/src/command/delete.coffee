
import load				from '../feature/template/load'
import resolveResources	from '../feature/template/resolve-resources'
import resolveVariables	from '../feature/template/resolve-variables'
import split 			from '../feature/template/split'
import deleteStack		from '../feature/cloudformation/delete-stack'
import removeDirectory 	from '../feature/fs/remove-directory'
import logStacks		from '../feature/terminal/log-stacks'
import log				from '../feature/terminal/log'
import { run }			from '../feature/terminal/task'
import say				from '../feature/sound/say'
# import { playSuccess, playError }	from '../feature/sound'
import chalk			from 'chalk'
import path				from 'path'

# import { warn, err, success, confirm } from '../feature/console'
import { localResolvers, remoteResolvers, logicalResolvers, resources } from '../config'

export default (options) ->

	try

		context = await run (task) ->
			# -----------------------------------------------------
			# Load the template files

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
			if not await log.confirm chalk"Are u sure you want to {red delete} the stack?"
				log.warning 'Cancelled.'
				return

		# -----------------------------------------------------
		# Clean up previous build files

		cloudformationDir = path.join process.cwd(), '.awsless', 'cloudformation'

		await run (task) ->
			task.setContent 'Cleaning up...'
			await Promise.all [
				removeDirectory cloudformationDir
				context.emitter.emit 'cleanup'
			]

		# -----------------------------------------------------
		# Run events before stack delete

		await context.emitter.emit 'before-deleting-stack'

		# -----------------------------------------------------
		# Split the stacks again to make sure we have all the
		# template changes committed

		stacks = split context

		# -----------------------------------------------------
		# Deleting stacks

		await Promise.all stacks.map (stack) ->
			return deleteStack {
				stack:		stack.stack
				profile:	stack.profile
				region:		stack.region
			}

		# -----------------------------------------------------
		# Run events after stack delete

		await context.emitter.emit 'after-deleting-stack'

		# -----------------------------------------------------
		# play success sound

		# await playSuccess()
		say "The #{ stacks[ 0 ].stack } service has been deleted."

	catch error

		log.error error

		# -----------------------------------------------------
		# play error sound

		# await playError()
		say "An error occurred deleting the #{ stacks[ 0 ].stack } service."

	process.exit 0
