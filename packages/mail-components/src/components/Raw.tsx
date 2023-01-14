export default ({ html }: { html: string }) => {
	return <fragment dangerouslySetInnerHTML={{ __html: html }} />
}
