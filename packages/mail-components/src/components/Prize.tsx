
export default ({ children, color = '#FDCB00', padding = '10px 0', align = 'left' }) => (
	<tr>
		<td style={{ padding }} align={align}>
			<p style={{
				color,
				margin: '0',
				padding,
				lineHeight: '38px',
				fontSize: '30px',
				fontWeight: '700',
				fontFamily: '-webkit-system-font, Helvetica Neue, Helvetica, sans-serif',
				'-webkit-font-smoothing': 'antialiased',
				'-webkit-text-size-adjust': 'none',
			}}>
				{children}
			</p>
		</td>
	</tr>
)
