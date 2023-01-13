
import { formatAttributeNumber, formatStyleNumber } from '../helpers.js'

export default ({ href, src, alt, width, height, target = '_blank', align, borderRadius }) => (
	<tr>
		<td align={align}>
			<a href={href} target={target} title={alt}>
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
			</a>
		</td>
	</tr>
)
