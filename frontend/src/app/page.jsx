"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Loader from "@/Components/Loader";
export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const sessionActive = sessionStorage.getItem("sessionActive");
    const logout = async () => {
      await signOut({ redirect: false });
      router.push("/auth/login");
    };
    if (!sessionActive) {
      // If no session marker exists in sessionStorage, log the user out
      logout();
    } else {
      if (!session) router.push("/auth/login");
      else if (session?.user?.userRole === "Provider")
        router.push("/provider/home");
      else if (session?.user?.userRole === "Admin")
        router.push("/admin/all-users");
      else router.push("/user/home");
    }
  }, [session]);
  return <Loader />;
}
