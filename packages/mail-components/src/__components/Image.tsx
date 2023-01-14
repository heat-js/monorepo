
import { Fragment } from 'preact'
import { formatAttributeNumber, formatStyleNumber } from '../helpers.js'
import Dark from './Dark'
import Light from './Light'

const Image = ({ src, alt, width, height, borderRadius }) => (
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
		}} />
)

export default ({ href, src, alt, width, height, target = '_blank', align, borderRadius }) => {

	let image;
	if (!Array.isArray(src)) {
		image = <Image {...{ src, alt, width, height, borderRadius }} />;
	} else {
		image = (
			<Fragment>
				<Light><Image {...{ src: src[0], alt, width, height, borderRadius }} /></Light>
				<Dark><Image {...{ src: src[1], alt, width, height, borderRadius }} /></Dark>
			</Fragment>
		)
	}

	return (
		<tr>
			<td align={align}>
				<a href={href} target={target} title={alt} style={{
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
