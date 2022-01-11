
import handle 			from '@heat/cloud-front-function'
import SecurityHeaders 	from '@heat/cloud-front-function/middleware/security-headers'

headers = {
	'server':						'ColdFusion X8ZZ1'
	'strict-transport-security':	[ 'max-age=63072000', 'preload']
	'x-xss-protection': 			[ '1', 'mode=block' ]
	'x-content-type-options':		'nosniff'
	'report-to': JSON.stringify {
		'group': 	'default'
		'max_age':	 31536000
		'endpoints': [{
			'url': 'https://jacksclub.report-uri.com/a/d/g'
		}]
		'include_subdomains': true
	}
	'permissions-policy': Object.entries({
		# 'interest-cohort': 	'()'
		'autoplay': 		'(self)'
		'camera': 			'()'
		'encrypted-media':	'()'
		'fullscreen': 		'(self)'
		'geolocation': 		'()'
		'microphone': 		'()'
		'midi': 			'()'
		'payment': 			'()'
	}).map ([ key, value ]) ->
		return "#{ key }=#{ value }"
	.join ', '
}

export default handle(
	new SecurityHeaders headers
	(app) ->
		app.output = app.input.response
)
