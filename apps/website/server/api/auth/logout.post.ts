export default defineEventHandler((event) => {
  setCookie(event, "waldo_jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 0,
  });
  return { success: true };
});
