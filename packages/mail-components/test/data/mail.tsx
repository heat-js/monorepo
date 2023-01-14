import {
	Email,
	PreviewText,
	Layout,
	Section,
	Image,
	Paragraph,
	Title,
	Link,
	Button,
	Emoji,
} from '../../src/index.js'

export default ({ userName }: { userName: string }) => {
	return (
		<>
			<Email title='Start your VIP journey now!' darkMode={false}>
				<PreviewText>Welcome to Jacks Club! Start your VIP journey now!</PreviewText>
				<Layout width='540px'>
					<Section bgColor={['#F3F5F9', '#111722']} borderRadius='20px'>
						<Section padding='10px 10px 0 10px'>
							<Image
								width='100%'
								borderRadius='10px'
								alt='Welcome Image'
								href={`https://jacksclub.io`}
								src={`https://mail.jacksclub.io/welcome.jpg`}
							/>
						</Section>

						<Section padding='15px 25px'>
							<Title>Welcome {userName},</Title>

							<Paragraph>
								Start your VIP journey on Jacks Club by adding some account funds
								and start receiving exclusive bonuses and rewards just by playing!{' '}
								<Emoji>🔥</Emoji>
							</Paragraph>

							<Paragraph>
								As you climb through the tiers you'll gain access to much greater
								rewards, and exclusive VIP treatment you won't find elsewhere!
							</Paragraph>

							<Paragraph>
								Every bet you place on Jacks Club edges you closer to great{' '}
								<Link
									href={`https://jacksclub.io/vip-club`}
									title='Receive exclusive bonuses through our VIP Program'>
									VIP Perks!
								</Link>
							</Paragraph>

							<Paragraph align='center'>
								<Emoji>⬇️ ⬇️ ⬇️ ⬇️ ⬇️ ⬇️</Emoji>
							</Paragraph>

							<Section padding='0 0 0 0'>
								<Paragraph>
									<Emoji>💰</Emoji> <strong>Rakeback -</strong> A benefit that
									essentially lowers the house edge of all our casino games! For
									every bet you place on the casino, you will receive up to 15% of
									the edge back.
								</Paragraph>
								<Paragraph>
									<Emoji>👑</Emoji> <strong>Level-Up -</strong> Reach a new VIP
									level and get paid. The higher the level the better the reward!
								</Paragraph>
								<Paragraph>
									<Emoji>🏆</Emoji> <strong>Contest Rewards -</strong> Play
									against other users for one the biggest bonuses available every
									day.
								</Paragraph>
								<Paragraph>
									<Emoji>🔁</Emoji> <strong>Reloads -</strong> Our VIP players are
									rewarded with a gift that keeps on giving. You can continuesly
									reload your balance every 15 minutes.
								</Paragraph>
							</Section>

							<Paragraph>
								Jacks Club offers additional bonus options like; Free Coin contest
								every 12 hours, Rainbot and custom chat games for all our users.
								Click below to find out more and get started! <Emoji>👇</Emoji>
							</Paragraph>

							<Button align='center' href={`https://jacksclub.io`}>
								Visit Jacks Club
							</Button>
						</Section>
					</Section>
					<Section padding='15px 25px'>
						<Image
							align='center'
							width='70px'
							height='50px'
							alt='Logo'
							href={`https://jacksclub.io`}
							src={[
								`https://mail.jacksclub.io/logo-light.png`,
								`https://mail.jacksclub.io/logo-dark.png`,
							]}
						/>
					</Section>
				</Layout>
			</Email>
		</>
	)
}
