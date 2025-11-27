import axios from "axios";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";

export const authOptions = {
  pages: {
    signIn: "/auth/login", // Redirect to custom login page
    signOut: "/auth/login", // Optional custom logout page
    // error: "/auth/error", // Redirect to error page (optional)
  },
  callbacks: {
    /**
     * Handles JWT token updates.
     */
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        token.user = { ...token.user, ...session.user };
      }
      if (user) {
        token.user = user;
      }
      return token;
    },
    /**
     * Extends the session object with user details from the token.
     */
    async session({ session, token }) {
      session.user = token.user || null; // Add user data to session

      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Credentials are required");
        }
        const { email, password } = credentials;
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVER_URL}login`,
            { email, password }
          );

          const user = response.data?.data;

          if (user) {
            return user; // Pass the user object to the token
          } else {
            throw new Error(response?.message || "An error occurred");
          }
        } catch (error) {
          throw new Error(
            error?.response?.data?.message || "An error occurred during login"
          );
        }
      },
    }),
  ],
  session: {
    maxAge: 24 * 60 * 60, // 1 day use 24 hours
    updateAge: 60 * 60, // Update session every hour
  },
  secret: process.env.NEXTAUTH_SECRET, // Secure the session
};

export default NextAuth(authOptions);