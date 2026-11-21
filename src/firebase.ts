import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { LanguageMode, OnboardingPreferences, UserProfile } from './types';

// Single centralized Firebase initialization
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Startup connection check (verifies Firestore reachability)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

/**
 * Creates or updates users/{uid} after registration or sign-in.
 */
export async function syncUserProfileToFirestore(
  firebaseUser: FirebaseUser,
  preferredLanguage: LanguageMode = 'bilingual'
): Promise<UserProfile> {
  const uid = firebaseUser.uid;
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);
  const now = new Date().toISOString();

  let existingCreatedAt: string | null = null;
  let existingLanguage: LanguageMode | null = null;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if (typeof data.createdAt === 'string') existingCreatedAt = data.createdAt;
      if (
        data.preferredLanguage === 'english' ||
        data.preferredLanguage === 'tamil' ||
        data.preferredLanguage === 'bilingual'
      ) {
        existingLanguage = data.preferredLanguage;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  const email = (firebaseUser.email || `${uid}@firststep.local`).slice(0, 254);
  const displayName = (firebaseUser.displayName || '').trim().slice(0, 120);
  const createdAt = existingCreatedAt || now;
  const finalLanguage = existingLanguage || preferredLanguage;

  const profilePayload: Record<string, string> = {
    uid,
    email,
    preferredLanguage: finalLanguage,
    createdAt,
    updatedAt: now,
  };
  if (displayName) {
    profilePayload.displayName = displayName;
  }

  try {
    await setDoc(userRef, profilePayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }

  return {
    id: uid,
    email,
    displayName: displayName || undefined,
    createdAt,
  };
}

/**
 * Loads user preferences and onboarding completion status from Firestore.
 */
export async function loadUserPreferencesFromFirestore(
  uid: string
): Promise<OnboardingPreferences> {
  const prefsPath = `users/${uid}/preferences/default`;
  const onboardingPath = `users/${uid}/onboarding/status`;

  let prefsData: Record<string, unknown> | null = null;
  let onboardingData: Record<string, unknown> | null = null;

  try {
    const prefsSnap = await getDoc(doc(db, 'users', uid, 'preferences', 'default'));
    if (prefsSnap.exists()) {
      prefsData = prefsSnap.data();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, prefsPath);
  }

  try {
    const onboardingSnap = await getDoc(doc(db, 'users', uid, 'onboarding', 'status'));
    if (onboardingSnap.exists()) {
      onboardingData = onboardingSnap.data();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, onboardingPath);
  }

  const preferredLanguage =
    prefsData?.preferredLanguage === 'english' ||
    prefsData?.preferredLanguage === 'tamil' ||
    prefsData?.preferredLanguage === 'bilingual'
      ? (prefsData.preferredLanguage as LanguageMode)
      : 'bilingual';

  const preferredInteractionMode =
    prefsData?.preferredInteractionMode === 'typing' ||
    prefsData?.preferredInteractionMode === 'voice' ||
    prefsData?.preferredInteractionMode === 'both' ||
    prefsData?.preferredInteractionMode === 'not_sure'
      ? prefsData.preferredInteractionMode
      : 'not_sure';

  return {
    user_id: uid,
    selected_goals: Array.isArray(prefsData?.selectedGoals)
      ? (prefsData.selectedGoals as string[]).slice(0, 12)
      : [],
    preferred_support_methods: Array.isArray(prefsData?.preferredSupportMethods)
      ? (prefsData.preferredSupportMethods as string[]).slice(0, 10)
      : [],
    preferred_language: preferredLanguage,
    preferred_interaction_mode: preferredInteractionMode,
    onboarding_completed: Boolean(onboardingData?.completed),
    updated_at:
      typeof prefsData?.updatedAt === 'string'
        ? prefsData.updatedAt
        : new Date().toISOString(),
  };
}

/**
 * Persists user preferences to users/{uid}/preferences/default
 * and onboarding status to users/{uid}/onboarding/status.
 */
export async function saveUserPreferencesToFirestore(
  uid: string,
  prefs: OnboardingPreferences
): Promise<void> {
  const now = new Date().toISOString();
  const prefsPath = `users/${uid}/preferences/default`;
  const onboardingPath = `users/${uid}/onboarding/status`;
  const userPath = `users/${uid}`;

  try {
    await setDoc(doc(db, 'users', uid, 'preferences', 'default'), {
      uid,
      preferredLanguage: prefs.preferred_language,
      preferredInteractionMode: prefs.preferred_interaction_mode,
      selectedGoals: (prefs.selected_goals || []).slice(0, 12),
      preferredSupportMethods: (prefs.preferred_support_methods || []).slice(0, 10),
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, prefsPath);
  }

  try {
    await setDoc(doc(db, 'users', uid, 'onboarding', 'status'), {
      uid,
      completed: Boolean(prefs.onboarding_completed),
      completedAt: prefs.onboarding_completed ? now : '',
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, onboardingPath);
  }

  // Keep preferredLanguage and updatedAt in sync on users/{uid}
  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        preferredLanguage: prefs.preferred_language,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}
