
import Player	from 'play-sound'
import path		from 'path'
import options	from '../terminal/options'

player = new Player {}

export playSound = (file, options) ->
	if options.mute
		return

	return new Promise (resolve, reject) ->
		player.play file, options, (error) ->
			if error
				reject error
			else
				resolve()

export playSuccess = ->
	file = path.join __dirname, '/success.mp3'
	return playSound file

export playError = ->
	file = path.join __dirname, '/error.mp3'
	return playSound file
