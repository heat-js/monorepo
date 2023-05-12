import { formatThemeProperty } from '../helpers.js'

type Link = {
	children: unknown
	href: string
	title: string
	target?: string
	color?: [string, string] | string
}

export default ({
	children,
	href,
	title,
	target = '_blank',
	color = ['#0281FF', '#50a8ff'],
}: Link) => {
	const [id, color1] = formatThemeProperty('color', color)

	return (
		<a
			href={href}
			class={id}
			target={target}
			title={title || children}
			style={{
				color: color1,
			}}>
			{children}
		</a>
	)
}
