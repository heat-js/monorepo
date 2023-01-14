
import { Fragment } from 'preact'
import Raw from './Raw'

export default (props) => {
	if (props.negative) {
		return (
			<Fragment>
				<Raw html={`<!--[if ${props.if}]><! -->`} />
				{props.children}
				<Raw html={`<!--<![endif]-->`} />
			</Fragment>
		)
	}

	return (
		<Fragment>
			<Raw html={`<!--[if ${props.if}]>`} />
			{props.children}
			<Raw html={`<![endif]-->`} />
		</Fragment>
	)
}
