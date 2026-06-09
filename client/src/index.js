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
            toastOptions={{
              duration: 4000,
              className: "!bg-surface !text-text-primary !border !border-border !shadow-medium",
              style: {
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "var(--color-success)",
                  secondary: "var(--color-surface)",
                },
              },
              error: {
                duration: 5000,
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
