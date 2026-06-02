import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, Lock, Mail, User, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'

export default function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const { palette } = useTheme()
  const { user, signIn, signUp, dummyUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState(mode === 'signin' ? dummyUser.email : '')
  const [password, setPassword] = useState(mode === 'signin' ? dummyUser.password : '')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSignUp = mode === 'signup'

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (isSignUp) {
        if (name.trim().length < 2) {
          throw new Error('Enter a name with at least 2 characters.')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.')
        }
        await signUp(name, email, password)
      } else {
        await signIn(email, password)
      }
      navigate('/dashboard', { replace: true })
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Authentication failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: palette.bg }}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-xl border lg:grid-cols-[0.9fr_1.1fr]" style={{ background: palette.bgCard, borderColor: palette.border }}>
          <div className="hidden border-r p-8 lg:flex lg:flex-col lg:justify-between" style={{ background: palette.bgElev, borderColor: palette.border }}>
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: palette.violet }}>
                  <Building2 className="h-5 w-5 text-white" />
                </span>
                <div>
                  <div className="font-semibold" style={{ color: palette.text }}>Franchise CRM</div>
                  <div className="text-xs" style={{ color: palette.textMute }}>Lead to franchise lifecycle</div>
                </div>
              </div>
              <div className="mt-12 space-y-3">
                <h1 className="text-3xl font-bold" style={{ color: palette.text }}>
                  Manage every franchise conversation from one workspace.
                </h1>
                <p className="text-sm leading-6" style={{ color: palette.textMute }}>
                  Sign in with the demo account or create a local mock user for testing.
                </p>
              </div>
            </div>
            <div className="rounded-lg border p-4 text-sm" style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}>
              <div className="font-medium">Dummy login</div>
              <div className="mt-2 text-xs" style={{ color: palette.textMute }}>{dummyUser.email}</div>
              <div className="text-xs" style={{ color: palette.textMute }}>{dummyUser.password}</div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: palette.violet }}>
                  <Building2 className="h-5 w-5 text-white" />
                </span>
                <div>
                  <div className="font-semibold" style={{ color: palette.text }}>Franchise CRM</div>
                  <div className="text-xs" style={{ color: palette.textMute }}>Demo auth enabled</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-3xl font-semibold" style={{ color: palette.text }}>
                {isSignUp ? 'Create your account' : 'Sign in to Franchise CRM'}
              </h2>
              <p className="mt-2 text-sm leading-6" style={{ color: palette.textMute }}>
                {isSignUp ? 'Create an account to start tracking franchise leads and interactions.' : 'Use the demo account or your own signed-up credentials.'}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isSignUp ? (
                <label className="block space-y-2">
                  <span className="text-sm" style={{ color: palette.textMute }}>Name</span>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
                    <Input value={name} onChange={(event) => setName(event.target.value)} className="pl-10" placeholder="Your name" />
                  </div>
                </label>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm" style={{ color: palette.textMute }}>Email</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
                  <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="pl-10" placeholder="name@example.com" required />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm" style={{ color: palette.textMute }}>Password</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pr-10 pl-10"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {error ? (
                <div className="rounded-lg border p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                className="w-full gap-2"
                style={{ background: palette.violet }}
                disabled={isSubmitting}
              >
                {isSignUp ? <UserPlus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {isSubmitting ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm" style={{ color: palette.textMute }}>
              {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
              <Link className="font-medium" style={{ color: palette.violet }} to={isSignUp ? '/signin' : '/signup'}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
