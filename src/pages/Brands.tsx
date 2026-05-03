import { useState } from 'react'
import { Package, Plus, Search, MoreHorizontal, TrendingUp, Users, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'

const brands = [
  { id: 'BR-001', name: 'Spice Route', category: 'Restaurant', franchises: 24, revenue: 8.2, growth: 15, color: '#8B7CF6', status: 'active' },
  { id: 'BR-002', name: 'Cafe Culture', category: 'Cafe', franchises: 12, revenue: 2.4, growth: 22, color: '#10B981', status: 'active' },
  { id: 'BR-003', name: 'Quick Bites', category: 'Fast Food', franchises: 8, revenue: 1.2, growth: 8, color: '#F59E0B', status: 'active' },
  { id: 'BR-004', name: 'Sweet Tooth', category: 'Bakery', franchises: 4, revenue: 0.6, growth: 12, color: '#06B6D4', status: 'pending' },
]

export default function Brands() {
  const { palette } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: palette.text }}>Brands</h1>
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            Manage your brand portfolio across different categories
          </p>
        </div>
        <Button style={{ background: palette.violet }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: palette.textMute }} />
        <Input
          placeholder="Search brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
        />
      </div>

      {/* Brand Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {brands.map((brand) => (
          <Card 
            key={brand.id}
            className="cursor-pointer transition-all hover:scale-[1.02]"
            style={{ background: palette.bgCard, borderColor: palette.border }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${brand.color}20` }}
                  >
                    <Package className="h-6 w-6" style={{ color: brand.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: palette.text }}>
                      {brand.name}
                    </h3>
                    <p className="text-sm" style={{ color: palette.textMute }}>{brand.category}</p>
                  </div>
                </div>
                <button>
                  <MoreHorizontal className="h-4 w-4" style={{ color: palette.textMute }} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Building2 className="h-3 w-3" style={{ color: palette.textMute }} />
                    <span className="text-xs" style={{ color: palette.textMute }}>Franchises</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: palette.text }}>{brand.franchises}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3" style={{ color: palette.textMute }} />
                    <span className="text-xs" style={{ color: palette.textMute }}>Revenue</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: palette.text }}>₹{brand.revenue}Cr</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3" style={{ color: palette.textMute }} />
                    <span className="text-xs" style={{ color: palette.textMute }}>Growth</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: palette.emerald }}>+{brand.growth}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: palette.border }}>
                <span className="text-xs" style={{ color: palette.textMute }}>ID: {brand.id}</span>
                <Badge variant={brand.status === 'active' ? 'success' : 'warning'}>
                  {brand.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}