import {
  doc, collection, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy, onSnapshot,
  serverTimestamp, increment, runTransaction, limit, getCountFromServer,
} from 'firebase/firestore'
import { db } from './config'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://printzo.onrender.com/'

// ─── SHOPS ──────────────────────────────────────────────────────────────────

export const createShop = async (ownerId, shopData) => {
  const ref = await addDoc(collection(db, 'shops'), {
    ownerId,
    ...shopData,
    status: 'active',
    rating: 0,
    totalJobs: 0,
    createdAt: serverTimestamp(),
  })
  // Store shopId in owner's user doc
  await updateDoc(doc(db, 'users', ownerId), { shopId: ref.id })
  return ref.id
}

export const updateShop = async (shopId, data) => {
  await updateDoc(doc(db, 'shops', shopId), { ...data, updatedAt: serverTimestamp() })
}

export const getShop = async (shopId) => {
  const snap = await getDoc(doc(db, 'shops', shopId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getShopByOwner = async (ownerId) => {
  const q = query(collection(db, 'shops'), where('ownerId', '==', ownerId))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export const getAllShops = async () => {
  const snap = await getDocs(collection(db, 'shops'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── PRINTERS ───────────────────────────────────────────────────────────────

export const addPrinter = async (shopId, printerData) => {
  const ref = await addDoc(collection(db, 'printers'), {
    shopId,
    ...printerData,
    status: 'online',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updatePrinter = async (printerId, data) => {
  await updateDoc(doc(db, 'printers', printerId), data)
}

export const deletePrinter = async (printerId) => {
  await deleteDoc(doc(db, 'printers', printerId))
}

export const getPrintersByShop = async (shopId) => {
  const q = query(collection(db, 'printers'), where('shopId', '==', shopId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── PRINT JOBS ─────────────────────────────────────────────────────────────

export const createPrintJob = async (jobData) => {
  // Auto-increment token number for the shop
  const shopRef = doc(db, 'shops', jobData.shopId)
  let tokenNumber

  await runTransaction(db, async (tx) => {
    const shopSnap = await tx.get(shopRef)
    const current = shopSnap.data()?.tokenCounter || 0
    tokenNumber = current + 1
    tx.update(shopRef, { tokenCounter: tokenNumber, totalJobs: increment(1) })
  })

  const ref = await addDoc(collection(db, 'printJobs'), {
    ...jobData,
    tokenNumber,
    status: 'pending', // pending | printing | completed | cancelled
    createdAt: serverTimestamp(),
  })

  // 🚀 NOTIFY BACKEND: Send job info to your Render backend
  try {
    fetch(`${API_BASE_URL}api/print-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: ref.id, tokenNumber, ...jobData })
    }).catch(err => console.error("Backend notification failed:", err))
  } catch (e) {
    console.warn("Backend call failed", e)
  }

  return { jobId: ref.id, tokenNumber }
}

export const updatePrintJob = async (jobId, data) => {
  await updateDoc(doc(db, 'printJobs', jobId), { ...data, updatedAt: serverTimestamp() })
}

export const getPrintJob = async (jobId) => {
  const snap = await getDoc(doc(db, 'printJobs', jobId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const subscribeToShopJobs = (shopId, callback) => {
  const q = query(
    collection(db, 'printJobs'),
    where('shopId', '==', shopId),
    where('status', 'in', ['pending', 'printing']),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snap) => {
    const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    
    // Auto-sort to float "Instant Print" VIP jobs to the very top of the queue!
    jobs.sort((a, b) => {
      if (a.isInstant && !b.isInstant) return -1
      if (!a.isInstant && b.isInstant) return 1
      return 0
    })
    
    callback(jobs)
  })
}

export const getShopJobHistory = async (shopId, limitCount = 50) => {
  const q = query(
    collection(db, 'printJobs'),
    where('shopId', '==', shopId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getCustomerJobs = async (customerId) => {
  const q = query(
    collection(db, 'printJobs'),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc'),
    limit(20)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const subscribeToJob = (jobId, callback) => {
  return onSnapshot(doc(db, 'printJobs', jobId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })
}

// ─── WALLET ─────────────────────────────────────────────────────────────────

export const getWalletBalance = async (userId) => {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.data()?.wallet || 0
}

export const topUpWallet = async (userId, amount) => {
  await updateDoc(doc(db, 'users', userId), { wallet: increment(amount) })
  await addDoc(collection(db, 'walletTransactions'), {
    userId, type: 'topup', amount, createdAt: serverTimestamp(),
  })
}

export const deductWallet = async (userId, amount) => {
  const userRef = doc(db, 'users', userId)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef)
    const balance = snap.data()?.wallet || 0
    if (balance < amount) throw new Error('Insufficient wallet balance')
    tx.update(userRef, { wallet: increment(-amount) })
  })
  await addDoc(collection(db, 'walletTransactions'), {
    userId, type: 'debit', amount, createdAt: serverTimestamp(),
  })
}

// ─── SUBSCRIPTIONS ──────────────────────────────────────────────────────────

export const activateSubscription = async (userId) => {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 30)
  await updateDoc(doc(db, 'users', userId), {
    subscription: { active: true, plan: 'ai_docs', expiresAt: expiry },
  })
}

export const getUserData = async (userId) => {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const subscribeToUserData = (userId, callback) => {
  return onSnapshot(doc(db, 'users', userId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })
}

// ─── GLOBAL STATS ───────────────────────────────────────────────────────────

export const getGlobalStats = async () => {
  try {
    const jobsSnap = await getCountFromServer(collection(db, 'printJobs'))
    const shopsSnap = await getCountFromServer(collection(db, 'shops'))
    
    return {
      docsPrinted: 12000 + jobsSnap.data().count, // Real + Base Marketing Value
      shopsRegistered: 340 + shopsSnap.data().count, // Real + Base Marketing Value
      dataLeaks: 0
    }
  } catch (error) {
    console.error("Error fetching global stats:", error)
    return { docsPrinted: 12000, shopsRegistered: 340, dataLeaks: 0 }
  }
}
