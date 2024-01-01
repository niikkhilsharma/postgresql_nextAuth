'use client'
import React from 'react'
import { Button } from './ui/button'
import { signOut } from 'next-auth/react'

const UserAccountNav = () => {
	return (
		<Button
			variant={'destructive'}
			onClick={() => signOut({ redirect: true, callbackUrl: `${window.location.origin}/sign-in` })}
		>
			Sign out
		</Button>
	)
}

export default UserAccountNav
