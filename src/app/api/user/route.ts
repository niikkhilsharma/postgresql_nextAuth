import { NextResponse } from 'next/server'

import prisma from '@/lib/db'
import { hash } from 'bcrypt'
import { z } from 'zod'

const userSchema = z.object({
	email: z.string().email({ message: 'Invalid email' }),
	username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
	password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
})

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { email, username, password } = userSchema.parse(body)

		//Checking existing user by email
		const existingUserByEmail = await prisma?.user.findUnique({
			where: { email: email },
		})
		if (existingUserByEmail)
			return NextResponse.json(
				{ user: null, message: 'User with this email already exist' },
				{ status: 409 }
			)

		//Checking existing user by username
		const existingUserByUsername = await prisma?.user.findUnique({
			where: { username: username },
		})
		if (existingUserByUsername)
			return NextResponse.json(
				{ user: null, message: 'user with this username already exist' },
				{ status: 409 }
			)

		//Creating new user
		const hashedPassword = await hash(password, 10)
		const newUser = await prisma?.user.create({
			data: {
				email,
				username,
				password: hashedPassword,
			},
		})
		const { password: newUserPassword, ...rest } = newUser
		return NextResponse.json({ user: rest, message: 'User created' }, { status: 201 })
	} catch (error) {
		console.log(error)
		return NextResponse.json({ user: null, message: 'Something went wrong!' }, { status: 500 })
	}
}
