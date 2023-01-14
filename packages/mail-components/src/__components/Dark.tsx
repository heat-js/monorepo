
import Mso from './Mso'

export default ({ children } : { children: any }) => (
	<Mso if='!mso' negative>
		<div
			class='dark'
			style={{
				display: 'none',
				overflow: 'hidden',
				width: '0px',
				maxHeight: '0px',
				maxWidth: '0px',
				lineHeight: '0px',
				visibility: 'hidden',
			}}>
			{children}
		</div>
	</Mso>
)
