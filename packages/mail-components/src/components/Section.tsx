import { combineClasses, formatThemeProperty } from '../helpers.js'

type Section = {
	children: any
	bgColor?: [string, string] | string
	bgImage?: string
	padding?: string
	borderRadius?: string
}

export default ({ children, bgColor, bgImage, padding, borderRadius }: Section) => {
	const [id1, color] = formatThemeProperty('background-color', bgColor)
	const [id2, image] = formatThemeProperty('background-image', bgImage)

	return (
		<tr>
			<td
				class={combineClasses(id1, id2)}
				bgcolor={color}
				style={{
					padding,
					backgroundColor: color,
					backgroundImage: image,
					borderRadius,
				}}>
				<table
					style={{
						width: '100%',
						border: 0,
						borderSpacing: 0,
					}}
					width='100%'
					border='0'
					cellPadding='0'
					cellSpacing='0'>
					{children}
				</table>
			</td>
		</tr>
	)
}
