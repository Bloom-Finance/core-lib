import jwt from 'jsonwebtoken'
import { doc, getDoc } from 'firebase/firestore'
import { firebaseManager } from './firebase.services'
export const tokenDecode = (token: string): SessionUser => {
    return jwt.decode(token) as SessionUser
}
export const encodeToken = (data: SessionUser): string => {
    return jwt.sign(data, process.env.SECRET_KEY as string)
}
export const setToken = async (token: string) => {
    localStorage.setItem('bloom:token', token)
}
export const getToken = (): string => {
    return localStorage.getItem('bloom:token') as string
}
export const removeToken = () => {
    localStorage.removeItem('bloom:token')
}
export const userAlreadyExist = async (id: string) => {
    const docRef = doc(firebaseManager.getDB(), 'users', id)
    const docSnap = await getDoc(docRef)
    return docSnap.exists()
}
