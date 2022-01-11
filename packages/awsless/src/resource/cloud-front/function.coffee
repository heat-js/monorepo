
import resource 	from '../../feature/resource'
import build 		from '../../feature/cloud-front/build-function'
import { Sub }		from '../../feature/cloudformation/fn'

export default resource (ctx) ->

	prefixName	= ctx.string '@Config.PrefixResourceName', ''
	handle		= ctx.string 'Handle'
	name		= ctx.string 'Name'
	name		= "#{ prefixName }#{ name }"

	ctx.on 'prepare-resource', ->
		code = await build handle
		# console.log code
		# console.log code.length, 'length'
		ctx.addResource ctx.name, {
			Type:	'AWS::CloudFront::Function'
			Region:	ctx.string '#Region', ''
			Properties: {
				Name: 			name
				AutoPublish: 	ctx.boolean 'AutoPublish', true
				FunctionCode: 	code
				FunctionConfig: {
					Runtime: 'cloudfront-js-1.0'
					Comment: "#{name} - Cloud Front Function"
				}
			}
		}
