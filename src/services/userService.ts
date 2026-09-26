import { UserProfile, StoredUser, Order } from '../types';
import { sha256Hex, sanitizeText, verifyAdminCredentialsSecure, resetLockout, recordFailedAttempt, checkLockoutStatus } from './securityService';

const USERS_STORAGE_KEY = 'capricho_users_v2';

/**
 * Generates a random cryptographic salt for irreversible password hashing
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes salted SHA-256 hash
 */
export async function computeSaltedHash(password: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}__${password}__capricho_sec_2026`);
}

// Initial seed accounts (linked to existing demo orders)
const INITIAL_USERS: StoredUser[] = [
  {
    id: 'usr_admin_master',
    nombre: 'Administración Yesid',
    email: 'hernandez.yesid43@gmail.com',
    telefono: '3142748881',
    direccion_envio: 'Sede Principal Mi Capricho Secreto, Bogotá',
    barrio_localidad: 'Chapinero Alto',
    rol: 'admin',
    password_hash: 'ecf9596097404c16398a3d47b4ea1b8e1910de3f7525ac68070113a2248f25cb',
    salt: 'salt_master_yesid',
    created_at: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    activo: true,
    notas: 'Administrador Maestro del Sistema & Obrador'
  },
  {
    id: 'usr_camilo_88',
    nombre: 'Camilo Rincón',
    email: 'camilo.rincon@gmail.com',
    telefono: '3158902341',
    direccion_envio: 'Calle 127 # 15-45, Apto 402',
    barrio_localidad: 'Usaquén',
    rol: 'cliente',
    password_hash: '2c5a714088894df29c2ec173295c5a01bc15528ffad03126f56860472481eeb5',
    salt: 'salt_camilo_88',
    created_at: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    activo: true,
    notas: 'Prefiere yogur griego tradicional sin azúcar añadida.'
  },
  {
    id: 'usr_mariana_42',
    nombre: 'Mariana Duarte',
    email: 'mariana.duarte@hotmail.com',
    telefono: '3204567890',
    direccion_envio: 'Carrera 7 # 67-20, Torre B 801',
    barrio_localidad: 'Chapinero Alto',
    rol: 'cliente',
    password_hash: '3a88fb08e64c29759d997cfd9a8c6a2c2627cb94e9f50e7a2dfb42b1029c5462',
    salt: 'salt_mariana_42',
    created_at: new Date(Date.now() - 9 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    activo: true,
    notas: 'Cliente recurrente de yogur con pistacho y miel.'
  },
  {
    id: 'usr_felipe_19',
    nombre: 'Felipe Santamaría',
    email: 'felipe.santamaria@outlook.com',
    telefono: '3109871234',
    direccion_envio: 'Calle 85 # 11-53',
    barrio_localidad: 'Zona Rosa',
    rol: 'cliente',
    password_hash: '8f00b204646ecf137eb1317189196b0bc8c6978438a2e57ad4b8eb257b44358a',
    salt: 'salt_felipe_19',
    created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    activo: true,
    notas: 'Amante de repostería y parfait artesanal.'
  }
];

/**
 * Retrieves all stored accounts from repository
 */
export function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading stored users:', err);
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
}

/**
 * Saves stored accounts to repository
 */
export function saveStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving stored users:', err);
  }
}

/**
 * Sanitizes a StoredUser into a public UserProfile (strips password hash & salt)
 */
export function sanitizeUserProfile(user: StoredUser): UserProfile {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono,
    direccion_envio: user.direccion_envio,
    barrio_localidad: user.barrio_localidad,
    notas: user.notas,
    rol: user.rol,
    created_at: user.created_at,
    activo: user.activo
  };
}

/**
 * Registers a new customer securely
 */
export async function registerUserAccount(data: {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  direccion_envio?: string;
  barrio_localidad?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanNombre = sanitizeText(data.nombre).trim();
  const cleanEmail = sanitizeText(data.email).trim().toLowerCase();
  const cleanTel = sanitizeText(data.telefono).trim();
  const cleanDir = data.direccion_envio ? sanitizeText(data.direccion_envio).trim() : '';
  const cleanBarrio = data.barrio_localidad ? sanitizeText(data.barrio_localidad).trim() : '';
  const cleanPass = data.password.trim();

  // Basic validation
  if (!cleanNombre || cleanNombre.length < 2) {
    return { success: false, error: 'Por favor ingresa un nombre válido.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Por favor ingresa un correo electrónico válido.' };
  }
  if (!cleanTel || cleanTel.length < 7) {
    return { success: false, error: 'Por favor ingresa un teléfono celular válido en Colombia.' };
  }
  if (!cleanPass || cleanPass.length < 6) {
    return { success: false, error: 'La contraseña debe tener como mínimo 6 caracteres.' };
  }

  const users = getStoredUsers();

  // Check uniqueness of email
  const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return { success: false, error: 'Este correo electrónico ya se encuentra registrado. Intenta iniciar sesión.' };
  }

  // Salt & Hash password
  const salt = generateSalt();
  const password_hash = await computeSaltedHash(cleanPass, salt);

  const newUser: StoredUser = {
    id: `usr_cli_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    nombre: cleanNombre,
    email: cleanEmail,
    telefono: cleanTel,
    direccion_envio: cleanDir || undefined,
    barrio_localidad: cleanBarrio || undefined,
    rol: 'cliente',
    password_hash,
    salt,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activo: true
  };

  const updatedUsers = [newUser, ...users];
  saveStoredUsers(updatedUsers);

  return {
    success: true,
    user: sanitizeUserProfile(newUser)
  };
}

