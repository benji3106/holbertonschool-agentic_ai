const userRepository = require('../repositories/user.repository');

class ExportService {
	async exportUserProfile(email) {
		const user = userRepository.findByEmail(email);

		if (!user) {
			throw new Error("Utilisateur introuvable");
		}

		return {
			user,
			exportedAt: new Date().toISOString(),
		};
	}
}

module.exports = new ExportService();
