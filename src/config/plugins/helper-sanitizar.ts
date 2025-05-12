export class HelperSanitizar {
  static sanitizeUser(user: any) {
    if (!user) return null;
    const {
      password,
      google_id,
      profile_picture,
      email_validated,
      ...safeUser
    } = user;
    return safeUser;
  }
}
