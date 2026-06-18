/**
 * Contact obfuscation helpers (08-04).
 *
 * Single source of truth for masking seller contact channels in the public
 * bulk payloads (ad detail + seller profile) and for revealing the real value
 * via the per-channel /ads|/sellers reveal endpoints.
 *
 * The masked format matches the contact-card mockup (apps/design/index.dc.html):
 *   email "gabriel@waldo.cl" → "g•••••@•••••.cl"
 *   phone "+56 9 1234 5678"  → "+56 9 •••• ••78"
 *
 * All helpers are PURE (string in, string out), null-safe (falsy → ""),
 * and depend on no locale libraries. The bullet is U+2022 ("•").
 */

const BULLET = "•";

/**
 * Mask an email address: keep the first char of the local part, the TLD, and
 * the first char of the domain label, bulleting everything else.
 * Falsy / malformed input returns "" (never throws).
 */
export function maskEmail(value: string | null | undefined): string {
  if (!value) return "";
  const atIndex = value.indexOf("@");
  if (atIndex <= 0 || atIndex === value.length - 1) return "";

  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);

  const dotIndex = domain.lastIndexOf(".");
  if (dotIndex <= 0) return "";

  const domainLabel = domain.slice(0, dotIndex);
  const tld = domain.slice(dotIndex); // includes the leading dot

  const maskedLocal = local[0] + BULLET.repeat(Math.max(local.length - 1, 1));
  const maskedDomain = BULLET.repeat(Math.max(domainLabel.length, 1));

  return `${maskedLocal}@${maskedDomain}${tld}`;
}

/**
 * Mask a phone number: keep the leading "+CC A" head (country code + first
 * group) and the last 2 digits, bulleting the middle in two visual groups.
 * Falsy input returns "" (never throws).
 */
export function maskPhone(value: string | null | undefined): string {
  if (!value) return "";

  const digits = value.replace(/\D/g, "");
  if (digits.length < 2) return "";

  const last2 = digits.slice(-2);

  // Preserve the leading "+CC A" head when present (e.g. "+56 9"), otherwise
  // just keep the last two digits behind a bulleted body.
  const head = value.match(/^\+\d{1,3}\s?\d?/);
  const headPart = head ? `${head[0].trim()} ` : "";

  return `${headPart}${BULLET.repeat(4)} ${BULLET.repeat(2)}${last2}`;
}

/**
 * Resolve the REAL value of a single contact channel for a user record.
 * Used by the reveal endpoints (08-04) to return one field at a time.
 * Returns null when the field is absent.
 */
export function revealUserChannel(
  user: Record<string, unknown>,
  channel: "phone" | "whatsapp" | "email",
): string | null {
  const raw = user[channel];
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}
