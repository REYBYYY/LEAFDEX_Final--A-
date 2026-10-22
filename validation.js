export function validateFullName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  // Only letters, spaces, dots, and dashes; must start with a letter; min 2 chars
  return trimmed.length >= 2 && /^[a-zA-Z][a-zA-Z .\-]*$/.test(trimmed);
}

export function validateBirthday(birthday) {
  const match = birthday.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = parseInt(match[1], 10);
  if (year > 2007) return false;
  const birthDate = new Date(birthday);
  const maxDate = new Date('2007-12-31T23:59:59');
  return birthDate <= maxDate;
}

export function validateMobilePhone(phone) {
  // Accept: +63XXXXXXXXXX (13 chars), 63XXXXXXXXXX (12 digits), or 09XXXXXXXXX (11 digits)
  return /^\+63\d{10}$/.test(phone) || /^63\d{10}$/.test(phone) || /^09\d{9}$/.test(phone);
}

export function validatePasswordStrength(password) {
  const errors = [];
  if (!password || password.length < 8 || password.length > 16) {
    errors.push('Password must be between 8 and 16 characters in length.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z).');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one numeric digit (0-9).');
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-\[\]\\/\+~`=]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_...).');
  }
  return { valid: errors.length === 0, errors };
}
