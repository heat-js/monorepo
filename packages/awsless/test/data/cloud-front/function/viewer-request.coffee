
import handle 		from '@heat/cloud-front-function'
# import ForceNonWww 	from '@heat/cloud-front-function/middleware/force-non-www'
import GeoBlock 	from '@heat/cloud-front-function/middleware/geo-block'


export default handle(
	new GeoBlock [ 'NL' ], []
	(app) ->
		console.log app.input
		app.output = app.input.request
)
