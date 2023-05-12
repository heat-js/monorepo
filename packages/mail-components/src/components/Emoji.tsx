export default ({ children, fontSize = '1.1em' }: { children: HTMLSpanElement, fontSize?: string }) => (
	<span style={{ fontSize }}>{children}</span>
)
