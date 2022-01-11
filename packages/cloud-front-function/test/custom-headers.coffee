
import handle 			from '../src/handle'
import CustomHeaders 	from '../src/middleware/custom-headers'

describe 'Security Headers', ->
	cfFunction = handle(
		new CustomHeaders {
			'server':						'ColdFusion X8ZZ1'
			'strict-transport-security':	[ 'max-age=63072000', 'preload']
			'feature-policy': {
				'autoplay': 		"'self'"
				'camera': 			"'none'"
				'encrypted-media':	"'none'"
				'fullscreen': 		"'self'"
			}
		}
		(app) ->
			app.output = app.input.response
	)

	it 'should set the custom headers', ->
		result = await cfFunction {
			response: { headers: {}, statusCode: 200 }
		}

		expect result
			.toStrictEqual {
				statusCode: 200
				headers: {
					'server': {
						value: 'ColdFusion X8ZZ1'
					}
					'strict-transport-security': {
						value: 'max-age=63072000; preload'
					}
					'feature-policy': {
						value: "autoplay 'self'; camera 'none'; encrypted-media 'none'; fullscreen 'self'"
					}
				}
			}
