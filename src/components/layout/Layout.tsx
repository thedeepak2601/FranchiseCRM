import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Building2, ClipboardCheck, 
  Settings, Search, Bell, ChevronRight, Menu, X, LogOut,
  IndianRupee, TrendingUp, Package, MapPin, Target, User, ShieldCheck, ListChecks, Users,
  Maximize2, Minimize2, RefreshCw, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// ============================================================
// NAVIGATION CONFIG
// ============================================================

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'leads', label: 'Leads & Pipeline', icon: Target, path: '/leads' },
  { id: 'franchises', label: 'Franchises', icon: Building2, path: '/franchises' },
  { id: 'brands', label: 'Brands', icon: Package, path: '/brands' },
  { id: 'locations', label: 'Locations', icon: MapPin, path: '/locations' },
  { id: 'finance', label: 'Finance', icon: IndianRupee, path: '/finance' },
  { id: 'lead-status-master', label: 'Lead Status Master', icon: ListChecks, path: '/lead-status-master' },
  { id: 'customer-master', label: 'Customer Master', icon: Users, path: '/customer-master' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

const notifications = [
  {
    title: 'Approvals due',
    description: '3 franchise approvals are waiting for review.',
    time: '12 min ago',
    tone: 'violet',
  },
  {
    title: 'Follow-ups today',
    description: '2 lead follow-ups are scheduled before 6 PM.',
    time: 'Today',
    tone: 'amber',
  },
  {
    title: 'Invoice reminder',
    description: 'Pending invoices dropped by 5 this week.',
    time: 'Yesterday',
    tone: 'emerald',
  },
]

// ============================================================
// LAYOUT COMPONENT
// ============================================================

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [contentRefreshKey, setContentRefreshKey] = useState(0)
  const [activeHeaderCard, setActiveHeaderCard] = useState<'notifications' | 'quickActions' | 'user' | null>(null)
  const headerActionsRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { palette } = useTheme()
  const { user, signOut } = useAuth()
  const userInitials = (user?.name || user?.email || 'User')
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  const handleSignOut = () => {
    signOut()
    setActiveHeaderCard(null)
    navigate('/signin', { replace: true })
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      return
    }

    await document.exitFullscreen()
  }

  const openQuickRoute = (path: string, message: string) => {
    navigate(path)
    setNotice(message)
    setActiveHeaderCard(null)
  }

  const refreshCurrentPage = () => {
    setContentRefreshKey((current) => current + 1)
    setNotice('Page refreshed.')
    setActiveHeaderCard(null)
  }

  useEffect(() => {
    if (!activeHeaderCard) return

    const closeHeaderCardOnOutsideClick = (event: PointerEvent) => {
      if (headerActionsRef.current?.contains(event.target as Node)) {
        return
      }

      setActiveHeaderCard(null)
    }

    document.addEventListener('pointerdown', closeHeaderCardOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeHeaderCardOnOutsideClick)
  }, [activeHeaderCard])

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', syncFullscreenState)
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: palette.bg }}>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col border-r transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
        style={{ background: palette.bgElev, borderColor: palette.border }}
      >
        <SidebarContent 
          collapsed={!sidebarOpen} 
          currentPath={location.pathname}
          onNavigate={(path) => navigate(path)}
          onNotice={setNotice}
          onLogout={handleSignOut}
        />
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <aside 
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
            style={{ background: palette.bgElev, borderColor: palette.border }}
          >
            <SidebarContent 
              collapsed={false} 
              currentPath={location.pathname}
              onNavigate={(path) => {
                navigate(path)
                setMobileMenuOpen(false)
              }}
              onClose={() => setMobileMenuOpen(false)}
              onNotice={setNotice}
              onLogout={handleSignOut}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header
          className="h-16 shrink-0 border-b flex items-center justify-between gap-4 px-4 lg:px-6"
          style={{ background: palette.bgElev, borderColor: palette.border }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" style={{ color: palette.text }} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" style={{ color: palette.text }} />
            </Button>
            
            {/* Search */}
            <div className="relative hidden min-w-0 md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: palette.textMute }} />
              <Input
                placeholder="Search franchises, brands..."
                className="w-[min(28vw,360px)] min-w-[240px] pl-10"
                style={{ 
                  background: palette.bgCard, 
                  borderColor: palette.border,
                  color: palette.text 
                }}
              />
            </div>
          </div>

          <div ref={headerActionsRef} className="relative flex min-w-0 shrink-0 items-center gap-3 lg:gap-4">
            {/* Theme Switcher */}
            <ThemeSwitcher />

            <div className="hidden items-center gap-1 sm:flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
                title={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" style={{ color: palette.textDim }} />
                ) : (
                  <Maximize2 className="h-5 w-5" style={{ color: palette.textDim }} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshCurrentPage}
                aria-label="Refresh page"
                title="Refresh page"
              >
                <RefreshCw className="h-5 w-5" style={{ color: palette.textDim }} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveHeaderCard((current) => current === 'quickActions' ? null : 'quickActions')}
                aria-label="Quick actions"
                title="Quick actions"
              >
                <Zap className="h-5 w-5" style={{ color: palette.textDim }} />
              </Button>
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setActiveHeaderCard((current) => current === 'notifications' ? null : 'notifications')}
              aria-label="Show notifications"
            >
              <Bell className="h-5 w-5" style={{ color: palette.textDim }} />
              <span 
                className="absolute top-1 right-1 h-2 w-2 rounded-full"
                style={{ background: palette.violet }}
              />
            </Button>

            {/* User Menu */}
            <button
              type="button"
              className="flex items-center gap-3 pl-3 border-l text-left"
              style={{ borderColor: palette.border }}
              onClick={() => setActiveHeaderCard((current) => current === 'user' ? null : 'user')}
              aria-label="Show user menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback style={{ background: palette.violet, color: 'white' }}>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium" style={{ color: palette.text }}>{user?.name || 'User'}</div>
                <div className="text-xs" style={{ color: palette.textMute }}>{user?.role || 'Admin'}</div>
              </div>
            </button>

            {activeHeaderCard === 'notifications' ? (
              <div
                className="absolute right-0 top-12 z-40 w-[min(360px,calc(100vw-2rem))] rounded-lg border p-3 shadow-xl"
                style={{ background: palette.bgElev, borderColor: palette.border }}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: palette.text }}>Notifications</h3>
                    <p className="text-xs" style={{ color: palette.textMute }}>Latest CRM activity</p>
                  </div>
                  <Badge variant="secondary">3 new</Badge>
                </div>
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const toneColor =
                      notification.tone === 'amber'
                        ? palette.amber
                        : notification.tone === 'emerald'
                          ? palette.emerald
                          : palette.violet

                    return (
                      <div
                        key={notification.title}
                        className="rounded-lg border p-3"
                        style={{ background: palette.bgCard, borderColor: palette.border }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            style={{ background: `${toneColor}20`, color: toneColor }}
                          >
                            <ClipboardCheck className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium" style={{ color: palette.text }}>
                                {notification.title}
                              </p>
                              <span className="shrink-0 text-[11px]" style={{ color: palette.textMute }}>
                                {notification.time}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed" style={{ color: palette.textDim }}>
                              {notification.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {activeHeaderCard === 'quickActions' ? (
              <div
                className="absolute right-28 top-12 z-40 w-[min(280px,calc(100vw-2rem))] rounded-lg border p-2 shadow-xl"
                style={{ background: palette.bgElev, borderColor: palette.border }}
              >
                <div className="px-3 py-2">
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: palette.textMute }}>
                    Modules
                  </div>
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors"
                      style={{ color: location.pathname === item.path ? palette.violet : palette.text }}
                      onClick={() => openQuickRoute(item.path, `Opened ${item.label}.`)}
                    >
                      <Icon className="h-4 w-4" style={{ color: location.pathname === item.path ? palette.violet : palette.textMute }} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            ) : null}

            {activeHeaderCard === 'user' ? (
              <div
                className="absolute right-0 top-12 z-40 w-[min(320px,calc(100vw-2rem))] rounded-lg border p-3 shadow-xl"
                style={{ background: palette.bgElev, borderColor: palette.border }}
              >
                <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: palette.border }}>
                  <Avatar className="h-11 w-11">
                    <AvatarFallback style={{ background: palette.violet, color: 'white' }}>
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: palette.text }}>{user?.name || 'User'}</div>
                    <div className="text-xs" style={{ color: palette.textMute }}>{user?.role || 'Admin'} account</div>
                  </div>
                </div>
                <div className="space-y-2 py-3">
                  <div className="flex items-center gap-3 rounded-lg px-2 py-2" style={{ background: palette.bgCard }}>
                    <User className="h-4 w-4" style={{ color: palette.violet }} />
                    <div>
                      <div className="text-xs font-medium" style={{ color: palette.text }}>Profile</div>
                      <div className="text-[11px]" style={{ color: palette.textMute }}>{user?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg px-2 py-2" style={{ background: palette.bgCard }}>
                    <ShieldCheck className="h-4 w-4" style={{ color: palette.emerald }} />
                    <div>
                      <div className="text-xs font-medium" style={{ color: palette.text }}>Role</div>
                      <div className="text-[11px]" style={{ color: palette.textMute }}>Full CRM access</div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : null}
          </div>
        </header>

        {/* Page Content */}
        {notice ? (
          <div
            className="mx-4 mt-3 rounded-lg border px-4 py-3 text-sm lg:mx-6"
            style={{ background: palette.bgCard, borderColor: palette.violetBorder, color: palette.text }}
          >
            {notice}
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet key={contentRefreshKey} />
        </div>
      </main>
    </div>
  )
}

