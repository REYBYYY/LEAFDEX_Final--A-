import bcrypt from 'bcryptjs';

export const state = {
  nextId: 1,
  usersDatabase: new Map(),
  auditLogs: [],
  otpStore: new Map(),
  activeSessions: new Map(),
};

export function logSecurityEvent(event, userEmail, status, details, req) {
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const log = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    event,
    userEmail: userEmail || 'anonymous',
    ipAddress,
    status,
    details,
  };

  state.auditLogs.unshift(log);
  if (state.auditLogs.length > 200) state.auditLogs.pop();
}

export function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    birthday: user.birthday,
    address: user.address,
    email: user.email,
    mobilePhone: user.mobilePhone,
    accessType: user.accessType,
    failedAttempts: user.failedAttempts,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
}

export function generateToken(email, accessType) {
  const token = `ldx_${Math.random().toString(36).substring(2)}_${Date.now()}`;
  state.activeSessions.set(token, { email, accessType, lastActive: Date.now() });
  return token;
}

export function seedDatabase() {
  const BCRYPT_SALT_ROUNDS = 10;
  const seedUsers = [
    {
      fullName: 'SuperAdmin',
      birthday: '1995-04-12',
      address: '101 Cyber Tower, Tech Hub, Metro Manila',
      email: 'superadmin@leafdex.com',
      mobilePhone: '639171234567',
      accessType: 'SUPER_ADMIN',
      initialPass: 'SuperAdmin@2026',
    },
    {
      fullName: 'AlexanderAdmin',
      birthday: '1998-08-22',
      address: '45 Palm Ridge Boulevard, Cebu City',
      email: 'admin@leafdex.com',
      mobilePhone: '639189876543',
      accessType: 'ADMIN',
      initialPass: 'AdminUser@2026',
    },
    {
      fullName: 'JaneDoe',
      birthday: '2002-11-15',
      address: '12 Jasmine Street, Davao City',
      email: 'janedoe@leafdex.com',
      mobilePhone: '639201122334',
      accessType: 'USER',
      initialPass: 'JaneUser@2026',
    },
  ];

  seedUsers.forEach((u) => {
    const user = {
      id: state.nextId++,
      fullName: u.fullName,
      birthday: u.birthday,
      address: u.address,
      email: u.email.toLowerCase(),
      mobilePhone: u.mobilePhone,
      accessType: u.accessType,
      passwordHash: bcrypt.hashSync(u.initialPass, BCRYPT_SALT_ROUNDS),
      failedAttempts: 0,
      isBlocked: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    state.usersDatabase.set(user.email, user);
  });
}
