/* eslint-disable @typescript-eslint/no-unused-vars */
import { customAlphabet } from 'nanoid'
import { firebaseManager } from './firebase.services'
import {
    setDoc,
    doc,
    query,
    where,
    collection,
    getDocs
} from 'firebase/firestore'
import { merchantService } from './merchant.service'

interface IUsersService {
    createUserFromGoogle(data: {
        displayName: string
        email: string
        associatedMerchant: string
    }): void
    searchUserByEmail(email: string): Promise<{
        isUserRegistered: boolean
    }>
}
class UserService implements IUsersService {
    async searchUserByEmail(email: string): Promise<{
        isUserRegistered: boolean
        user?: User
    }> {
        const docRef = collection(firebaseManager.getDB(), 'users')
        const q = query(docRef, where('email', '==', email))
        const querySnapshot = await getDocs(q)
        const users: any[] = []
        querySnapshot.forEach(doc => {
            users.push(doc.data())
        })
        if (users.length === 0) {
            return {
                isUserRegistered: false
            }
        } else {
            return {
                isUserRegistered: true,
                user: users[0]
            }
        }
    }
    /**
     * It creates a new user in the database with the given data
     * @param data - { displayName: string; email: string; associatedMerchant: string }
     */
    async createUserFromGoogle(data: {
        displayName: string
        email: string
        associatedMerchant: string
    }): Promise<void> {
        const nanoid = customAlphabet(
            '1234567890abcdefghijklmnopqrstuvwxyz',
            10
        )()
        const userToSave: User = {
            id: nanoid,
            email: data.email,
            full_name: data.displayName,
            merchants: [
                {
                    merchant: data.associatedMerchant
                }
            ],
            method: 'google'
        }
        await setDoc(doc(firebaseManager.getDB(), 'users', userToSave.id), {
            ...userToSave
        })
        await merchantService.addNewEmployee(
            data.associatedMerchant,
            nanoid,
            'user'
        )
    }
}

export const userService = new UserService()
