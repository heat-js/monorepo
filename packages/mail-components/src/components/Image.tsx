import { formatAttributeNumber, formatStyleNumber } from '../helpers.js'
import Dark from './Dark'
import Light from './Light'

type Image = {
	href: string
	src: string[] | string
	alt: string
	width: string | number
	height?: string | number
	target?: string
	align?: 'left' | 'right' | 'center'
	borderRadius?: string
}

const Image = ({
	src,
	alt,
	width,
	height,
	borderRadius,
}: Pick<Image, 'alt' | 'width' | 'height' | 'borderRadius'> & { src: string }) => (
	<img
		src={src}
		alt={alt}
		width={formatAttributeNumber(width)}
		height={formatAttributeNumber(height)}
		border='0'
		style={{
			display: 'block',
			border: 'none',
			margin: 0,
			width: formatStyleNumber(width),
			height: formatStyleNumber(height),
			maxWidth: formatStyleNumber(width),
			maxHeight: formatStyleNumber(height),
			minWidth: formatStyleNumber(width),
			minHeight: formatStyleNumber(height),
			borderRadius,
		}}
	/>
)

export default ({ href, src, alt, width, height, target = '_blank', align, borderRadius }: Image) => {
	let image
	if (!Array.isArray(src)) {
		image = <Image {...{ src, alt, width, height, borderRadius }} />
	} else {
		image = (
			<>
				<Light>
					<Image {...{ src: src[0], alt, width, height, borderRadius }} />
				</Light>
				<Dark>
					<Image {...{ src: src[1], alt, width, height, borderRadius }} />
				</Dark>
			</>
		)
	}

	return (
		<tr>
			<td align={align}>
				<a
					href={href}
					target={target}
					title={alt}
					style={{
						display: 'block',
						width: formatStyleNumber(width),
						height: formatStyleNumber(height),
						borderRadius,
					}}>
					{image}
				</a>
			</td>
		</tr>
	)
}
