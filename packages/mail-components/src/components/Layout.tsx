import { formatAttributeNumber, formatStyleNumber, formatThemeProperty } from '../helpers.js'
import Mso from './Mso'
import Raw from './Raw'

type Layout = {
	children: any
	width: string | number
	bgColor?: [string, string] | string
}

export default ({ children, width, bgColor = ['#ffffff', '#0c1018'] }: Layout) => {
	const [id, color] = formatThemeProperty('background-color', bgColor)

	return (
		<table style={{ borderSpacing: 0 }} border='0' cellPadding='0' cellSpacing='0' width='100%'>
			<tr>
				<td class={id} align='center' bgcolor={color}>
					<Mso if='(gte mso 9)|(IE)'>
						<Raw
							html={`<table style="borderSpacing: 0;" align="center" border="0" cellspacing="0" cellpadding="0" width="${formatAttributeNumber(
								width
							)}"><tr><td align="center" valign="top" width="${formatAttributeNumber(
								width
							)}">`}
						/>
					</Mso>
					<table
						style={{ maxWidth: formatStyleNumber(width), borderSpacing: 0 }}
						border='0'
						cellPadding='0'
						cellSpacing='0'
						width='100%'>
						{children}
					</table>
					<Mso if='(gte mso 9)|(IE)'>
						<Raw html='</td></tr></table>' />
					</Mso>
				</td>
			</tr>
		</table>
	)
}
