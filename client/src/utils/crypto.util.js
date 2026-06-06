import SHA256 from "crypto-js/sha256";

/**
 * Just hash a string, this is only one way so the string doest could be desphired
 * @param {string} email 
 * @returns {boolean} True if email is valid, false if not.
 */

export const hashPassword = (password) => SHA256(password).toString()