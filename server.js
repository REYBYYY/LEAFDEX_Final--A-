import express from 'express';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { state, logSecurityEvent, toPublicUser, generateToken, seedDatabase } from './server/db.js';
import { validateFullName, validateBirthday, validateMobilePhone, validatePasswordStrength } from './server/validation.js';
import { sendOtpEmail } from './server/email.js';
import { analyzePlantImage } from './server/vision.js';

dotenv.config();

const BCRYPT_SALT_ROUNDS = 10;

seedDatabase();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Raised above the 100kb default so base64-encoded plant photos fit.
  app.use(express.json({ limit: '12mb' }));

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  app.get('/api/auth/csrf', (req, res) => {
    const csrfToken = `csrf_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    res.json({ csrfToken });
  });

  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token || !state.activeSessions.has(token)) {
      return res.status(401).json({ success: false, message: 'Unauthorized or session expired.' });
    }

    const session = state.activeSessions.get(token);
    const now = Date.now();
    if (now - session.lastActive > 120000) {
      state.activeSessions.delete(token);
      return res.status(401).json({ success: false, message: 'Session timed out due to inactivity.' });
    }

    session.lastActive = now;
    req.userSession = session;
    next();
  };

  const handleSendOtp = async (req, res) => {
    try {
      const { email, fullName } = req.body;

      if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'A valid email address is required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (state.usersDatabase.has(normalizedEmail)) {
        logSecurityEvent('OTP_DUPLICATE_EMAIL_ATTEMPT', normalizedEmail, 'FAILURE', 'Attempted OTP for already existing email', req);
        return res.status(409).json({ success: false, message: 'This email address is already registered in the system.' });
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000;

      state.otpStore.set(normalizedEmail, { otp, expiresAt, createdAt: Date.now() });
      logSecurityEvent('OTP_GENERATED', normalizedEmail, 'SUCCESS', '6-digit OTP generated for registration', req);

      const emailResult = await sendOtpEmail({ to: normalizedEmail, otp, fullName, purpose: 'verification' });
      const emailSent = emailResult.sent;

      if (!emailSent) {
        logSecurityEvent('OTP_EMAIL_FAILED', normalizedEmail, 'FAILURE', emailResult.message || 'Email sending failed', req);
      } else {
        logSecurityEvent('OTP_EMAIL_SENT', normalizedEmail, 'SUCCESS', 'Email sent successfully via Resend', req);
      }

      const responseBody = {
        success: true,
        message: 'Check email for the OTP! A 6-digit verification code has been sent.',
        email: normalizedEmail,
        expiresAt,
        emailSent,
      };

      if (!emailSent && process.env.NODE_ENV !== 'production') {
        responseBody.otp = otp;
      }

      return res.json(responseBody);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to generate or send OTP.' });
    }
  };



  const handleVerifyOtp = (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const record = state.otpStore.get(normalizedEmail);
      if (!record) {
        logSecurityEvent('OTP_VERIFY_FAILED', normalizedEmail, 'FAILURE', 'OTP not found or not requested', req);
        return res.status(400).json({ success: false, message: 'OTP not found or expired. Please request a new code.' });
      }

      if (Date.now() > record.expiresAt) {
        state.otpStore.delete(normalizedEmail);
        logSecurityEvent('OTP_EXPIRED', normalizedEmail, 'FAILURE', 'Expired OTP submitted', req);
        return res.status(400).json({ success: false, message: 'The OTP code has expired. Please request a fresh one.' });
      }

      if (record.otp !== String(otp).trim()) {
        logSecurityEvent('OTP_MISMATCH', normalizedEmail, 'FAILURE', 'Incorrect OTP entered', req);
        return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your email and enter the correct 6 digits.' });
      }

      record.verified = true;
      logSecurityEvent('OTP_VERIFIED', normalizedEmail, 'SUCCESS', 'OTP code verified successfully', req);
      return res.json({ success: true, message: 'OTP verified successfully!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error verifying OTP.' });
    }
  };



  app.post('/api/send-otp', handleSendOtp);
  app.post('/api/verify-otp', handleVerifyOtp);
  app.post('/api/auth/verify-otp', handleVerifyOtp);

  app.post('/api/auth/register', (req, res) => {
    try {
      const { fullName, birthday, address, email, mobilePhone, accessType, password, confirmPassword, otp, accessTypePassword } = req.body;

      if (!fullName || !validateFullName(fullName)) {
        logSecurityEvent('REGISTRATION_FAILED', email, 'FAILURE', 'Invalid Name: Must contain only letters and spaces', req);
        return res.status(400).json({ success: false, message: 'Full Name may only contain letters, spaces, dots (.), and dashes (-). It must start with a letter.' });
      }

      if (!birthday || !validateBirthday(birthday)) {
        logSecurityEvent('REGISTRATION_FAILED', email, 'FAILURE', 'Invalid Age: Must be born in 2007 or earlier (18+)', req);
        return res.status(400).json({ success: false, message: 'Age Restriction: Birth year must be 2007 or earlier (18+ years old required).' });
      }

      if (!address || typeof address !== 'string' || address.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'Address is required and must be at least 3 characters.' });
      }

      if (!mobilePhone || !validateMobilePhone(mobilePhone)) {
        logSecurityEvent('REGISTRATION_FAILED', email, 'FAILURE', 'Invalid Mobile Phone format', req);
        return res.status(400).json({ success: false, message: 'Invalid phone number. Enter (+63) with 13 characters (e.g. +639123456789) or (09) with 11 digits (e.g. 09123456789).' });
      }

      const validAccessTypes = ['SUPER_ADMIN', 'ADMIN', 'USER'];
      if (!accessType || !validAccessTypes.includes(accessType)) {
        return res.status(400).json({ success: false, message: 'Invalid Access Type selected.' });
      }

      if (accessType === 'ADMIN' && (!accessTypePassword || accessTypePassword !== '1234567890')) {
        logSecurityEvent('REGISTRATION_ROLE_AUTH_FAILED', email, 'FAILURE', 'Invalid or missing Admin role passcode', req);
        return res.status(403).json({ success: false, message: 'Invalid Access Type Password for ADMIN role.' });
      }

      if (accessType === 'SUPER_ADMIN' && (!accessTypePassword || accessTypePassword !== '24681012141620')) {
        logSecurityEvent('REGISTRATION_ROLE_AUTH_FAILED', email, 'FAILURE', 'Invalid or missing Super Admin role passcode', req);
        return res.status(403).json({ success: false, message: 'Invalid Access Type Password for SUPER_ADMIN role.' });
      }

      if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'A valid email address is required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      if (state.usersDatabase.has(normalizedEmail)) {
        logSecurityEvent('REGISTRATION_DUPLICATE_EMAIL', normalizedEmail, 'FAILURE', 'Attempted to register with already existing email', req);
        return res.status(409).json({ success: false, message: 'Duplicate Email Error: This email address is already registered in the system.' });
      }

      if (otp) {
        const otpRecord = state.otpStore.get(normalizedEmail);
        if (!otpRecord) {
          return res.status(400).json({ success: false, message: 'OTP verification code expired or not found. Please request a new code.' });
        }
        if (Date.now() > otpRecord.expiresAt) {
          state.otpStore.delete(normalizedEmail);
          return res.status(400).json({ success: false, message: 'The OTP verification code has expired. Please request a fresh one.' });
        }
        if (otpRecord.otp !== String(otp).trim() && !otpRecord.verified) {
          return res.status(400).json({ success: false, message: 'Invalid OTP verification code. Please check your email and try again.' });
        }
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Password and Confirm Password do not match.' });
      }

      const pwdEval = validatePasswordStrength(password);
      if (!pwdEval.valid) {
        return res.status(400).json({ success: false, message: pwdEval.errors.join(' ') });
      }

      const passwordHash = bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS);
      const newUser = {
        id: state.nextId++,
        fullName: fullName.trim(),
        birthday,
        address: address.trim(),
        email: normalizedEmail,
        mobilePhone,
        accessType,
        passwordHash,
        failedAttempts: 0,
        isBlocked: false,
        createdAt: new Date().toISOString(),
      };

      state.usersDatabase.set(normalizedEmail, newUser);
      state.otpStore.delete(normalizedEmail);
      logSecurityEvent('USER_REGISTERED', normalizedEmail, 'SUCCESS', `Registered as ${accessType}`, req);

      return res.status(201).json({ success: true, message: 'Account Created! Please log in.', user: toPublicUser(newUser) });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = state.usersDatabase.get(normalizedEmail);
      if (!user) {
        logSecurityEvent('LOGIN_FAILED', normalizedEmail, 'FAILURE', 'User not found', req);
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (user.isBlocked) {
        logSecurityEvent('LOGIN_BLOCKED_ATTEMPT', normalizedEmail, 'BLOCKED', 'Attempted login on blocked account', req);
        return res.status(403).json({ success: false, isBlocked: true, message: 'Account Blocked: Maximum failed attempts (3) exceeded. Contact Super Admin to unblock.' });
      }

      const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!passwordMatch) {
        user.failedAttempts += 1;
        const attemptsLeft = Math.max(0, 3 - user.failedAttempts);

        if (user.failedAttempts >= 3) {
          user.isBlocked = true;
          logSecurityEvent('ACCOUNT_BLOCKED', normalizedEmail, 'BLOCKED', 'Account blocked after 3 consecutive failed login attempts', req);
          return res.status(403).json({ success: false, isBlocked: true, failedAttempts: user.failedAttempts, message: 'Account Blocked: You have entered incorrect credentials 3 times. Your account is now blocked.' });
        }

        logSecurityEvent('LOGIN_FAILED', normalizedEmail, 'FAILURE', `Failed attempt ${user.failedAttempts}/3`, req);
        return res.status(401).json({ success: false, failedAttempts: user.failedAttempts, attemptsLeft, message: `Invalid email or password. Warning: ${attemptsLeft} attempt(s) remaining before account is blocked.` });
      }

      user.failedAttempts = 0;
      user.lastLogin = new Date().toISOString();
      const token = generateToken(user.email, user.accessType);
      logSecurityEvent('LOGIN_SUCCESS', normalizedEmail, 'SUCCESS', `Logged in with role: ${user.accessType}`, req);

      return res.json({ success: true, message: `Welcome back, ${user.fullName}!`, token, accessType: user.accessType, user: toPublicUser(user) });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (token && state.activeSessions.has(token)) {
      const session = state.activeSessions.get(token);
      logSecurityEvent('LOGOUT', session.email, 'SUCCESS', 'User session terminated', req);
      state.activeSessions.delete(token);
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    try {
      const { email, newPassword, confirmNewPassword } = req.body;
      if (!email || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ success: false, message: 'Email, new password, and confirmation are required.' });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ success: false, message: 'New password and confirmation do not match.' });
      }

      const pwdEval = validatePasswordStrength(newPassword);
      if (!pwdEval.valid) {
        return res.status(400).json({ success: false, message: pwdEval.errors.join(' ') });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = state.usersDatabase.get(normalizedEmail);
      if (!user) {
        logSecurityEvent('PASSWORD_RESET_FAILED', normalizedEmail, 'FAILURE', 'User email not found for reset', req);
        return res.status(404).json({ success: false, message: 'No account found with this email address.' });
      }

      user.passwordHash = bcrypt.hashSync(newPassword, BCRYPT_SALT_ROUNDS);
      user.isBlocked = false;
      user.failedAttempts = 0;
      logSecurityEvent('PASSWORD_RESET_SUCCESS', normalizedEmail, 'SUCCESS', 'Password updated successfully', req);

      return res.json({ success: true, message: 'Password reset successful! You can now log in with your new password.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Internal server error during password reset.' });
    }
  });

  app.post('/api/user/change-password', authenticateToken, (req, res) => {
    try {
      const session = req.userSession;
      const { currentPassword, newPassword, confirmNewPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ success: false, message: 'New passwords do not match.' });
      }

      const pwdEval = validatePasswordStrength(newPassword);
      if (!pwdEval.valid) {
        return res.status(400).json({ success: false, message: pwdEval.errors.join(' ') });
      }

      const user = state.usersDatabase.get(session.email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
        logSecurityEvent('CHANGE_PASSWORD_FAILED', session.email, 'FAILURE', 'Incorrect current password', req);
        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
      }

      user.passwordHash = bcrypt.hashSync(newPassword, BCRYPT_SALT_ROUNDS);
      logSecurityEvent('CHANGE_PASSWORD_SUCCESS', session.email, 'SUCCESS', 'Password changed securely', req);

      return res.json({ success: true, message: 'Password changed successfully.', user: toPublicUser(user) });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Internal server error changing password.' });
    }
  });

  app.get('/api/user/profile', authenticateToken, (req, res) => {
    const session = req.userSession;
    const user = state.usersDatabase.get(session.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: toPublicUser(user) });
  });

  app.get('/api/users', authenticateToken, (req, res) => {
    const session = req.userSession;
    if (session.accessType !== 'ADMIN' && session.accessType !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access Denied: Requires ADMIN or SUPER_ADMIN authority.' });
    }

    const allUsers = Array.from(state.usersDatabase.values()).map(toPublicUser);
    return res.json({ success: true, users: allUsers });
  });

  app.post('/api/users/:id/unblock', authenticateToken, (req, res) => {
    const session = req.userSession;
    if (session.accessType !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access Denied: Only SUPER_ADMIN can unblock accounts.' });
    }

    const targetId = parseInt(req.params.id, 10);
    const targetUser = Array.from(state.usersDatabase.values()).find((u) => u.id === targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    targetUser.isBlocked = false;
    targetUser.failedAttempts = 0;
    logSecurityEvent('USER_UNBLOCKED', targetUser.email, 'SUCCESS', `Account unblocked by Super Admin (${session.email})`, req);

    return res.json({ success: true, message: `Account for ${targetUser.fullName} (${targetUser.email}) unblocked successfully.`, user: toPublicUser(targetUser) });
  });

  app.post('/api/users/:id/role', authenticateToken, (req, res) => {
    const session = req.userSession;
    if (session.accessType !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access Denied: Only SUPER_ADMIN can modify user roles.' });
    }

    const targetId = parseInt(req.params.id, 10);
    const { newAccessType } = req.body;
    const validAccessTypes = ['SUPER_ADMIN', 'ADMIN', 'USER'];

    if (!validAccessTypes.includes(newAccessType)) {
      return res.status(400).json({ success: false, message: 'Invalid Access Type.' });
    }

    const targetUser = Array.from(state.usersDatabase.values()).find((u) => u.id === targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const oldRole = targetUser.accessType;
    targetUser.accessType = newAccessType;
    logSecurityEvent('ROLE_CHANGED', targetUser.email, 'SUCCESS', `Role changed from ${oldRole} to ${newAccessType} by ${session.email}`, req);

    return res.json({ success: true, message: `Role for ${targetUser.fullName} updated to ${newAccessType}.`, user: toPublicUser(targetUser) });
  });

  app.get('/api/audit-logs', authenticateToken, (req, res) => {
    const session = req.userSession;
    if (session.accessType !== 'ADMIN' && session.accessType !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access Denied: Requires elevated privileges.' });
    }
    return res.json({ success: true, logs: state.auditLogs });
  });

  app.post('/api/scan', authenticateToken, async (req, res) => {
    try {
      const { imageBase64, mimeType, fileName } = req.body || {};

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return res.status(400).json({ success: false, message: 'An image (base64) is required.' });
      }

      // Strip an optional data URL prefix: "data:image/jpeg;base64,....".
      const base64 = imageBase64.includes(',') ? imageBase64.split(',').pop() : imageBase64;

      const { configured, result, message } = await analyzePlantImage({
        imageBase64: base64,
        mimeType: mimeType || 'image/jpeg',
        fileName,
      });

      if (!configured) {
        // Lets the client fall back to its local botanical database.
        logSecurityEvent('PLANT_SCAN_FALLBACK', req.userSession.email, 'SUCCESS', 'Scan requested but no GEMINI_API_KEY configured', req);
        return res.status(200).json({ success: true, aiConfigured: false, message });
      }

      if (!result) {
        logSecurityEvent('PLANT_SCAN_PARSE_FAILED', req.userSession.email, 'FAILURE', message || 'Unparseable AI response', req);
        return res.status(502).json({ success: false, aiConfigured: true, message: message || 'AI analysis failed.' });
      }

      logSecurityEvent('PLANT_SCAN_ANALYZED', req.userSession.email, 'SUCCESS', `Identified: ${result.commonName}`, req);
      return res.json({ success: true, aiConfigured: true, result });
    } catch (error) {
      console.error('Scan error:', error);
      logSecurityEvent('PLANT_SCAN_ERROR', req.userSession?.email || 'unknown', 'FAILURE', error.message || 'Unexpected scan error', req);
      return res.status(500).json({ success: false, message: 'Plant analysis failed. Please try again.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeafDex Security App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
