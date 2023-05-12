import Raw from './Raw'

export default ({ children }: { children: unknown }) => (
	<div
		class='preview-text'
		style={{
			display: 'none',
			fontSize: '1px',
			color: '#333333',
			lineHeight: '1px',
			maxHeight: '0px',
			maxWidth: '0px',
			opacity: '0',
			overflow: 'hidden',
		}}>
		{children}
		<Raw html={'&nbsp;&zwnj;'.repeat(227)} />
	</div>
)
