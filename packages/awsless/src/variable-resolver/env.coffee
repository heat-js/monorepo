
export default (props) ->
	return props.map (prop) =>
		return process.env[ prop ]
