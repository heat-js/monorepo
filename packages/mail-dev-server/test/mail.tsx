import { Email } from '@heat/mail-components'

export default ({ userName }: { userName: string }) => {
	return (
		<Email title='test' darkMode={true}>
			<p>Hello {userName}</p>
		</Email>
	)
}
