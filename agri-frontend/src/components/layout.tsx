// src/layout/RootLayout.tsx

import React from "react"
import Navbar from "../components/navbar"
import { AuthProvider } from "../hooks/use-auth"
import { Web3Provider } from "../hooks/use-web3"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import "@fontsource/inter" // Install this: npm install @fontsource/inter
// import "../globals.css" // Uncomment this if you have a globals.css in src/

const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32",
    },
    secondary: {
      main: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
})

type Props = {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Web3Provider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
            <footer className="bg-gray-100 py-6">
              <div className="container mx-auto px-4 text-center text-sm text-gray-600">
                &copy; {new Date().getFullYear()} AgriChain - Blockchain Agricultural Supply Chain
              </div>
            </footer>
          </div>
        </Web3Provider>
      </AuthProvider>
    </ThemeProvider>
  )
}
