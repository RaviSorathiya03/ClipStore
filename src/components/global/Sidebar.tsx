import { Bell, HomeIcon, Library, Menu, Search, Settings, TrendingUpIcon as Trending, Upload, User2 } from 'lucide-react'
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Home() {
  return (
    <SidebarProvider>
      <div className="min-h-screen min-w-screen bg-background overflow-y-scroll mb-10">
        {/* Header */}
        <header className="sticky top-2 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <SidebarTrigger />
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-xl">ClipStore</span>
            </Link>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <div className="w-full max-w-xl">
                <form className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search videos..."
                    className="w-full appearance-none bg-secondary pl-8 md:w-2/3 lg:w-full"
                  />
                </form>
              </div>
              <nav className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Avatar>
                  <AvatarImage src="/placeholder.svg" alt="@user" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </nav>
            </div>
          </div>
        </header>

        <div className="flex mt-10 p-10">
          {/* Sidebar */}
          <Sidebar>
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">
                      <HomeIcon className="mr-2 h-4 w-4" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/trending">
                      <Trending className="mr-2 h-4 w-4" />
                      <span>Trending</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/library">
                      <Library className="mr-2 h-4 w-4" />
                      <span>Library</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <SidebarMenuItem key={i}>
                        <SidebarMenuButton asChild>
                          <Link href={`/channel/${i}`}>
                            <Avatar className="mr-2 h-4 w-4">
                              <AvatarImage src={`/placeholder.svg`} />
                              <AvatarFallback>CH</AvatarFallback>
                            </Avatar>
                            <span>Channel {i + 1}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/profile">
                          <User2 className="mr-2 h-4 w-4" />
                          <span>Your Channel</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <div className="container py-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-lg">
                    <Link href={`/video/${i}`}>
                      <div className="aspect-video overflow-hidden rounded-lg bg-secondary">
                        <img
                          src={`/placeholder.svg?height=200&width=400`}
                          alt="Thumbnail"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-2">
                        <div className="flex items-start gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>CH</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold leading-none">Amazing Video Title {i + 1}</h3>
                            <p className="text-sm text-muted-foreground">Channel Name</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.floor(Math.random() * 1000)}K views • {Math.floor(Math.random() * 12)} months ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}