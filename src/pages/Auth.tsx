import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  UserPlus,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'

const benefits = [
  {
    title: 'Quick demo access',
    text: 'Use the ready account and enter the CRM instantly.',
  },
  {
    title: 'Automate lead work',
    text: 'Keep follow-ups, visits, and owner calls in one flow.',
  },
  {
    title: 'Built for franchise teams',
    text: 'Track territories from first interest to agreement.',
  },
]

export default function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
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
    <main className="relative h-screen overflow-hidden bg-white text-slate-950">
      <div className="absolute inset-y-0 right-0 w-[44%] bg-[#2947ff]" />
      <div className="absolute -right-14 top-0 h-full w-[56%] -skew-x-[27deg] bg-[#2947ff]" />
      <div className="absolute -bottom-28 left-[48%] h-72 w-72 rounded-full bg-[#2947ff]" />
      <div className="absolute left-0 top-0 h-1 w-full bg-slate-900" />

      <section className="relative z-10 flex h-full items-center justify-center px-4 py-4 sm:px-6">
        <div className="grid h-[min(760px,calc(100vh-2rem))] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl shadow-blue-950/20 md:grid-cols-[0.92fr_1.08fr]">
          <aside className="relative hidden overflow-hidden bg-[#2947ff] p-7 text-white md:flex md:flex-col md:justify-between lg:p-10">
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-400/20" />
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/20" />
            <Zap className="absolute bottom-16 right-14 h-8 w-8 rotate-12 text-white/15" />
            <Building2 className="absolute left-16 top-10 h-10 w-10 text-white/15" />

            <div className="relative mx-auto mt-4 w-full max-w-sm">
              <div className="mx-auto flex h-52 w-72 flex-col rounded-lg border border-white/30 bg-white shadow-2xl shadow-blue-950/20">
                <div className="flex h-8 items-center gap-1 border-b border-slate-200 px-3">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
                <div className="m-5 flex flex-1 items-end justify-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-5">
                  {[34, 52, 68, 84].map((height, index) => (
                    <div key={height} className="flex h-full items-end gap-2">
                      <div className="h-2 w-2 self-start rounded-full bg-slate-300" />
                      <div
                        className="w-4 rounded-t-sm bg-[#f7c61d]"
                        style={{ height: `${height}%`, opacity: 0.78 + index * 0.06 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-8 left-0 flex items-end gap-3">
                <div className="h-20 w-5 rounded-t-full bg-slate-900" />
                <div className="h-12 w-12 rotate-[-18deg] rounded-md bg-white p-2 shadow-lg">
                  <div className="h-full rounded-sm bg-[#f7c61d]/80" />
                </div>
              </div>
              <div className="absolute -bottom-8 left-32 flex items-end gap-2">
                <div className="h-24 w-8 rounded-t-full bg-slate-800" />
                <div className="h-16 w-3 rounded-full bg-rose-300" />
              </div>
              <div className="absolute -bottom-8 right-4 flex items-end gap-3">
                <div className="h-14 w-14 rotate-[16deg] rounded-md bg-white p-2 shadow-lg">
                  <BarChart3 className="h-full w-full text-slate-700" />
                </div>
                <div className="h-20 w-7 rounded-t-full bg-slate-800" />
              </div>
            </div>

            <div className="relative space-y-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#f7c61d]" />
                  <div>
                    <div className="text-sm font-bold">{benefit.title}</div>
                    <p className="mt-1 max-w-xs text-sm leading-5 text-white/80">{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="flex h-full items-center justify-center px-6 py-5 sm:px-10 lg:px-16">
            <div className="w-full max-w-sm">
              <div className="mb-8 text-center">
                <div className="mb-4 flex justify-center md:hidden">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2947ff]">
                    <Building2 className="h-6 w-6 text-white" />
                  </span>
                </div>
                <div className="text-4xl font-black tracking-normal text-[#f7c61d]">
                  Franchise<span className="text-[#2947ff]">CRM.</span>
                </div>
                <h1 className="mt-4 text-xl font-bold text-slate-950">
                  {isSignUp ? 'Create account' : 'Welcome back'}
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  {isSignUp ? 'Join by creating your CRM account.' : 'Sign in to manage your franchise workspace.'}
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600">Email:</span>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-300 focus-visible:ring-[#2947ff]"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </label>

                {isSignUp ? (
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-slate-600">Full name:</span>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="h-11 border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-300 focus-visible:ring-[#2947ff]"
                        placeholder="Jhon Chris"
                      />
                    </div>
                  </label>
                ) : null}

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600">Password:</span>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 border-slate-200 bg-white pl-10 pr-10 text-slate-900 placeholder:text-slate-300 focus-visible:ring-[#2947ff]"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                {error ? (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="h-11 w-full gap-2 rounded-md bg-[#2947ff] text-sm font-bold text-white hover:bg-[#1f39df]"
                  disabled={isSubmitting}
                >
                  {isSignUp ? <UserPlus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  {isSubmitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              {!isSignUp ? (
                <div className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-center text-xs text-slate-500">
                  Demo: <span className="font-semibold text-slate-700">{dummyUser.email}</span> /{' '}
                  <span className="font-semibold text-slate-700">{dummyUser.password}</span>
                </div>
              ) : null}

              <div className="mt-12 text-center text-sm font-bold text-slate-800">
                {isSignUp ? 'You have an account?' : 'Need an account?'}{' '}
                <Link className="text-[#2947ff] hover:text-[#1f39df]" to={isSignUp ? '/signin' : '/signup'}>
                  {isSignUp ? 'Log in' : 'Create account'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
