import { formatThemeProperty } from '../helpers.js'

type Paragraph = {
	children: any
	align?: 'left' | 'right' | 'center'
	margin?: string
	color?: [string, string] | string
}

export default ({
	children,
	align = 'left',
	margin = '10px 0',
	color = ['#000000', '#ffffff'],
}: Paragraph) => {
	const [id, color1] = formatThemeProperty('color', color)

	return (
		<tr>
			<td style={{ padding: margin }} align={align}>
				<p
					class={id}
					style={{
						color: color1,
						margin: '0',
						padding: '0',
						lineHeight: '22px',
						textAlign: align,
						fontSize: '15px',
						fontWeight: '400',
						fontFamily: '-webkit-system-font, Helvetica Neue, Helvetica, sans-serif',
						'-webkit-font-smoothing': 'antialiased',
						'-webkit-text-size-adjust': 'none',
					}}>
					{children}
				</p>
			</td>
		</tr>
	)
}