// Helper to generate random readable password/codes
export function generateRandomPassword(length = 8, numbersOnly = false): string {
	if (numbersOnly) {
		return Math.floor(1000 + Math.random() * 9000).toString();
	}
	const chars = "abcdefghjkmnpqrstuvwxyz23456789";
	let res = "";
	for (let i = 0; i < length; i++) {
		res += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return res;
}

export function generateRandomUsername(prefix: string, name?: string): string {
	const cleanName = name ? name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) : "";
	const rand = Math.floor(100 + Math.random() * 900);
	return cleanName ? `${prefix}_${cleanName}_${rand}` : `${prefix}_${rand}`;
}
