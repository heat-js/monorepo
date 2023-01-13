
import { formatThemeProperty } from '../helpers.js'

export default ({ children, align = 'left', margin = '10px 0 10px 15px', color = ['#000000', '#ffffff'] }) => {
	const [id, color1] = formatThemeProperty('color', color);
	return (
		<tr>
			<td align={align} style={{
				padding: margin,
			}}>
				<ul style={{
					listStyleType: 'disc',
					margin: '0',
					padding: '0',
				}}>
					<li
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
					</li>
				</ul>
			</td>
		</tr>
	)
}
