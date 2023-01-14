import Raw from './Raw'

export default ({ value }: { value: string }) => (
	<style type='text/css'>
		<Raw html={value.replace(/[\t\n\r]+/gm, '')} />
	</style>
)
