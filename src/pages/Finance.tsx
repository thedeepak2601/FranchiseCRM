import { useState } from 'react'
import { IndianRupee, TrendingUp, TrendingDown, Receipt, CreditCard, ArrowUpRight, ArrowDownRight, Search, Filter, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'

const financeStats = [
  { label: 'Total Revenue', value: '12.4Cr', change: '+12.5%', positive: true, icon: IndianRupee },
  { label: 'Pending Payments', value: '2.1Cr', change: '-8%', positive: true, icon: Receipt },
  { label: 'Outstanding', value: '45L', change: '+5%', positive: false, icon: CreditCard },
  { label: 'This Month', value: '1.8Cr', change: '+15%', positive: true, icon: TrendingUp },
]

const transactions = [
  { id: 'TXN-001', franchise: 'Spice Route - Connaught Place', amount: 45000, type: 'credit', status: 'completed', date: '2026-04-28', mode: 'UPI' },
  { id: 'TXN-002', franchise: 'Spice Route - Marine Drive', amount: 32000, type: 'credit', status: 'pending', date: '2026-04-28', mode: 'Bank Transfer' },
  { id: 'TXN-003', franchise: 'Spice Route - Indiranagar', amount: 28000, type: 'credit', status: 'completed', date: '2026-04-27', mode: 'UPI' },
  { id: 'TXN-004', franchise: 'Spice Route - Bandra', amount: 51000, type: 'credit', status: 'completed', date: '2026-04-27', mode: 'NEFT' },
  { id: 'TXN-005', franchise: 'Spice Route - Jubilee Hills', amount: 38000, type: 'debit', status: 'completed', date: '2026-04-26', mode: 'RTGS' },
  { id: 'TXN-006', franchise: 'Spice Route - Salt Lake', amount: 15000, type: 'credit', status: 'failed', date: '2026-04-26', mode: 'UPI' },
]

const invoices = [
  { id: 'INV-2026-001', franchise: 'Spice Route - Connaught Place', amount: 45000, status: 'paid', dueDate: '2026-04-15', paidDate: '2026-04-14' },
  { id: 'INV-2026-002', franchise: 'Spice Route - Marine Drive', amount: 32000, status: 'pending', dueDate: '2026-04-20', paidDate: null },
  { id: 'INV-2026-003', franchise: 'Spice Route - Indiranagar', amount: 28000, status: 'overdue', dueDate: '2026-04-10', paidDate: null },
  { id: 'INV-2026-004', franchise: 'Spice Route - Bandra', amount: 51000, status: 'paid', dueDate: '2026-04-18', paidDate: '2026-04-17' },
]

export default function Finance() {
  const { palette } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: palette.text }}>Finance</h1>
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            Track revenue, payments, and financial performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" style={{ borderColor: palette.border, color: palette.textDim }}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button style={{ background: palette.violet }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {financeStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="p-4 rounded-xl border"
              style={{ background: palette.bgCard, borderColor: palette.border }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase" style={{ color: palette.textMute }}>
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: palette.text }}>
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.positive ? (
                      <ArrowUpRight className="h-3 w-3" style={{ color: palette.emerald }} />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" style={{ color: palette.rose }} />
                    )}
                    <span 
                      className="text-xs font-medium"
                      style={{ color: stat.positive ? palette.emerald : palette.rose }}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: palette.violetBg }}>
                  <Icon className="h-5 w-5" style={{ color: palette.violet }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList style={{ background: palette.bgCard, borderColor: palette.border }}>
          <TabsTrigger value="transactions" style={{ color: palette.textDim }}>Transactions</TabsTrigger>
          <TabsTrigger value="invoices" style={{ color: palette.textDim }}>Invoices</TabsTrigger>
          <TabsTrigger value="reports" style={{ color: palette.textDim }}>Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: palette.textMute }} />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
            />
          </div>

          {/* Transactions Table */}
          <div className="rounded-xl border overflow-hidden" style={{ background: palette.bgCard, borderColor: palette.border }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: palette.violetBg }}>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Transaction ID</th>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Franchise</th>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Amount</th>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Type</th>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Mode</th>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Status</th>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, index) => (
                  <tr key={index} className="border-t" style={{ borderColor: palette.border }}>
                    <td className="p-4 text-sm font-mono" style={{ color: palette.violet }}>{txn.id}</td>
                    <td className="p-4 text-sm" style={{ color: palette.text }}>{txn.franchise}</td>
                    <td className="p-4 text-sm font-medium" style={{ color: palette.text }}>
                      <span style={{ color: txn.type === 'credit' ? palette.emerald : palette.rose }}>
                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-sm capitalize" style={{ color: palette.textDim }}>{txn.type}</td>
                    <td className="p-4 text-sm" style={{ color: palette.textMute }}>{txn.mode}</td>
                    <td className="p-4">
                      <Badge variant={txn.status === 'completed' ? 'success' : txn.status === 'pending' ? 'warning' : 'destructive'}>
                        {txn.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm" style={{ color: palette.textMute }}>{txn.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="rounded-xl border overflow-hidden" style={{ background: palette.bgCard, borderColor: palette.border }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: palette.violetBg }}>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Invoice ID</th>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Franchise</th>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Amount</th>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Due Date</th>
                  <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, index) => (
                  <tr key={index} className="border-t" style={{ borderColor: palette.border }}>
                    <td className="p-4 text-sm font-mono" style={{ color: palette.violet }}>{inv.id}</td>
                    <td className="p-4 text-sm" style={{ color: palette.text }}>{inv.franchise}</td>
                    <td className="p-4 text-sm font-medium" style={{ color: palette.text }}>₹{inv.amount.toLocaleString()}</td>
                    <td className="p-4 text-sm" style={{ color: palette.textMute }}>{inv.dueDate}</td>
                    <td className="p-4">
                      <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'destructive'}>
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4" style={{ color: palette.textMute }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: palette.text }}>Financial Reports</h3>
              <p className="text-sm" style={{ color: palette.textMute }}>
                Generate P&L, balance sheet, and revenue reports
              </p>
              <Button className="mt-4" style={{ background: palette.violet }}>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}