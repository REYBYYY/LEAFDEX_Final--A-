/**
 * Security & Validation Utilities (JavaScript)
 */

export function evaluatePassword(password) {
  if (!password) {
    return {
      score: 0,
      tier: 'NONE',
      label: 'Too Weak',
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      rules: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      },
    };
  }

  const rules = {
    length: password.length >= 8 && password.length <= 16,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-\[\]\\\/+~`=]/.test(password),
  };

  const score = Object.values(rules).filter(Boolean).length;

  let tier = 'WEAK';
  let label = 'Weak (Needs More Criteria)';
  let color = 'bg-rose-500';
  let textColor = 'text-rose-400';

  if (score >= 5) {
    tier = 'STRONG';
    label = 'Strong (All Criteria Met)';
    color = 'bg-emerald-400';
    textColor = 'text-emerald-400';
  } else if (score >= 3) {
    tier = 'MODERATE';
    label = 'Moderate (3-4 Criteria Met)';
    color = 'bg-amber-400';
    textColor = 'text-amber-400';
  }

  return {
    score,
    tier,
    label,
    color,
    textColor,
    rules,
  };
}

export function validateFullName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Full name is required.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: 'Full name must be at least 2 characters.' };
  }
  // Only letters, spaces, dots, and dashes allowed; must start with a letter
  if (!/^[a-zA-Z][a-zA-Z .\-]*$/.test(trimmed)) {
    return { valid: false, error: 'Full name may only contain letters, spaces, dots (.), and dashes (-).' };
  }
  return { valid: true };
}

export function validateBirthday(birthday) {
  if (!birthday) {
    return { valid: false, error: 'Birthday is required.' };
  }
  const match = birthday.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return { valid: false, error: 'Date must be formatted as MM/DD/YYYY.' };
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Invalid month (01-12).' };
  }
  if (day < 1 || day > 31) {
    return { valid: false, error: 'Invalid day of month.' };
  }

  // 18+ restriction: birth year must be 2007 or earlier
  if (year > 2007) {
    return {
      valid: false,
      error: 'Age Restriction: You must be at least 18 years old to register (born in 2007 or earlier).',
    };
  }

  const birthDate = new Date(year, month - 1, day);
  const maxAllowedDate = new Date(2007, 11, 31, 23, 59, 59);

  if (birthDate > maxAllowedDate) {
    return {
      valid: false,
      error: 'Age Restriction: Maximum birthdate allowed is December 31, 2007 (18+).',
    };
  }

  return { valid: true };
}

export function validateMobilePhone(phone) {
  if (!phone) {
    return { valid: false, error: 'Mobile phone number is required.' };
  }
  // Accept: +63XXXXXXXXXX (13 chars), 63XXXXXXXXXX (12 digits), or 09XXXXXXXXX (11 digits)
  const isValid = /^\+63\d{10}$/.test(phone) || /^63\d{10}$/.test(phone) || /^09\d{9}$/.test(phone);
  if (!isValid) {
    return {
      valid: false,
      error: 'Enter (+63) with 13 characters (e.g. +639123456789) or (09) with 11 digits (e.g. 09123456789).',
    };
  }
  return { valid: true };
}

export function validateAccessTypePassword(accessType, passcode) {
  if (accessType === 'ADMIN') {
    if (passcode === '1234567890') {
      return { valid: true };
    }
    return { valid: false, error: 'Invalid Admin passcode.' };
  }

  if (accessType === 'SUPER_ADMIN') {
    if (passcode === '24681012141620') {
      return { valid: true };
    }
    return { valid: false, error: 'Invalid Super Admin passcode.' };
  }

  return { valid: true };
}

export function getRoleBadgeColor(accessType) {
  switch (accessType) {
    case 'SUPER_ADMIN':
      return 'bg-purple-500/20 text-purple-200 border-purple-400/40 shadow-[0_0_12px_rgba(192,132,252,0.25)]';
    case 'ADMIN':
      return 'bg-amber-500/20 text-amber-200 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.25)]';
    case 'USER':
    default:
      return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.25)]';
  }
}

export function getRoleDisplayLabel(accessType) {
  switch (accessType) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'ADMIN':
      return 'Admin';
    case 'USER':
    default:
      return 'Standard User';
  }
}
