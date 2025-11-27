import NextAuth from "next-auth";
// import { authConfig } from "./auth.config";
import axios from "axios";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          console.error("No credentials provided");
          throw new Error("No credentials provided");
        }
        const email = credentials.email;
        const password = credentials.password;
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;

        try {
          const res = await axios.post(`${baseUrl}login`, {
            email,
            password,
          });

          const response = res.data;

          if (response.success && response.user) {
            const user = response.user;
            // Include accessToken if necessary
            if (response.accessToken) {
              user.accessToken = response.accessToken;
            }
            return user;
          } else {
            console.error("Failed login response:", response);
            throw new Error(response?.message || "An error occurred");
          }
        } catch (error) {
          console.error("Error during login:", error);
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error("An unknown error occurred");
          }
        }
      },
    }),
  ],
  trustHost: true,
  trustHostedDomain: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    error: "/",
    signIn: "/auth/login",
    signOut: "/",
  },
  callbacks: {
    authorized({ request, auth }) {
      // console.log("Please Remove Me. This is a POC", auth); // <-- This should have your additional user data!
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        const updatedUser = { ...token.user, ...session.user };
        token.user = updatedUser;
      }

      if (user) {
        token.user = user; // Assign the entire user object to the token
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user; // Assign the entire user object to the session
      }
      return session;
    },
  },
};
