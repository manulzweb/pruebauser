/**
 * Validate dangerous chars to avoid XSS injection
 * @param {string} text The text to validate
 * @returns {boolean} True if contains dangerous characters, false if not.
 */
export const hasDangerousChars = (text) => {
  const dangerousChars = /[<>&|\/]/;
  return dangerousChars.test(text);
}

/**
 * Validate if a email have valid chars with regex. /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/
 * @param {string} email The email to validate
 * @returns {boolean} True if email is valid, false if not.
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Repalce some symbols to the html equivalation, this work when we show some info in a html code
 * @param {string} str The string to validate 
 * @returns {boolean} return the string formated
 */
export const escapeHtml = (str = "") => {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const getEmailRules = (required = true) => [
  ...(required ? [{ validate: (val) => !val, errorMessage: "El correo es requerido" }] : []),
  { validate: (val) => val && val.length > 254, errorMessage: "El correo es demasiado largo" },
  { validate: (val) => val && hasDangerousChars(val), errorMessage: "El correo contiene caracteres no permitidos" },
  { validate: (val) => val && !isValidEmail(val), errorMessage: "Correo no válido" }
];

export const getPasswordRules = (required = true) => [
  ...(required ? [{ validate: (val) => !val, errorMessage: "La contraseña es requerida" }] : []),
  { validate: (val) => val && val.length < 6, errorMessage: "La contraseña debe tener al menos 6 caracteres" },
  { validate: (val) => val && val.length > 128, errorMessage: "La contraseña excede el límite" },
  { validate: (val) => val && hasDangerousChars(val), errorMessage: "La contraseña contiene caracteres no permitidos" }
];


