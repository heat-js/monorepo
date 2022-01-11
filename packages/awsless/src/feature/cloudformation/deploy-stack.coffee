
import Client 			from '../client/cloudformation'
import stackStatus 		from './stack-status'
import stackEventsError from './stack-events-error'
import { run }			from '../terminal/task'
import time				from '../performance/time'
# import chalk			from 'chalk'

export default ({ profile, region, stack, templateBody, templateUrl, capabilities = [] }) ->

	elapsed = time()
	cloudFormation = Client { profile, region }

	return run (task) ->
		task.setPrefix 'Stack'
		# task.setName chalk"#{ stack } {gray #{ region }}"
		task.setName stack
		task.setContent 'Deploying...'
		task.addMetadata 'Region', region

		params = {
			StackName: stack
			Capabilities: capabilities
			Tags: [ { Key: 'Stack', Value: stack } ]
		}

		if templateUrl
			params.TemplateURL = templateUrl
		else
			params.TemplateBody = templateBody

		status = await stackStatus { profile, region, stack }
		exists = !(not status or status is 'ROLLBACK_COMPLETE')

		if not exists
			result = await cloudFormation.createStack {
				...params
				EnableTerminationProtection: false
				OnFailure: 'ROLLBACK'
			}
			.promise()

		else
			if status.includes 'IN_PROGRESS'
				task.setContent 'Failed'
				throw new Error "Stack is in progress: #{ status }"

			try
				result = await cloudFormation.updateStack {
					...params
				}
				.promise()

			catch error
				if error.message.includes 'No updates are to be performed'
					# log.warning 'Nothing to deploy!'
					task.setContent 'Unchanged'
					task.warning()
					task.addMetadata 'Time', elapsed()
					return

				throw error

		state = if exists then 'stackUpdateComplete' else 'stackCreateComplete'

		try
			await cloudFormation.waitFor state, { StackName: stack }
				.promise()

		catch error
			task.setContent 'Failed'
			if error.stack
				result = await cloudFormation.describeStackEvents { StackName: stack }
					.promise()

				throw new Error stackEventsError result.StackEvents

			throw error

		task.setContent 'Deployed'
		task.addMetadata 'Time', elapsed()
