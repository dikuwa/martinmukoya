"use client";

import dynamic from "next/dynamic";

const Toaster = dynamic(
  () => import("react-hot-toast").then((mod) => mod.Toaster),
  { ssr: false }
);

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1a1a2e",
          color: "#f1f1f1",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: "14px",
          fontWeight: 500,
        },
        success: {
          style: {
            background: "#065f46",
            border: "1px solid rgba(52, 211, 153, 0.35)",
            color: "#d1fae5",
          },
          iconTheme: {
            primary: "#34d399",
            secondary: "#065f46",
          },
        },
        error: {
          style: {
            background: "#7f1d1d",
            border: "1px solid rgba(248, 113, 113, 0.35)",
            color: "#fee2e2",
          },
          iconTheme: {
            primary: "#f87171",
            secondary: "#7f1d1d",
          },
        },
      }}
    />
  );
}
