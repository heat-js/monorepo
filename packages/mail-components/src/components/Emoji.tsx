export default ({
	children,
	fontSize = '1.1em',
}: {
	children: HTMLSpanElement
	fontSize?: string
}) => (
	<span mc:edit style={{ fontSize }}>
		{children}
	</span>
)
