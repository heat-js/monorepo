
import path			from 'path'
import { browser }	from '@bugsnag/source-maps'
# import { run }		from '../terminal/task'
# import time			from '../performance/time'

export default ({ apiKey, name }) ->
	root			= process.cwd()
	projectRoot		= path.join root, '.awsless', 'lambda', name, 'compressed'

	await browser.uploadOne {
		apiKey
		bundleUrl:		"#{ name }.js"
		bundle: 		path.join projectRoot, "#{ name }.js"
		sourceMap:		path.join projectRoot, "#{ name }.js.map"
		# projectRoot:	'/'
		projectRoot
		overwrite:		true
	}

	# elapsed 		= time()

	# return run (task) ->
	# 	task.setPrefix 'Bugsnag'
	# 	task.setName "#{ name }.map"
	# 	task.setContent 'Uploading source map...'

	# 	await browser.uploadOne {
	# 		apiKey
	# 		bundleUrl:		"#{ name }.js"
	# 		bundle: 		path.join projectRoot, "#{ name }.js"
	# 		sourceMap:		path.join projectRoot, "#{ name }.js.map"
	# 		# projectRoot:	'/'
	# 		projectRoot
	# 		overwrite:		true
	# 	}

	# 	task.setContent 'Uploaded to Bugsnag'
	# 	task.addMetadata 'Time', elapsed()
