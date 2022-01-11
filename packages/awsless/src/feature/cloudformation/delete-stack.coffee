
import Client 			from '../client/cloudformation'
import { run }			from '../terminal/task'
import time				from '../performance/time'
import stackStatus 		from './stack-status'
import stackEventsError from './stack-events-error'

export default ({ profile, region, stack }) ->
	return run (task) ->
		elapsed = time()
		task.setPrefix 'Stack'
		# task.setName chalk"#{ stack } {gray #{ region }}"
		task.setName stack
		task.setContent 'Deleting...'
		task.addMetadata 'Region', region

		params = { StackName: stack }
		status = await stackStatus { profile, region, stack }
		if not status
			task.setContent 'Stack has already been deleted!'
			task.warning()
			return

		if status.includes 'IN_PROGRESS'
			task.setContent 'Failed'
			throw new Error "Stack is in progress: #{ status }"

		cloudFormation = Client { profile, region }
		result = await cloudFormation.deleteStack params
			.promise()

		state = if status then 'stackDeleteComplete' else 'stackCreateComplete'

		try
			await cloudFormation.waitFor 'stackDeleteComplete', params
				.promise()

		catch error
			task.setContent 'Failed'
			if error.stack
				result = await cloudFormation.describeStackEvents params
					.promise()

				throw new Error stackEventsError result.StackEvents

			throw error

		task.setContent 'Deleted'
		task.addMetadata 'Time', elapsed()