/**
 * Authenticates a user (checking both stored users and master admin hash)
 */
export async function authenticateUser(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = sanitizeText(email).trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Por favor ingresa tu correo y contraseña.' };
  }

  const lockout = checkLockoutStatus();
  if (lockout.isLocked) {
    return {
      success: false,
      error: `Acceso restringido temporalmente por seguridad. Espera ${lockout.remainingSeconds} segundos.`
    };
  }

  // 1. Check if it matches master admin cryptographic verification
  const isMasterAdmin = await verifyAdminCredentialsSecure(cleanEmail, cleanPass);
  if (isMasterAdmin) {
    const users = getStoredUsers();
    let adminStored = users.find(u => u.rol === 'admin' && u.email.toLowerCase() === cleanEmail);
    if (!adminStored) {
      adminStored = users.find(u => u.id === 'usr_admin_master') || INITIAL_USERS[0];
    }
    resetLockout();
    return {
      success: true,
      user: sanitizeUserProfile(adminStored)
    };
  }

  // 2. Check in stored users repository
  const users = getStoredUsers();
  const candidate = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (candidate) {
    if (!candidate.activo) {
      return { success: false, error: 'Esta cuenta ha sido desactivada. Por favor contacta al administrador.' };
    }

    const testHash = await computeSaltedHash(cleanPass, candidate.salt);
    if (testHash === candidate.password_hash) {
      resetLockout();
      return {
        success: true,
        user: sanitizeUserProfile(candidate)
      };
    }
  }

  // Record failed attempt
  const failure = recordFailedAttempt();
  if (failure.isLocked) {
    return {
      success: false,
      error: `Demasiados intentos fallidos. Acceso bloqueado por ${failure.remainingSeconds} segundos.`
    };
  }

  return {
    success: false,
    error: 'Correo o contraseña incorrectos. Por favor verifica tus datos.'
  };
}

/**
 * Updates a user's own profile data
 */
export function updateUserProfile(
  userId: string,
  data: Partial<Pick<UserProfile, 'nombre' | 'telefono' | 'direccion_envio' | 'barrio_localidad' | 'notas'>>
): { success: boolean; user?: UserProfile; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) {
    return { success: false, error: 'Usuario no encontrado.' };
  }

  const current = users[index];
  const updatedUser: StoredUser = {
    ...current,
    nombre: data.nombre !== undefined ? sanitizeText(data.nombre).trim() : current.nombre,
    telefono: data.telefono !== undefined ? sanitizeText(data.telefono).trim() : current.telefono,
    direccion_envio: data.direccion_envio !== undefined ? sanitizeText(data.direccion_envio).trim() : current.direccion_envio,
    barrio_localidad: data.barrio_localidad !== undefined ? sanitizeText(data.barrio_localidad).trim() : current.barrio_localidad,
    notas: data.notas !== undefined ? sanitizeText(data.notas).trim() : current.notas,
    updated_at: new Date().toISOString()
  };

  users[index] = updatedUser;
  saveStoredUsers(users);

  return {
    success: true,
    user: sanitizeUserProfile(updatedUser)
  };
}

