import { useState } from 'react'
import { Building2, Plus, Search, Filter, MoreHorizontal, MapPin, Phone, Mail, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'

const franchises = [
  { id: 'FR-001', name: 'Spice Route - Connaught Place', owner: 'Rajesh Kumar', location: 'Delhi NCR', revenue: 45.2, growth: 18, status: 'active', since: '2024-01' },
  { id: 'FR-002', name: 'Spice Route - Marine Drive', owner: 'Priya Sharma', location: 'Mumbai', revenue: 38.5, growth: 12, status: 'active', since: '2024-03' },
  { id: 'FR-003', name: 'Spice Route - Indiranagar', owner: 'Amit Patel', location: 'Bangalore', revenue: 32.1, growth: 15, status: 'active', since: '2024-02' },
  { id: 'FR-004', name: 'Spice Route - Jubilee Hills', owner: 'Sneha Reddy', location: 'Hyderabad', revenue: 28.8, growth: 22, status: 'active', since: '2024-04' },
  { id: 'FR-005', name: 'Spice Route - Salt Lake', owner: 'Vikram Singh', location: 'Kolkata', revenue: 24.5, growth: 8, status: 'pending', since: '2025-01' },
  { id: 'FR-006', name: 'Spice Route - T Nagar', owner: 'Karthik R', location: 'Chennai', revenue: 22.1, growth: 5, status: 'active', since: '2024-05' },
]

export default function Franchises() {
  const { palette } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredFranchises = franchises.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.owner.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: palette.text }}>Franchises</h1>
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            Manage your franchise network across all locations
          </p>
        </div>
        <Button style={{ background: palette.violet }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Franchise
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: palette.textMute }} />
          <Input
            placeholder="Search franchises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'pending', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-4 py-2 text-sm rounded-lg capitalize transition-colors"
              style={{
                background: statusFilter === status ? palette.violet : palette.bgCard,
                color: statusFilter === status ? 'white' : palette.textDim,
                border: `1px solid ${palette.border}`,
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Franchise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFranchises.map((franchise) => (
          <Card 
            key={franchise.id}
            className="cursor-pointer transition-all hover:scale-[1.02]"
            style={{ background: palette.bgCard, borderColor: palette.border }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium"
                    style={{ background: palette.violetBg, color: palette.violet }}
                  >
                    {franchise.name.split(' ').slice(2).join('').slice(0,2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium" style={{ color: palette.text }}>
                      {franchise.name}
                    </h3>
                    <p className="text-xs" style={{ color: palette.textMute }}>
                      {franchise.id}
                    </p>
                  </div>
                </div>
                <button>
                  <MoreHorizontal className="h-4 w-4" style={{ color: palette.textMute }} />
                </button>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback style={{ background: palette.violet, color: 'white', fontSize: '10px' }}>
                      {franchise.owner.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm" style={{ color: palette.textDim }}>{franchise.owner}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" style={{ color: palette.textMute }} />
                  <span className="text-sm" style={{ color: palette.textMute }}>{franchise.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: palette.border }}>
                <div>
                  <p className="text-xs" style={{ color: palette.textMute }}>Revenue</p>
                  <p className="text-sm font-medium" style={{ color: palette.text }}>₹{franchise.revenue}L</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: palette.textMute }}>Growth</p>
                  <p className="text-sm font-medium" style={{ color: palette.emerald }}>+{franchise.growth}%</p>
                </div>
                <Badge variant={franchise.status === 'active' ? 'success' : franchise.status === 'pending' ? 'warning' : 'secondary'}>
                  {franchise.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}