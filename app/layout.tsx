import type { Metadata } from "next"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AgentProvider } from "@/lib/agent-store/provider"
import { ChatsProvider } from "@/lib/chat-store/chats/provider"
import { APP_DESCRIPTION, APP_NAME } from "@/lib/config"
import { getUserProfile } from "@/lib/user/api"
import { ThemeProvider } from "next-themes"
import Script from "next/script"
import { LayoutClient } from "./layout-client"
import { ChatSessionProvider } from "./providers/chat-session-provider"
import { UserPreferencesProvider } from "./providers/user-preferences-provider"
import { UserProvider } from "./providers/user-provider"

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isDev = process.env.NODE_ENV === "development"
  const userProfile = await getUserProfile()

  return (
    <html lang="en" suppressHydrationWarning>
      {!isDev ? (
        <Script
          async
          src="https://analytics.umami.is/script.js"
          data-website-id="42e5b68c-5478-41a6-bc68-088d029cee52"
        />
      ) : null}
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/hye7rmx.css" />
      </head>
      <body className="font-greycliff antialiased">
        <LayoutClient />
        <UserProvider initialUser={userProfile}>
          <ChatsProvider userId={userProfile?.id}>
            <ChatSessionProvider>
              <AgentProvider userId={userProfile?.id}>
                <UserPreferencesProvider userId={userProfile?.id}>
                  <TooltipProvider delayDuration={200} skipDelayDuration={500}>
                    <ThemeProvider
                      attribute="class"
                      defaultTheme="light"
                      enableSystem
                      disableTransitionOnChange
                    >
                      <SidebarProvider defaultOpen>
                        <Toaster position="top-center" />
                        {children}
                      </SidebarProvider>
                    </ThemeProvider>
                  </TooltipProvider>
                </UserPreferencesProvider>
              </AgentProvider>
            </ChatSessionProvider>
          </ChatsProvider>
        </UserProvider>
      </body>
    </html>
  )
}
