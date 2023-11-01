type Button = {
	children: unknown
	href: string
	target?: string
	align?: 'left' | 'right' | 'center'
	borderRadius?: string
	bgColor?: string
	margin?: string
	padding?: string
	textColor?: string
}

export default ({
	children,
	href,
	target = '_blank',
	align = 'center',
	borderRadius = '5px',
	bgColor = '#0281FF',
	margin = '10px',
	padding = '10px 15px',
	textColor = '#ffffff',
}: Button) => {
	return (
		<tr mc:hideable>
			<td align={align} style={{ padding: margin }}>
				<table border='0' cellSpacing='0' cellPadding='0'>
					<tr>
						<td align='center' bgcolor={bgColor} style={{ borderRadius }}>
							<a
								mc:edit
								href={href}
								target={target}
								style={{
									display: 'inline-block',
									lineHeight: '22px',
									fontSize: '15px',
									fontWeight: '700',
									fontFamily:
										'-webkit-system-font, Helvetica Neue, Helvetica, sans-serif',
									padding,
									color: textColor,
									textDecoration: 'none',
									borderRadius,
									border: `solid 1px ${bgColor}`,
									'-webkit-font-smoothing': 'antialiased',
									'-webkit-text-size-adjust': 'none',
								}}>
								{children}
							</a>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	)
}
