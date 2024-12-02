const crypto = require('crypto');

// Genera una clave secreta de 64 bytes y la convierte en hexadecimal
const secret = crypto.randomBytes(64).toString('hex');

console.log("JWT Secret:", secret);
