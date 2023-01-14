
import { h } from 'preact'

export default ({ children, fontSize = '1.1em' }) => (
	<span style={{ fontSize }}>
		{children}
	</span>
)
