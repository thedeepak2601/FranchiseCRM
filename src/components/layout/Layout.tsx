import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Users, Building2, Receipt, ClipboardCheck, 
  Settings, Search, Bell, ChevronRight, Menu, X, LogOut,
  IndianRupee, TrendingUp, Package, MapPin, Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { appModeLabel, isMockMode } from '@/lib/app-mode'

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
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

const quickStats = [
  { label: 'Total Revenue', value: '₹12.4Cr', change: '+12.5%', positive: true },
  { label: 'Active Franchises', value: '48', change: '+3', positive: true },
  { label: 'Pending Invoices', value: '12', change: '-5', positive: true },
]

// ============================================================
// LAYOUT COMPONENT
// ============================================================

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { palette } = useTheme()

  return (
    <div className="min-h-screen flex" style={{ background: palette.bg }}>
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
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header 
          className="h-16 border-b flex items-center justify-between px-4 lg:px-6"
          style={{ background: palette.bgElev, borderColor: palette.border }}
        >
          <div className="flex items-center gap-4">
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
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: palette.textMute }} />
              <Input
                placeholder="Search franchises, brands..."
                className="w-80 pl-10"
                style={{ 
                  background: palette.bgCard, 
                  borderColor: palette.border,
                  color: palette.text 
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isMockMode && (
              <Badge variant="warning" className="hidden md:inline-flex">
                {appModeLabel}
              </Badge>
            )}
            {/* Quick Stats */}
            <div className="hidden xl:flex items-center gap-4 mr-4">
              {quickStats.map((stat, i) => (
                <div key={i} className="text-right">
                  <div className="text-xs" style={{ color: palette.textMute }}>{stat.label}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium" style={{ color: palette.text }}>
                      {stat.value}
                    </span>
                    <span className="text-xs" style={{ color: stat.positive ? palette.emerald : palette.rose }}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" style={{ color: palette.textDim }} />
              <span 
                className="absolute top-1 right-1 h-2 w-2 rounded-full"
                style={{ background: palette.violet }}
              />
            </Button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 border-l" style={{ borderColor: palette.border }}>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback style={{ background: palette.violet, color: 'white' }}>
                  SR
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium" style={{ color: palette.text }}>Spice Route</div>
                <div className="text-xs" style={{ color: palette.textMute }}>Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
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
  onClose 
}: { 
  collapsed: boolean
  currentPath: string
  onNavigate: (path: string) => void
  onClose?: () => void
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
            <Button size="sm" className="w-full" style={{ background: palette.violet }}>
              Upgrade
            </Button>
          </div>
        )}
        
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-red-500/10"
          onClick={() => {
            // Handle logout
          }}
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
