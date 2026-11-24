import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
          <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
              duration: 4000,
              className: "app-toast",
              style: {
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-medium)",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "14px",
                lineHeight: 1.5,
                padding: "12px 16px",
                width: "min(380px, calc(100vw - 32px))",
              },
              success: {
                iconTheme: {
                  primary: "var(--color-success)",
                  secondary: "var(--color-surface)",
                },
              },
              error: {
                iconTheme: {
                  primary: "var(--color-error)",
                  secondary: "var(--color-surface)",
                },
              },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
