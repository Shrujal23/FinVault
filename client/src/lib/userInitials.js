export function getUserInitials(nameOrEmail) {
	const raw = String(nameOrEmail || '').trim();
	if (!raw) return '?';
	const name = raw.includes('@') ? raw.split('@')[0] : raw;
	const parts = name.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
	}
	return (parts[0]?.[0] || '?').toUpperCase();
}
