import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow admin emails to sign in
      if (user.email && adminEmails.includes(user.email)) {
        return true
      }
      return false
    },
    async session({ session, token }) {
      return session
    },
    async jwt({ token, user }) {
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}
