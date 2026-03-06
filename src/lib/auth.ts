import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Nodemailer from 'next-auth/providers/nodemailer'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').filter(Boolean)

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'database',
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
        verifyRequest: '/auth/verify',
    },
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID ?? '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        }),
        Nodemailer({
            server: process.env.EMAIL_SERVER ?? {
                host: process.env.EMAIL_SERVER_HOST ?? 'localhost',
                port: Number(process.env.EMAIL_SERVER_PORT ?? 25),
                auth:
                    process.env.EMAIL_SERVER_USER
                        ? {
                            user: process.env.EMAIL_SERVER_USER,
                            pass: process.env.EMAIL_SERVER_PASSWORD,
                        }
                        : undefined,
            },
            from: process.env.EMAIL_FROM ?? 'noreply@sg-job-finder.app',
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id
                // Attach role
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { role: true },
                })
                    ; (session.user as typeof session.user & { role: string }).role =
                        dbUser?.role ?? 'user'
            }
            return session
        },
        async signIn({ user }) {
            // Auto-promote to admin if email is in ADMIN_EMAILS
            // On first sign-in the user record may not exist yet (created after this callback),
            // so we catch the error and let it pass — admin role is set on next sign-in.
            if (user.email && ADMIN_EMAILS.includes(user.email)) {
                try {
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { role: 'admin' },
                    })
                } catch {
                    // User record not created yet — will be promoted on next sign-in
                    console.log('[auth] User record not found yet, will promote on next sign-in')
                }
            }
            return true
        },
    },
})
