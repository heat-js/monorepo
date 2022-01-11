
import resource from '../feature/resource'

export default resource (ctx) ->

	ctx.addOutput ctx.name, {
		Name:	ctx.string 'Name'
		Ref:	ctx.ref 'name'
		Ref2:	ctx.ref 'name-2'
	}

	ctx.on 'beforeStackDeploy', ->
		ctx.value 'name', 'lol'
