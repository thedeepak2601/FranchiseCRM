import { useState } from 'react'
import { Settings, User, Bell, Shield, Palette, Database, Globe, Key, Mail, Phone, MessageCircle, CreditCard, FileText, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { PageHeaderTitle } from '@/components/ui/page-header-title'
import { cn } from '@/lib/utils'
import { settingsData } from '@/mocks/app-data'
import { useTheme } from '@/lib/theme-context'

const integrations = [
  { ...settingsData.integrations[0], icon: MessageCircle },
  { ...settingsData.integrations[1], icon: CreditCard },
  { ...settingsData.integrations[2], icon: FileText },
  { ...settingsData.integrations[3], icon: FileText },
]

export default function SettingsPage() {
  const { palette } = useTheme()
  const [notice, setNotice] = useState('')

  const saveNotice = (message: string) => {
    setNotice(message)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <PageHeaderTitle title="Settings" />
        <p className="text-sm mt-1" style={{ color: palette.textMute }}>
          Manage your account, integrations, and preferences
        </p>
      </div>
      {notice ? (
        <div className="rounded-lg border px-4 py-3 text-sm" style={{ background: palette.bgCard, borderColor: palette.violetBorder, color: palette.text }}>
          {notice}
        </div>
      ) : null}

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" orientation="vertical" className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-64">
          <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
            <CardContent className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-3 lg:block lg:space-y-1">
              {['profile', 'company', 'integrations', 'notifications', 'security', 'billing'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-left capitalize transition-colors"
                  style={{ color: palette.textDim }}
                >
                  {tab === 'profile' && <User className="h-4 w-4 shrink-0" />}
                  {tab === 'company' && <Globe className="h-4 w-4 shrink-0" />}
                  {tab === 'integrations' && <Database className="h-4 w-4 shrink-0" />}
                  {tab === 'notifications' && <Bell className="h-4 w-4 shrink-0" />}
                  {tab === 'security' && <Shield className="h-4 w-4 shrink-0" />}
                  {tab === 'billing' && <CreditCard className="h-4 w-4 shrink-0" />}
                  <span className="min-w-0 truncate text-sm">{tab}</span>
                </TabsTrigger>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
              <CardHeader>
                <CardTitle style={{ color: palette.text }}>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label style={{ color: palette.textDim }}>First Name</Label>
                    <Input defaultValue="Spice Route" style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: palette.textDim }}>Last Name</Label>
                    <Input defaultValue="Hospitality" style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: palette.textDim }}>Email</Label>
                    <Input defaultValue="admin@spiceroute.com" type="email" style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: palette.textDim }}>Phone</Label>
                    <Input defaultValue="+91 98765 43210" type="tel" style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
                  </div>
                </div>
                <div className="pt-4">
                  <Button style={{ background: palette.violet }} onClick={() => saveNotice('Profile changes saved in mock mode.')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Settings */}
          <TabsContent value="company" className="space-y-6">
            <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
              <CardHeader>
                <CardTitle style={{ color: palette.text }}>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label style={{ color: palette.textDim }}>Company Name</Label>
                    <Input defaultValue="Spice Route Hospitality Pvt Ltd" style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: palette.textDim }}>GSTIN</Label>
                    <Input defaultValue="27AABCU9603R1ZM" style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: palette.textDim }}>CIN</Label>
                    <Input defaultValue="U55100MH2015PTC262819" style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: palette.textDim }}>PAN</Label>
                    <Input defaultValue="AABCU9603R" style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
                  </div>
                </div>
                <div className="pt-4">
                  <Button style={{ background: palette.violet }} onClick={() => saveNotice('Company changes saved in mock mode.')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration, index) => {
                const Icon = integration.icon
                return (
                  <Card key={index} style={{ background: palette.bgCard, borderColor: palette.border }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ background: palette.violetBg }}>
                            <Icon className="h-5 w-5" style={{ color: palette.violet }} />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium" style={{ color: palette.text }}>{integration.name}</h3>
                            <p className="text-xs" style={{ color: palette.textMute }}>{integration.provider}</p>
                          </div>
                        </div>
                        <Badge variant={integration.status === 'connected' ? 'success' : 'warning'}>
                          {integration.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
              <CardHeader>
                <CardTitle style={{ color: palette.text }}>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Email notifications', description: 'Receive updates via email' },
                  { label: 'SMS alerts', description: 'Get important alerts on SMS' },
                  { label: 'Push notifications', description: 'Browser push notifications' },
                  { label: 'Weekly reports', description: 'Weekly performance summary' },
                ].map((pref, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ background: palette.bg }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: palette.text }}>{pref.label}</p>
                      <p className="text-xs" style={{ color: palette.textMute }}>{pref.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" style={{ accentColor: palette.violet }} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
              <CardHeader>
                <CardTitle style={{ color: palette.text }}>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label style={{ color: palette.textDim }}>Current Password</Label>
                  <Input type="password" placeholder="••••••••" style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: palette.textDim }}>New Password</Label>
                  <Input type="password" placeholder="••••••••" style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: palette.textDim }}>Confirm Password</Label>
                  <Input type="password" placeholder="••••••••" style={{ background: palette.bg, borderColor: palette.border, color: palette.text }} />
                </div>
                <div className="pt-4">
                  <Button style={{ background: palette.violet }} onClick={() => saveNotice('Password update validated in mock mode.')}>
                    <Key className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="space-y-6">
            <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
              <CardHeader>
                <CardTitle style={{ color: palette.text }}>Current Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg" style={{ background: palette.violetBg }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold" style={{ color: palette.violet }}>Pro Plan</h3>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <p className="text-sm" style={{ color: palette.textMute }}>₹9,999/month • Billed annually</p>
                  <p className="text-xs mt-2" style={{ color: palette.textDim }}>3 brands, unlimited franchises, priority support</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => saveNotice('Invoice list opened in mock mode.')} style={{ borderColor: palette.border, color: palette.textDim }}>
                    View Invoices
                  </Button>
                  <Button style={{ background: palette.violet }} onClick={() => saveNotice('Upgrade plan request captured.')}>
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
