import Raw from './Raw'

type Mso = {
	children?: unknown
	if?: string
	negative?: boolean
}

export default (props: Mso) => {
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
