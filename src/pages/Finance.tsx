import { useEffect, useState } from 'react'
import { IndianRupee, TrendingUp, Receipt, CreditCard, ArrowUpRight, ArrowDownRight, Search, Download, Plus, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/pagination'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { PageHeaderTitle } from '@/components/ui/page-header-title'
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

type Invoice = {
  id: string
  franchise: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  dueDate: string
  paidDate: string | null
}

const initialInvoices: Invoice[] = [
  { id: 'INV-2026-001', franchise: 'Spice Route - Connaught Place', amount: 45000, status: 'paid', dueDate: '2026-04-15', paidDate: '2026-04-14' },
  { id: 'INV-2026-002', franchise: 'Spice Route - Marine Drive', amount: 32000, status: 'pending', dueDate: '2026-04-20', paidDate: null },
  { id: 'INV-2026-003', franchise: 'Spice Route - Indiranagar', amount: 28000, status: 'overdue', dueDate: '2026-04-10', paidDate: null },
  { id: 'INV-2026-004', franchise: 'Spice Route - Bandra', amount: 51000, status: 'paid', dueDate: '2026-04-18', paidDate: '2026-04-17' },
]
const pageSize = 12

export default function Finance() {
  const { palette } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [invoiceList, setInvoiceList] = useState(initialInvoices)
  const [modalOpen, setModalOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [draft, setDraft] = useState({ franchise: '', amount: 0, dueDate: new Date().toISOString().slice(0, 10) })
  const [error, setError] = useState('')
  const [transactionPage, setTransactionPage] = useState(1)
  const [invoicePage, setInvoicePage] = useState(1)
  const [transactionView, setTransactionView] = useState<ViewMode>('list')
  const [invoiceView, setInvoiceView] = useState<ViewMode>('list')

  const filteredTransactions = transactions.filter((txn) => {
    const term = searchTerm.trim().toLowerCase()
    return !term || [txn.id, txn.franchise, txn.mode, txn.status].some((value) => value.toLowerCase().includes(term))
  })
  const paginatedTransactions = filteredTransactions.slice((transactionPage - 1) * pageSize, transactionPage * pageSize)
  const paginatedInvoices = invoiceList.slice((invoicePage - 1) * pageSize, invoicePage * pageSize)

  useEffect(() => {
    setTransactionPage(1)
  }, [searchTerm])

  const exportFinance = () => {
    const rows = [
      ['Type', 'ID', 'Franchise', 'Amount', 'Status', 'Date'],
      ...transactions.map((txn) => ['Transaction', txn.id, txn.franchise, String(txn.amount), txn.status, txn.date]),
      ...invoiceList.map((invoice) => ['Invoice', invoice.id, invoice.franchise, String(invoice.amount), invoice.status, invoice.dueDate]),
    ]
    const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `finance-export-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setNotice('Finance export downloaded.')
  }

  const saveInvoice = () => {
    if (!draft.franchise.trim() || draft.amount <= 0 || !draft.dueDate) {
      setError('Franchise, amount, and due date are required.')
      return
    }
    setInvoiceList((current) => [{
      id: `INV-2026-${String(current.length + 1).padStart(3, '0')}`,
      franchise: draft.franchise,
      amount: draft.amount,
      status: 'pending',
      dueDate: draft.dueDate,
      paidDate: null,
    }, ...current])
    setModalOpen(false)
    setDraft({ franchise: '', amount: 0, dueDate: new Date().toISOString().slice(0, 10) })
    setError('')
    setNotice('Invoice created successfully.')
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageHeaderTitle title="Finance" />
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            Track revenue, payments, and financial performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportFinance} style={{ borderColor: palette.border, color: palette.textDim }}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button style={{ background: palette.violet }} onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>
      {notice ? <div className="rounded-lg border px-4 py-3 text-sm" style={{ background: palette.bgCard, borderColor: palette.violetBorder, color: palette.text }}>{notice}</div> : null}

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: palette.textMute }} />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
              />
            </div>
            <ViewToggle value={transactionView} onChange={setTransactionView} />
          </div>

          {/* Transactions Table */}
          {transactionView === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedTransactions.map((txn) => (
                <Card key={txn.id} style={{ background: palette.bgCard, borderColor: palette.border }}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono text-sm font-medium" style={{ color: palette.violet }}>{txn.id}</div>
                        <div className="mt-1 text-sm" style={{ color: palette.text }}>{txn.franchise}</div>
                      </div>
                      <Badge variant={txn.status === 'completed' ? 'success' : txn.status === 'pending' ? 'warning' : 'destructive'}>{txn.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 text-sm" style={{ borderColor: palette.border }}>
                      <span style={{ color: palette.textMute }}>{txn.mode}</span>
                      <span className="font-medium" style={{ color: txn.type === 'credit' ? palette.emerald : palette.rose }}>{txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-xs" style={{ color: palette.textMute }}>{txn.date}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
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
                {paginatedTransactions.map((txn, index) => (
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
          )}
          <Pagination page={transactionPage} pageSize={pageSize} totalItems={filteredTransactions.length} onPageChange={setTransactionPage} itemLabel="transactions" />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-end">
            <ViewToggle value={invoiceView} onChange={setInvoiceView} />
          </div>
          {invoiceView === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedInvoices.map((inv) => (
                <Card key={inv.id} style={{ background: palette.bgCard, borderColor: palette.border }}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono text-sm font-medium" style={{ color: palette.violet }}>{inv.id}</div>
                        <div className="mt-1 text-sm" style={{ color: palette.text }}>{inv.franchise}</div>
                      </div>
                      <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'destructive'}>{inv.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 text-sm" style={{ borderColor: palette.border }}>
                      <span style={{ color: palette.textMute }}>Due {inv.dueDate}</span>
                      <span className="font-medium" style={{ color: palette.text }}>₹{inv.amount.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
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
                {paginatedInvoices.map((inv, index) => (
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
          )}
          <Pagination page={invoicePage} pageSize={pageSize} totalItems={invoiceList.length} onPageChange={setInvoicePage} itemLabel="invoices" />
        </TabsContent>

        <TabsContent value="reports">
          <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4" style={{ color: palette.textMute }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: palette.text }}>Financial Reports</h3>
              <p className="text-sm" style={{ color: palette.textMute }}>
                Generate P&L, balance sheet, and revenue reports
              </p>
              <Button className="mt-4" onClick={() => setNotice('Financial report generated in mock mode.')} style={{ background: palette.violet }}>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModalOpen(false)}>
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border p-5 shadow-2xl" onClick={(event) => event.stopPropagation()} style={{ background: palette.bgCard, borderColor: palette.border }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: palette.text }}>Create Invoice</h2>
                <p className="text-sm" style={{ color: palette.textMute }}>Add a pending invoice for a franchise.</p>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={() => setModalOpen(false)} style={{ borderColor: palette.border, color: palette.text }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {error ? <div className="mb-3 rounded-lg border p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>{error}</div> : null}
            <div className="space-y-3">
              <Input placeholder="Franchise name, e.g. Spice Route - Mumbai" value={draft.franchise} onChange={(event) => setDraft({ ...draft, franchise: event.target.value })} style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
              <Input type="number" placeholder="Invoice amount in rupees, e.g. 45000" value={draft.amount || ''} onChange={(event) => setDraft({ ...draft, amount: Number(event.target.value) })} style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
              <Input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} style={{ borderColor: palette.border, color: palette.text }}>Cancel</Button>
              <Button type="button" onClick={saveInvoice} style={{ background: palette.violet }}>
                <Save className="mr-2 h-4 w-4" />
                Save Invoice
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
