
import opts	from '../feature/terminal/options'

export default (options) ->
	return options.map (option) =>
		return opts[ option ]
