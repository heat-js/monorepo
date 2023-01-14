import { formatThemeProperty } from '../helpers.js'

type Title = {
	children: any
	color?: [string, string] | string
	padding?: string
	align?: 'left' | 'right' | 'center'
}

export default ({
	children,
	color = ['#000000', '#ffffff'],
	padding = '10px 0',
	align = 'left',
}: Title) => {
	const [id, color1] = formatThemeProperty('color', color)

	return (
		<tr>
			<td style={{ padding }} align={align}>
				<h1
					class={id}
					style={{
						color: color1,
						margin: '0',
						padding: '0',
						lineHeight: '32px',
						fontSize: '24px',
						fontWeight: '700',
						fontFamily: '-webkit-system-font, Helvetica Neue, Helvetica, sans-serif',
						'-webkit-font-smoothing': 'antialiased',
						'-webkit-text-size-adjust': 'none',
					}}>
					{children}
				</h1>
			</td>
		</tr>
	)
}
