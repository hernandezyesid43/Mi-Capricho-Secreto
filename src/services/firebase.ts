import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore,
  doc, 
  getDocFromServer,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, Order, StoredUser } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore targeting configured databaseId with forced long-polling for iframe/proxy stability
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, databaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Critical Constraint: Test connection to Firestore on boot with graceful retry
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.warn("Firestore initializing connection to backend; operating with local cache until online.");
    } else {
      console.warn("Firestore connection check:", error);
    }
    return false;
  }
}

// Test connection to Firestore on boot once document is fully ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    testConnection().catch(() => {});
  } else {
    window.addEventListener('load', () => {
      testConnection().catch(() => {});
    }, { once: true });
  }
}

// Master Admin Email
export const MASTER_ADMIN_EMAIL = 'hernandez.yesid43@gmail.com';

/**
 * Sign in using Google Sign-In with Firebase Auth
 */
export async function signInWithGoogle(): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    const userProfile = await syncUserProfileInFirestore(fbUser);
    return { success: true, user: userProfile };
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    return { 
      success: false, 
      error: err?.message || 'Error al iniciar sesión con Google.' 
    };
  }
}

/**
 * Sign in with email and password via Firebase Auth
 */
export async function signInWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const userProfile = await syncUserProfileInFirestore(result.user);
    return { success: true, user: userProfile };
  } catch (err: any) {
    return { 
      success: false, 
      error: err.code === 'auth/invalid-credential' 
        ? 'Correo o contraseña incorrectos.' 
        : (err.message || 'Error al autenticar usuario.') 
    };
  }
}

/**
 * Register with email and password via Firebase Auth
 */
export async function registerWithEmail(data: {
  nombre: string;
  email: string;
  pass: string;
  telefono: string;
  direccion?: string;
  barrio?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, data.email.trim(), data.pass);
    const fbUser = result.user;

    const profile: UserProfile = {
      id: fbUser.uid,
      nombre: data.nombre.trim(),
      email: data.email.trim().toLowerCase(),
      telefono: data.telefono.trim(),
      direccion_envio: data.direccion?.trim() || undefined,
      barrio_localidad: data.barrio?.trim() || undefined,
      rol: data.email.trim().toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'cliente',
      created_at: new Date().toISOString(),
      activo: true
    };

    const userDocRef = doc(db, 'users', fbUser.uid);
    await setDoc(userDocRef, {
      ...profile,
      updated_at: new Date().toISOString()
    });

    return { success: true, user: profile };
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      return { success: false, error: 'Este correo electrónico ya está registrado.' };
    }
    return { success: false, error: err.message || 'Error al registrar cuenta.' };
  }
}

/**
 * Sync or create user profile in Firestore
 */
export async function syncUserProfileInFirestore(fbUser: FirebaseUser): Promise<UserProfile> {
  const path = `users/${fbUser.uid}`;
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);

    const isMasterAdmin = (fbUser.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase());

    if (snap.exists()) {
      const data = snap.data();
      const role = isMasterAdmin ? 'admin' : (data.rol || 'cliente');
      
      const profile: UserProfile = {
        id: fbUser.uid,
        nombre: data.nombre || fbUser.displayName || 'Cliente',
        email: fbUser.email || data.email || '',
        telefono: data.telefono || fbUser.phoneNumber || '',
        direccion_envio: data.direccion_envio,
        barrio_localidad: data.barrio_localidad,
        notas: data.notas,
        rol: role,
        created_at: data.created_at || new Date().toISOString(),
        activo: data.activo !== false
      };

      // Ensure master admin has admin document
      if (isMasterAdmin) {
        await setDoc(doc(db, 'admins', fbUser.uid), {
          email: fbUser.email,
          nombre: profile.nombre,
          created_at: new Date().toISOString()
        }, { merge: true });
      }

      return profile;
    } else {
      // Create new profile
      const newProfile: UserProfile = {
        id: fbUser.uid,
        nombre: fbUser.displayName || fbUser.email?.split('@')[0] || 'Cliente',
        email: fbUser.email || '',
        telefono: fbUser.phoneNumber || '',
        rol: isMasterAdmin ? 'admin' : 'cliente',
        created_at: new Date().toISOString(),
        activo: true
      };

      await setDoc(userDocRef, {
        ...newProfile,
        updated_at: new Date().toISOString()
      });

      if (isMasterAdmin) {
        await setDoc(doc(db, 'admins', fbUser.uid), {
          email: fbUser.email,
          nombre: newProfile.nombre,
          created_at: new Date().toISOString()
        });
      }

      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    // fallback
    return {
      id: fbUser.uid,
      nombre: fbUser.displayName || 'Usuario',
      email: fbUser.email || '',
      telefono: '',
      rol: fbUser.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'cliente',
      activo: true
    };
  }
}

/**
 * Updates a user profile in Firestore
 */
export async function updateFirestoreUserProfile(
  userId: string, 
  data: Partial<UserProfile>
): Promise<boolean> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...data,
      updated_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

/**
 * Saves a new order into Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<boolean> {
  const path = `orders/${order.codigo_orden}`;
  try {
    const orderDocRef = doc(db, 'orders', order.codigo_orden);
    await setDoc(orderDocRef, {
      ...order,
      created_at: order.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return false;
  }
}

/**
 * Signs out from Firebase
 */
export async function logOutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Listens for Firebase Auth state changes and returns synced UserProfile
 */
export function subscribeToAuth(callback: (user: UserProfile | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const profile = await syncUserProfileInFirestore(fbUser);
        callback(profile);
      } catch (err) {
        console.warn('Error syncing auth profile:', err);
      }
    } else {
      callback(null);
    }
  });
}

