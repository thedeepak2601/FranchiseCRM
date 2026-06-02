import { useState, useMemo } from 'react'
import { 
  LayoutDashboard, Users, Building2, Receipt, ClipboardCheck, Sparkles,
  Calendar, Settings, Search, Bell, ChevronRight, ChevronDown, MapPin,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, Camera,
  Wifi, WifiOff, MessageCircle, IndianRupee, FileText, Zap, ArrowUpRight,
  ArrowDownRight, MoreHorizontal, Plus, Filter, ChevronLeft, X, Phone,
  Mail, Globe, Shield, Activity, Briefcase, GraduationCap, Coffee, Scissors,
  Stethoscope, Dumbbell, ChevronUp, Eye, Send, Paperclip, Image as ImageIcon,
  AlertCircle, CircleDot, Hash, Percent, Wallet, Target, Layers, Map,
  GitBranch, UserCheck, FileSignature, Rocket, RefreshCw, Crown,
  Network, Route
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageHeaderTitle } from '@/components/ui/page-header-title'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'

// ============================================================
// MOCK DATA
// ============================================================

const brand = {
  name: 'Spice Route Hospitality',
  logo: 'SR',
  color: '#8B7CF6',
};

const stats = [
  { label: 'Total Revenue', value: '12.4Cr', change: '+12.5%', positive: true, icon: IndianRupee },
  { label: 'Active Franchises', value: '48', change: '+3', positive: true, icon: Building2 },
  { label: 'Pending Invoices', value: '12', change: '-5', positive: true, icon: Receipt },
  { label: 'New Enquiries', value: '28', change: '+8', positive: true, icon: Users },
];

const revenueData = [
  { month: 'Jul', revenue: 8.5, target: 9 },
  { month: 'Aug', revenue: 9.2, target: 9.5 },
  { month: 'Sep', revenue: 8.8, target: 10 },
  { month: 'Oct', revenue: 10.2, target: 10.5 },
  { month: 'Nov', revenue: 11.5, target: 11 },
  { month: 'Dec', revenue: 12.4, target: 12 },
  { month: 'Jan', revenue: 11.8, target: 12.5 },
  { month: 'Feb', revenue: 13.2, target: 13 },
  { month: 'Mar', revenue: 14.1, target: 13.5 },
];

const franchisePerformance = [
  { name: 'Delhi NCR', revenue: 3.2, growth: 15, franchises: 12, status: 'excellent' },
  { name: 'Mumbai', revenue: 2.8, growth: 12, franchises: 8, status: 'excellent' },
  { name: 'Bangalore', revenue: 2.1, growth: 8, franchises: 6, status: 'good' },
  { name: 'Chennai', revenue: 1.9, growth: 5, franchises: 5, status: 'good' },
  { name: 'Hyderabad', revenue: 1.4, growth: 18, franchises: 4, status: 'excellent' },
  { name: 'Kolkata', revenue: 1.1, growth: -2, franchises: 3, status: 'average' },
];

const recentTransactions = [
  { id: 'TXN001', franchise: 'Spice Route - Connaught Place', amount: 45000, status: 'completed', date: '2026-04-28' },
  { id: 'TXN002', franchise: 'Spice Route - Marine Drive', amount: 32000, status: 'pending', date: '2026-04-28' },
  { id: 'TXN003', franchise: 'Spice Route - Indiranagar', amount: 28000, status: 'completed', date: '2026-04-27' },
  { id: 'TXN004', franchise: 'Spice Route - Bandra', amount: 51000, status: 'completed', date: '2026-04-27' },
  { id: 'TXN005', franchise: 'Spice Route - Jubilee Hills', amount: 38000, status: 'failed', date: '2026-04-26' },
];

const topFranchisees = [
  { name: 'Rajesh Kumar', location: 'Delhi NCR', revenue: 45.2, growth: 18, avatar: 'RK' },
  { name: 'Priya Sharma', location: 'Mumbai', revenue: 38.5, growth: 12, avatar: 'PS' },
  { name: 'Amit Patel', location: 'Bangalore', revenue: 32.1, growth: 15, avatar: 'AP' },
  { name: 'Sneha Reddy', location: 'Hyderabad', revenue: 28.8, growth: 22, avatar: 'SR' },
];

