import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider, db } from './config'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

// Create user document in Firestore after signup
const createUserDoc = async (uid, data) => {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    await setDoc(userRef, {
      ...data,
      wallet: 0,
      createdAt: serverTimestamp(),
    })
  }
  return userRef
}

export const signUpWithEmail = async (email, password, name, role) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  await createUserDoc(cred.user.uid, { name, email, role })
  return cred.user
}

export const signInWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  // Auto-repair profile if it was never created (prevents getting stuck on login)
  await createUserDoc(cred.user.uid, {
    name: cred.user.displayName || 'User',
    email: cred.user.email,
    role: 'customer', // Default to customer if missing
  })
  return cred.user
}

export const signInWithGoogle = async (role) => {
  const cred = await signInWithPopup(auth, googleProvider)
  const userRef = doc(db, 'users', cred.user.uid)
  const snap = await getDoc(userRef)
  
  // Only create user doc and set role IF they are new!
  if (!snap.exists()) {
    await setDoc(userRef, {
      name: cred.user.displayName,
      email: cred.user.email,
      role: role || 'customer',
      photoURL: cred.user.photoURL,
      wallet: 0,
      createdAt: serverTimestamp(),
    })
  }
  return cred.user
}

export const logout = () => signOut(auth)

export const getUserDoc = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
