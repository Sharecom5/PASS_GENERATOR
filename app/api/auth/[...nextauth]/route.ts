import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "@/lib/mongodb"
import { Organizer } from "@/models/Organizer"
import bcrypt from "bcryptjs"

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password")
        }
        await connectDB()
        const user = await Organizer.findOne({ email: credentials.email.toLowerCase() })
        if (!user || (!user.passwordHash && user.googleId)) {
          throw new Error("Invalid email or logged in via Google previously")
        }
        if (!user.passwordHash) {
          throw new Error("Invalid credentials")
        }
        
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) throw new Error("Invalid password")

        return { id: user._id.toString(), email: user.email, name: user.name }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await connectDB()
        let existingUser = await Organizer.findOne({ email: user.email?.toLowerCase() })
        
        if (!existingUser) {
          existingUser = await Organizer.create({
            name: user.name || 'Company Name',
            email: user.email?.toLowerCase(),
            googleId: profile?.sub,
            companyName: user.name || 'Company Name',
            plan: 'free',
          })
        } else if (!existingUser.googleId) {
          existingUser.googleId = profile?.sub
          await existingUser.save()
        }
        user.id = existingUser._id.toString()
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_key",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