const alerts = [
  { type: 'warning', message: '3 franchises pending renewal approval', icon: AlertTriangle },
  { type: 'info', message: 'New brand partnership inquiry from Pune', icon: Building2 },
  { type: 'success', message: 'Monthly target achieved for Delhi region', icon: CheckCircle2 },
];

// ============================================================
// DASHBOARD COMPONENT
// ============================================================

export default function Dashboard() {
  const { palette } = useTheme()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('monthly')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notice, setNotice] = useState('')

  const totalRevenue = useMemo(() => 
    revenueData.reduce((sum, d) => sum + d.revenue, 0).toFixed(1), 
  [])

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageHeaderTitle title={`Welcome back, ${brand.name}`} />
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            Here's what's happening with your franchise network today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setNotice('Dashboard refreshed with the latest mock data.')}
            style={{ borderColor: palette.border, color: palette.textDim }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm"
            onClick={() => navigate('/franchises')}
            style={{ background: palette.violet }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Franchise
          </Button>
        </div>
      </div>
      {notice ? (
        <div className="rounded-lg border px-4 py-3 text-sm" style={{ background: palette.bgCard, borderColor: palette.violetBorder, color: palette.text }}>
          {notice}
        </div>
      ) : null}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="p-4 rounded-xl border transition-all hover:scale-[1.02]"
              style={{ background: palette.bgCard, borderColor: palette.border }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: palette.textMute }}>
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: palette.text }}>
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span 
                      className="text-xs font-medium"
                      style={{ color: stat.positive ? palette.emerald : palette.rose }}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs" style={{ color: palette.textMute }}>
                      vs last month
                    </span>
                  </div>
                </div>
                <div 
                  className="p-2 rounded-lg"
                  style={{ background: palette.violetBg }}
                >
                  <Icon className="h-5 w-5" style={{ color: palette.violet }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div 
          className="lg:col-span-2 p-5 rounded-xl border"
          style={{ background: palette.bgCard, borderColor: palette.border }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: palette.text }}>
                Revenue Overview
              </h3>
              <p className="text-sm" style={{ color: palette.textMute }}>
                Revenue vs Target (in Crores)
              </p>
            </div>
            <div className="flex gap-2">
              {['weekly', 'monthly', 'quarterly'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className="px-3 py-1 text-xs font-medium rounded-full transition-colors capitalize"
                  style={{
                    background: timeRange === range ? palette.violet : 'transparent',
                    color: timeRange === range ? 'white' : palette.textMute,
                    border: `1px solid ${timeRange === range ? palette.violet : palette.border}`,
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette.violet} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={palette.violet} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.border} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: palette.textMute, fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: palette.textMute, fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{
                    background: palette.bgElev,
                    border: `1px solid ${palette.border}`,
                    borderRadius: 8,
                    color: palette.text,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={palette.violet}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke={palette.textMute}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts */}
        <div 
          className="p-5 rounded-xl border"
          style={{ background: palette.bgCard, borderColor: palette.border }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: palette.text }}>
            Quick Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const Icon = alert.icon
              return (
                <div
                  key={index}
                  className="p-3 rounded-lg flex items-start gap-3"
                  style={{ 
                    background: alert.type === 'warning' ? 'rgba(245,158,11,0.1)' : 
                               alert.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(139,124,246,0.1)' 
                  }}
                >
                  <Icon 
                    className="h-4 w-4 mt-0.5 shrink-0" 
                    style={{ 
                      color: alert.type === 'warning' ? palette.amber : 
                             alert.type === 'success' ? palette.emerald : palette.violet 
                    }} 
                  />
                  <span className="text-sm" style={{ color: palette.textDim }}>
                    {alert.message}
                  </span>
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t" style={{ borderColor: palette.border }}>
            <h4 className="text-sm font-medium mb-3" style={{ color: palette.text }}>
              Network Status
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: palette.textMute }}>Online</span>
                <span className="text-sm font-medium" style={{ color: palette.emerald }}>46</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: palette.textMute }}>Offline</span>
                <span className="text-sm font-medium" style={{ color: palette.rose }}>2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Franchise Performance */}
        <div 
          className="p-5 rounded-xl border"
          style={{ background: palette.bgCard, borderColor: palette.border }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: palette.text }}>
              Franchise Performance
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/franchises')} style={{ color: palette.violet }}>
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {franchisePerformance.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium"
                  style={{ background: palette.violetBg, color: palette.violet }}
                >
                  {item.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate" style={{ color: palette.text }}>
                      {item.name}
                    </span>
                    <span className="text-sm font-medium" style={{ color: palette.text }}>
                      ₹{item.revenue}Cr
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: palette.textMute }}>
                      {item.franchises} franchises
                    </span>
                    <span 
                      className="text-xs"
                      style={{ color: item.growth > 0 ? palette.emerald : palette.rose }}
                    >
                      {item.growth > 0 ? '+' : ''}{item.growth}%
                    </span>
                  </div>
                </div>
                <Badge 
                  variant={item.status === 'excellent' ? 'success' : item.status === 'good' ? 'info' : 'warning'}
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Top Franchisees */}
        <div 
          className="p-5 rounded-xl border"
          style={{ background: palette.bgCard, borderColor: palette.border }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: palette.text }}>
              Top Performing Franchisees
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/franchises')} style={{ color: palette.violet }}>
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {topFranchisees.map((franchisee, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-lg font-bold w-6" style={{ color: palette.textMute }}>
                  #{index + 1}
                </span>
                <Avatar className="h-10 w-10">
                  <AvatarFallback style={{ background: palette.violet, color: 'white' }}>
                    {franchisee.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate" style={{ color: palette.text }}>
                      {franchisee.name}
                    </span>
                    <span className="text-sm font-medium" style={{ color: palette.text }}>
                      ₹{franchisee.revenue}L
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" style={{ color: palette.textMute }} />
                    <span className="text-xs" style={{ color: palette.textMute }}>
                      {franchisee.location}
                    </span>
                    <span 
                      className="text-xs"
                      style={{ color: palette.emerald }}
                    >
                      +{franchisee.growth}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div 
          className="lg:col-span-2 p-5 rounded-xl border"
          style={{ background: palette.bgCard, borderColor: palette.border }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: palette.text }}>
              Recent Transactions
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/finance')} style={{ color: palette.violet }}>
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: palette.border }}>
                  <th className="text-left py-3 text-xs font-medium uppercase tracking-wider" style={{ color: palette.textMute }}>
                    Transaction ID
                  </th>
                  <th className="text-left py-3 text-xs font-medium uppercase tracking-wider" style={{ color: palette.textMute }}>
                    Franchise
                  </th>
                  <th className="text-left py-3 text-xs font-medium uppercase tracking-wider" style={{ color: palette.textMute }}>
                    Amount
                  </th>
                  <th className="text-left py-3 text-xs font-medium uppercase tracking-wider" style={{ color: palette.textMute }}>
                    Status
                  </th>
                  <th className="text-left py-3 text-xs font-medium uppercase tracking-wider" style={{ color: palette.textMute }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn, index) => (
                  <tr key={index} className="border-b" style={{ borderColor: palette.borderSoft }}>
                    <td className="py-3 text-sm font-mono" style={{ color: palette.violet }}>
                      {txn.id}
                    </td>
                    <td className="py-3 text-sm" style={{ color: palette.text }}>
                      {txn.franchise}
                    </td>
                    <td className="py-3 text-sm font-medium" style={{ color: palette.text }}>
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <Badge 
                        variant={txn.status === 'completed' ? 'success' : txn.status === 'pending' ? 'warning' : 'destructive'}
                      >
                        {txn.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm" style={{ color: palette.textMute }}>
                      {txn.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          className="p-5 rounded-xl border"
          style={{ background: palette.bgCard, borderColor: palette.border }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: palette.text }}>
            Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              { icon: Building2, label: 'Add New Franchise', color: palette.violet, action: () => navigate('/franchises') },
              { icon: Receipt, label: 'Generate Invoice', color: palette.cyan, action: () => navigate('/finance') },
              { icon: Users, label: 'Add Franchisee', color: palette.emerald, action: () => navigate('/leads') },
              { icon: FileText, label: 'View Reports', color: palette.amber, action: () => navigate('/dashboard') },
              { icon: MessageCircle, label: 'Send Notification', color: palette.rose, action: () => setNotice('Notification queued in mock mode.') },
              { icon: Settings, label: 'Settings', color: palette.textMute, action: () => navigate('/settings') },
            ].map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={index}
                  type="button"
                  onClick={action.action}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/5"
                >
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: `${action.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm" style={{ color: palette.text }}>
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
