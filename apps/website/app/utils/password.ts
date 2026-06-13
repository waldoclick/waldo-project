export function computePasswordStrength(password: string): {
  score: number;
  label: string;
} {
  if (!password) return { score: 0, label: "" };

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^\dA-Za-z]/.test(password);

  const basicCount = [hasLength, hasUpper, hasLower, hasDigit].filter(
    Boolean,
  ).length;

  if (basicCount <= 1) return { score: 1, label: "Muy débil" };
  if (basicCount <= 3) return { score: 2, label: "Débil" };
  if (!hasSpecial) return { score: 3, label: "Fuerte" };
  return { score: 4, label: "Muy fuerte" };
}

export function generateSecurePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;

  const pick = (charset: string) =>
    charset.charAt(Math.floor(Math.random() * charset.length));

  const chars: string[] = [
    pick(upper),
    pick(lower),
    pick(digits),
    pick(special),
  ];

  for (let i = 4; i < 16; i++) {
    chars.push(pick(all));
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = chars[i] ?? "";
    chars[i] = chars[j] ?? "";
    chars[j] = tmp;
  }

  return chars.join("");
}
