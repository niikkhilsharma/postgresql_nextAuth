import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import React from 'react'
import Image from 'next/image'

const page = async () => {
	const session = await getServerSession(authOptions)
	console.log(session)

	if (session?.user)
		return (
			<div>
				Welcome to admin page.
				<h1 className="text-2xl font-bold">
					Hello {session.user.name} <br /> {session.user.username ?? session.user.email} <br />{' '}
					{session.user.image && (
						<Image width={100} height={100} src={session.user.image} alt="user avatar" />
					)}
				</h1>
			</div>
		)

	return <h2 className="text-2xl font-bold">You are not logged in.</h2>
}

export default page
