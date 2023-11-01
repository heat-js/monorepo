import { formatThemeProperty } from '../helpers.js'

type Heading = {
	children?: HTMLHeadingElement
	color?: [string, string] | string
	padding?: string
	align?: 'left' | 'right' | 'center'
}

export default ({
	children,
	color = ['#000000', '#ffffff'],
	padding = '10px 0',
	align = 'left',
}: Heading) => {
	const [id, color1] = formatThemeProperty('color', color)

	return (
		<tr mc:hideable>
			<td style={{ padding }} align={align}>
				<h2
					mc:edit
					class={id}
					style={{
						color: color1,
						margin: '0',
						padding: '0',
						lineHeight: '28px',
						fontSize: '20px',
						fontWeight: '500',
						fontFamily: '-webkit-system-font, Helvetica Neue, Helvetica, sans-serif',
						'-webkit-font-smoothing': 'antialiased',
						'-webkit-text-size-adjust': 'none',
					}}>
					{children}
				</h2>
			</td>
		</tr>
	)
}
