const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;

const EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const NEW_PASSWORD_MIN_LENGTH = 12;
const NEW_PASSWORD_MAX_LENGTH = 72;

const isValidNewPassword = (password) =>
  typeof password === "string" &&
  password.length >= NEW_PASSWORD_MIN_LENGTH &&
  password.length <= NEW_PASSWORD_MAX_LENGTH &&
  Buffer.byteLength(password, "utf8") <= NEW_PASSWORD_MAX_LENGTH;

module.exports = {
  EMAIL_PATTERN,
  NAME_PATTERN,
  NEW_PASSWORD_MIN_LENGTH,
  NEW_PASSWORD_MAX_LENGTH,
  isValidNewPassword,
};
