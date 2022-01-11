
import Json						from '../src/encrypt/processor/json'
import ManipulationProtection	from '../src/encrypt/processor/manipulation-protection'
import Encryption 				from '../src/encrypt/processor/encryption'
import Encrypter				from '../src/encrypt/encrypter'

encrypter = new Encrypter [
	[
		new Json
		new ManipulationProtection 'sha256', 'your-salt'
		new Encryption 'aes-256-cbc', 'your-second-salt'
	]
]
