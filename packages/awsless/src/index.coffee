
import loadTemplates	from './feature/template/load'
import resolveResources	from './feature/template/resolve-resources'
import resolveVariables	from './feature/template/resolve-variables'
import split 			from './feature/template/split'
import stringify 		from './feature/template/stringify'

import { localResolvers, remoteResolvers, logicalResolvers, resources } from './config'

export load = (path, { resolveLocalResolvers = true, resolveRemoteResolvers = true, resolveLogicalResolvers = true } = {}) ->
	template = await loadTemplates path

	if resolveLocalResolvers then	template = await resolveVariables template, localResolvers
	if resolveRemoteResolvers then	template = await resolveVariables template, remoteResolvers
	if resolveLogicalResolvers then	template = await resolveVariables template, logicalResolvers

	context = await resolveResources template, resources

	return split( context ).map (stack) -> {
		...stack
		templateBody: stringify stack.templateBody, context.globals
	}
