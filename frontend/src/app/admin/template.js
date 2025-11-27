"use client";
import Loader from "@/Components/Loader";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/Layout/Header/Header";

export default function Template({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const sessionActive = sessionStorage.getItem("sessionActive");
    const logout = async () => {
      await signOut({ redirect: true });
    };
    if (!sessionActive) {
      // If no session marker exists in sessionStorage, log the user out
      logout();
    }
  }, []);

  useEffect(() => {
    if (session && session.user) {
      const userRole = session.user.userRole;
      if (userRole === "Provider") {
        router.push("/provider/home");
      } else if (userRole === "Patient") {
        router.push("/user/home");
      }
    }
  }, [session, router]);

  if (status === "loading" || !sessionStorage.getItem("sessionActive")) {
    return <Loader />;
  }

  if (status === "authenticated" && session?.user?.userRole === "Admin") {
    return (
      <section>
        <Header session={session} />
        <div className="d-block">
          <div className="md:flex-grow mx-auto">{children}</div>
        </div>
      </section>
    );
  } else {
    return <Loader />;
  }
}
