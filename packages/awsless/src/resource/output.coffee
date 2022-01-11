
import resource from '../feature/resource'

export default resource (ctx) ->
	ctx.addOutput ctx.name, {
		Region:			ctx.string '#Region', ''
		Description:	ctx.string 'Description', ''
		Value:			ctx.string 'Value'
		Export: {
			Name:		ctx.string 'Name'
		}
	}
