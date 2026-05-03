import { useState } from 'react'
import { MapPin, Plus, Search, MoreHorizontal, Building2, Users, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'

const locations = [
  { id: 'LOC-001', name: 'Delhi NCR', region: 'North', franchises: 12, revenue: 3.2, occupancy: 95, status: 'active' },
  { id: 'LOC-002', name: 'Mumbai', region: 'West', franchises: 8, revenue: 2.8, occupancy: 88, status: 'active' },
  { id: 'LOC-003', name: 'Bangalore', region: 'South', franchises: 6, revenue: 2.1, occupancy: 92, status: 'active' },
  { id: 'LOC-004', name: 'Chennai', region: 'South', franchises: 5, revenue: 1.9, occupancy: 85, status: 'active' },
  { id: 'LOC-005', name: 'Hyderabad', region: 'South', franchises: 4, revenue: 1.4, occupancy: 90, status: 'active' },
  { id: 'LOC-006', name: 'Kolkata', region: 'East', franchises: 3, revenue: 1.1, occupancy: 78, status: 'average' },
  { id: 'LOC-007', name: 'Pune', region: 'West', franchises: 2, revenue: 0.8, occupancy: 82, status: 'active' },
  { id: 'LOC-008', name: 'Ahmedabad', region: 'West', franchises: 2, revenue: 0.6, occupancy: 75, status: 'pending' },
]

export default function Locations() {
  const { palette } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')

  const regions = ['all', ...new Set(locations.map(l => l.region))]

  const filteredLocations = locations.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = regionFilter === 'all' || l.region === regionFilter
    return matchesSearch && matchesRegion
  })

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: palette.text }}>Locations</h1>
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            Track franchise presence across geographic regions
          </p>
        </div>
        <Button style={{ background: palette.violet }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: palette.textMute }} />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
          />
        </div>
        <div className="flex gap-2">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setRegionFilter(region)}
              className="px-4 py-2 text-sm rounded-lg capitalize transition-colors"
              style={{
                background: regionFilter === region ? palette.violet : palette.bgCard,
                color: regionFilter === region ? 'white' : palette.textDim,
                border: `1px solid ${palette.border}`,
              }}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredLocations.map((location) => (
          <Card 
            key={location.id}
            className="cursor-pointer transition-all hover:scale-[1.02]"
            style={{ background: palette.bgCard, borderColor: palette.border }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ background: palette.violetBg }}
                  >
                    <MapPin className="h-5 w-5" style={{ color: palette.violet }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium" style={{ color: palette.text }}>
                      {location.name}
                    </h3>
                    <p className="text-xs" style={{ color: palette.textMute }}>{location.region}</p>
                  </div>
                </div>
                <button>
                  <MoreHorizontal className="h-4 w-4" style={{ color: palette.textMute }} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" style={{ color: palette.textMute }} />
                    <span className="text-xs" style={{ color: palette.textMute }}>Franchises</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: palette.text }}>{location.franchises}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" style={{ color: palette.textMute }} />
                    <span className="text-xs" style={{ color: palette.textMute }}>Revenue</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: palette.text }}>₹{location.revenue}Cr</p>
                </div>
              </div>

              <div className="pt-3 border-t" style={{ borderColor: palette.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: palette.textMute }}>Occupancy</span>
                  <span className="text-sm font-medium" style={{ 
                    color: location.occupancy >= 90 ? palette.emerald : 
                           location.occupancy >= 80 ? palette.amber : palette.rose 
                  }}>
                    {location.occupancy}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full" style={{ background: palette.border }}>
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${location.occupancy}%`,
                      background: location.occupancy >= 90 ? palette.emerald : 
                                 location.occupancy >= 80 ? palette.amber : palette.rose 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
