
import say from 'say'
import options from '../terminal/options'

export default (message, name = 'Daniel', speed = 1) ->
	if options.mute
		return

	return new Promise (resolve, reject) ->
		say.speak message, name, speed, (error) ->
			if error
				reject error
			else
				resolve()
