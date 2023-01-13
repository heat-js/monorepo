
import { formatThemeProperty } from '../helpers.js'

export default ({ href, target = '_blank', color = ['#0281FF', '#50a8ff'], title, children }) => {
	const [id, color1] = formatThemeProperty('color', color);

	return (
		<a
			href={href}
			class={id}
			target={target}
			title={title || children}
			style={{
				color: color1
			}}
		>
			{children}
		</a>
	)
}
