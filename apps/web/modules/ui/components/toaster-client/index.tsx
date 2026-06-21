"use client";

import { Toaster } from "react-hot-toast";

export const ToasterClient = () => {
  return (
    <Toaster
      toastOptions={{
        success: { className: "salamruby__toast__success" },
        error: {
          className: "salamruby__toast__error",
        },
      }}
    />
  );
};
