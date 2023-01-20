import Raw from './Raw'

export default (props: any) => {
	if (props.negative) {
		return (
			<>
				<Raw html={`<!--[if ${props.if}]><! -->`} />
				{props.children}
				<Raw html={`<!--<![endif]-->`} />
			</>
		)
	}

	return (
		<>
			<Raw html={`<!--[if ${props.if}]>`} />
			{props.children}
			<Raw html={`<![endif]-->`} />
		</>
	)
}