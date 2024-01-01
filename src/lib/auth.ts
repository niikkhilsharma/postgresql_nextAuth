import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'

import bcrypt from 'bcrypt'

import prisma from './db'
import { error } from 'console'

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/signin',
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'email', type: 'email', placeholder: 'jsmith@gmail.com' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials, req) {
				if (!credentials?.email || !credentials?.password) return null

				const existingUser = await prisma?.user.findUnique({
					where: { email: credentials.email },
				})
				if (!existingUser) return null

				if (existingUser.password) {
					const passwordMatch = await bcrypt.compare(credentials.password, existingUser.password)
					if (!passwordMatch) return null
				} else {
					throw new Error('No user Found With Email Please Sign Up!')
				}

				return {
					id: `${existingUser.id}`,
					email: existingUser.email,
					username: existingUser.username,
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				return {
					...token,
					username: user.username,
				}
			}
			return token
		},
		async session({ session, token }) {
			return {
				...session,
				user: {
					...session.user,
					username: token.username,
				},
			}
			// the below code is the same as the above code but since the youtuber has used typescript, so he has formatted the return type differently and so we have to use the above code in order to avoid typescript errors and if we use the below code it will work fine but we will get typescript errors. Both code are just the same in the above code he has destructured the session object and in the below code he has not destructured the session object.

			// session.user.username = token.username
			// return session
		},
	},
}