/**
 * Admin: Update any user record
 */
export function adminUpdateUser(
  targetUserId: string,
  data: Partial<Pick<StoredUser, 'nombre' | 'email' | 'telefono' | 'direccion_envio' | 'barrio_localidad' | 'rol' | 'activo' | 'notas'>>
): { success: boolean; user?: StoredUser; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === targetUserId);

  if (index === -1) {
    return { success: false, error: 'Cuenta no encontrada.' };
  }

  const current = users[index];
  const updatedUser: StoredUser = {
    ...current,
    nombre: data.nombre !== undefined ? sanitizeText(data.nombre).trim() : current.nombre,
    email: data.email !== undefined ? sanitizeText(data.email).trim().toLowerCase() : current.email,
    telefono: data.telefono !== undefined ? sanitizeText(data.telefono).trim() : current.telefono,
    direccion_envio: data.direccion_envio !== undefined ? sanitizeText(data.direccion_envio).trim() : current.direccion_envio,
    barrio_localidad: data.barrio_localidad !== undefined ? sanitizeText(data.barrio_localidad).trim() : current.barrio_localidad,
    rol: data.rol !== undefined ? data.rol : current.rol,
    activo: data.activo !== undefined ? data.activo : current.activo,
    notas: data.notas !== undefined ? sanitizeText(data.notas).trim() : current.notas,
    updated_at: new Date().toISOString()
  };

  users[index] = updatedUser;
  saveStoredUsers(users);

  return {
    success: true,
    user: updatedUser
  };
}

/**
 * Admin: Creates a new Administrator account
 */
export async function createAdminUser(data: {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  notas?: string;
}): Promise<{ success: boolean; user?: StoredUser; error?: string }> {
  const cleanNombre = sanitizeText(data.nombre).trim();
  const cleanEmail = sanitizeText(data.email).trim().toLowerCase();
  const cleanTel = sanitizeText(data.telefono).trim();
  const cleanPass = data.password.trim();

  if (!cleanNombre || cleanNombre.length < 2) {
    return { success: false, error: 'Ingresa un nombre para el administrador.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Ingresa un correo electrónico corporativo o personal válido.' };
  }
  if (!cleanTel || cleanTel.length < 7) {
    return { success: false, error: 'Ingresa un teléfono celular de contacto.' };
  }
  if (!cleanPass || cleanPass.length < 6) {
    return { success: false, error: 'La contraseña de administrador debe tener al menos 6 caracteres.' };
  }

  const users = getStoredUsers();
  const exists = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (exists) {
    return { success: false, error: 'Ya existe una cuenta con este correo electrónico.' };
  }

  const salt = generateSalt();
  const password_hash = await computeSaltedHash(cleanPass, salt);

  const newAdmin: StoredUser = {
    id: `adm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    nombre: cleanNombre,
    email: cleanEmail,
    telefono: cleanTel,
    direccion_envio: 'Sede Cocina Mi Capricho Secreto',
    barrio_localidad: 'Bogotá',
    rol: 'admin',
    password_hash,
    salt,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activo: true,
    notas: data.notas ? sanitizeText(data.notas).trim() : 'Administrador de Cocina & Gestión'
  };

  const updatedUsers = [newAdmin, ...users];
  saveStoredUsers(updatedUsers);

  return {
    success: true,
    user: newAdmin
  };
}

/**
 * Retrieves orders placed by a specific user (matched by usuario_id, email or phone)
 */
export function getUserOrders(user: UserProfile, orders: Order[]): Order[] {
  if (!user) return [];
  const userEmail = user.email.toLowerCase();
  const userTel = user.telefono.replace(/\D/g, '');

  return orders.filter(order => {
    if (order.usuario_id === user.id) return true;
    if (order.cliente_telefono && order.cliente_telefono.replace(/\D/g, '') === userTel && userTel.length > 6) return true;
    return false;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
