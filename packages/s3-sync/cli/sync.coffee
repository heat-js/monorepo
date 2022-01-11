
import path		from 'path'
import sync		from '../src/sync'
import csp		from '../src/content-security-policy'

(->
	await sync {
		profile: 	process.env.PROFILE
		bucket:		process.env.BUCKET
		folder:		path.join process.cwd(), process.env.FOLDER
		csp
	}
)()
