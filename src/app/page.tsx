"use client"
import { Bell, Compass, Gamepad, History, Home, Library, Menu, Music2, Search, Settings, Smartphone, Star, TrendingUp, Upload, User2, Video, Youtube } from 'lucide-react'
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from '@clerk/clerk-react'

const categories = [
  { label: "All", value: "all" },
  { label: "Gaming", value: "gaming", icon: Gamepad },
  { label: "Music", value: "music", icon: Music2 },
  { label: "Movies", value: "movies", icon: Video },
  { label: "Live", value: "live", icon: Youtube },
  { label: "Mobile", value: "mobile", icon: Smartphone },
  { label: "Sports", value: "sports", icon: Star },
]

const videos = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  title: `Amazing Video Title ${i + 1} that might be a bit longer to show truncation`,
  thumbnail: `/placeholder.svg?height=200&width=400`,
  channel: {
    name: `Channel Name ${i + 1}`,
    avatar: `/placeholder.svg`,
  },
  views: Math.floor(Math.random() * 1000),
  timestamp: Math.floor(Math.random() * 12),
  duration: "12:34",
}))

export default function Page() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center gap-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-8 w-8" />
              <Link href="/" className="flex items-center gap-2">
                <div className="rounded-lg bg-primary p-1">
                  <Video className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">ClipStore</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-end gap-4">
              <form className="flex-1 md:max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search videos..."
                      className="w-full appearance-none pl-9 md:pr-12"
                    />
                    <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground opacity-100 md:block">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </form>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-secondary">
                  <Upload className="h-5 w-5" />
                  <span className="sr-only">Upload</span>
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-secondary">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
    
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="@user" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex">
          {/* Sidebar */}
          <Sidebar>
            <SidebarHeader className="pb-1">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/" className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/explore" className="flex items-center gap-2">
                      <Compass className="h-4 w-4" />
                      <span>Explore</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/trending" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Trending</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <Separator className="mb-2" />
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Library</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/history" className="flex items-center gap-2">
                          <History className="h-4 w-4" />
                          <span>History</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/library" className="flex items-center gap-2">
                          <Library className="h-4 w-4" />
                          <span>Library</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <SidebarMenuItem key={i}>
                        <SidebarMenuButton asChild>
                          <Link href={`/channel/${i}`} className="flex items-center gap-2">
                            <Avatar className="h-4 w-4">
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
                        <Link href="/settings" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container">
                <ScrollArea className="w-full">
                  <div className="flex items-center gap-6 py-4">
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="flex w-full justify-start gap-2 bg-transparent p-0">
                        {categories.map((category) => (
                          <TabsTrigger
                            key={category.value}
                            value={category.value}
                            className="gap-2 rounded-full data-[state=active]:bg-secondary"
                          >
                            {category.icon && <category.icon className="h-4 w-4" />}
                            {category.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                  <ScrollBar orientation="horizontal" className="invisible" />
                </ScrollArea>
              </div>
            </div>
            <div className="container py-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {videos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/video/${video.id}`}
                    className="group relative flex flex-col gap-2"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-secondary">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 right-2 rounded bg-background/90 px-1 py-0.5 text-xs font-medium backdrop-blur">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Avatar className="h-8 w-8 rounded-full ring-2 ring-background">
                        <AvatarImage src={video.channel.avatar} />
                        <AvatarFallback>CH</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <h3 className="line-clamp-2 text-sm font-medium leading-tight">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <p className="font-medium">{video.channel.name}</p>
                          <span>•</span>
                          <p>{video.views}K views</p>
                          <span>•</span>
                          <p>{video.timestamp} months ago</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}