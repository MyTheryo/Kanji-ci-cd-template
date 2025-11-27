"use client";
import Footer from "../../Layout/Footer/Footer";
import Header from "../../Layout/Header/Header";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { setSidebarClose } from "../../Redux/Reducers/LayoutSlice";
import { setLayout } from "../../Redux/Reducers/ThemeCustomizerSlice";
import React, { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Loader from "@/Components/Loader";
import SessionNotification from "@/CommonComponent/SessionNotification";

const RootLayout = ({ children }) => {
  const { data: session, status } = useSession();
  const { layout } = useAppSelector((state) => state.themeCustomizer);
  const dispatch = useAppDispatch();
  const { sidebarClose } = useAppSelector((state) => state.layout);
  const compactSidebar = () => {
    let windowWidth = window.innerWidth;
    if (layout === "compact-wrapper") {
      if (windowWidth < 1200) {
        dispatch(setSidebarClose(true));
      } else {
        dispatch(setSidebarClose(false));
      }
    } else if (layout === "horizontal-sidebar") {
      if (windowWidth < 1200) {
        dispatch(setSidebarClose(true));
        dispatch(setLayout("vertical"));
      } else {
        dispatch(setSidebarClose(false));
        dispatch(setLayout(localStorage.getItem("layout")));
      }
    }
  };
  useEffect(() => {
    compactSidebar();
    window.addEventListener("resize", () => {
      compactSidebar();
    });
  }, [layout]);

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

  if (status === "loading" || !sessionStorage.getItem("sessionActive")) {
    return <Loader />;
  }

  return (
    <>
      <main
        className={`page-wrapper ${layout} ${
          sidebarClose ? "sidebar-close" : ""
        }`}
      >
        <Header session={session} />
        <div className="page-body-wrapper">
          <Sidebar session={session} />
          <div className="page-body">{children}</div>
          <Footer />
        </div>
        <SessionNotification />
      </main>
    </>
  );
};

export default RootLayout;
