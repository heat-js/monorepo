
export default (events) ->
	currentEvents = []

	for event in events
		currentEvents.unshift event
		if event.ResourceStatusReason is 'User Initiated'
			break

		# switch event.ResourceStatus
		# 	when 'UPDATE_IN_PROGRESS', 'CREATE_IN_PROGRESS'
		# 		break

	for event in currentEvents
		if event.ResourceStatus.includes 'FAILED'
			return "[#{ event.LogicalResourceId }] #{ event.ResourceStatusReason }"

	for event in events
		if event.ResourceStatus.includes 'FAILED'
			return "[#{ event.LogicalResourceId }] #{ event.ResourceStatusReason }"

	return 'Unknown error'
