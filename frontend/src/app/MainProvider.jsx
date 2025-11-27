"use client";
import React from "react";
import { unstable_batchedUpdates } from "react-dom";
import Error404Container from "../Components/Error/Error404";

unstable_batchedUpdates(() => {
  console.error = () => {};
  console.warn = () => {};
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (error.message.includes("ToastContainer")) return;
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) return <Error404Container />;
    return this.props.children;
  }
}

const MainProvider = ({ children }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default MainProvider;