// ============================================================
// SIDEBAR CONTENT
// ============================================================

function SidebarContent({ 
  collapsed, 
  currentPath, 
  onNavigate,
  onClose,
  onNotice,
  onLogout,
}: { 
  collapsed: boolean
  currentPath: string
  onNavigate: (path: string) => void
  onClose?: () => void
  onNotice?: (message: string) => void
  onLogout: () => void
}) {
  const { palette } = useTheme()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b" style={{ borderColor: palette.border }}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div 
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: palette.violet }}
            >
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold" style={{ color: palette.text }}>
              Franchise CRM
            </span>
          </div>
        )}
        {collapsed && (
          <div 
            className="h-8 w-8 rounded-lg flex items-center justify-center mx-auto"
            style={{ background: palette.violet }}
          >
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
        )}
        {onClose && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" style={{ color: palette.text }} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path
          const Icon = item.icon
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive && "opacity-100"
              )}
              style={{
                background: isActive ? palette.violetBg : 'transparent',
                borderLeft: isActive ? `3px solid ${palette.violet}` : '3px solid transparent',
              }}
            >
              <Icon 
                className="h-5 w-5 shrink-0" 
                style={{ color: isActive ? palette.violet : palette.textDim }} 
              />
              {!collapsed && (
                <span 
                  className="text-sm font-medium"
                  style={{ color: isActive ? palette.text : palette.textDim }}
                >
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <ChevronRight className="h-4 w-4 ml-auto" style={{ color: palette.violet }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t" style={{ borderColor: palette.border }}>
        {!collapsed && (
          <div 
            className="p-3 rounded-lg mb-3"
            style={{ background: palette.violetBg }}
          >
            <div className="text-xs font-medium mb-1" style={{ color: palette.violet }}>
              Pro Plan
            </div>
            <div className="text-xs mb-2" style={{ color: palette.textMute }}>
              3 brands, unlimited franchises
            </div>
            <Button
              size="sm"
              className="w-full"
              style={{ background: palette.violet }}
              onClick={() => onNotice?.('Upgrade request captured. Billing will contact the admin account.')}
            >
              Upgrade
            </Button>
          </div>
        )}
        
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-red-500/10"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" style={{ color: palette.textMute }} />
          {!collapsed && (
            <span className="text-sm" style={{ color: palette.textMute }}>
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
