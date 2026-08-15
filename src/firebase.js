import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAlXWjQ42KYMMFfsMjr9NK0Uhc5u4ZImCA',
  authDomain: 'bambang-s-website.firebaseapp.com',
  projectId: 'bambang-s-website',
  storageBucket: 'bambang-s-website.firebasestorage.app',
  messagingSenderId: '1060447331957',
  appId: '1:1060447331957:web:052c6c300af41bc81bba3c',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
