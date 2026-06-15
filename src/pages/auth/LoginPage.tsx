import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MdEmail } from 'react-icons/md'
import { HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi'
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa'
import { MdOutlinePets } from 'react-icons/md'
import { BsCheckCircleFill } from 'react-icons/bs'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useCurrentUser } from '../../contexts/CurrentUserContext'

const FEATURES = [
  'Manage your creative projects in one place',
  'Collaborate with your team in real time',
  'Ship faster with smart automation',
]

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { loginAs } = useCurrentUser()

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    setIsLoading(true)
    try {
      const { data } = await axios.post(
        'https://api.escuelajs.co/api/v1/auth/login',
        { email, password }
      )
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      loginAs(email)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Invalid email or password. Please try again.')
      } else {
        setError('Something went wrong. Please check your connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left: Brand Panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: '#0f172a' }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: '#ea6c2e', opacity: 0.15 }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full blur-3xl"
          style={{ backgroundColor: '#6366f1', opacity: 0.12 }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: '#ea6c2e', opacity: 0.05 }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#ea6c2e' }}
          >
            <MdOutlinePets className="text-white text-xl" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            PipCat Studio
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Your creative studio,{' '}
            <span style={{ color: '#ea6c2e' }}>elevated.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Everything your team needs to build, manage, and ship — beautifully unified in one platform.
          </p>
          <ul className="space-y-4">
            {FEATURES.map((feat) => (
              <li key={feat} className="flex items-start gap-3">
                <BsCheckCircleFill
                  className="text-sm mt-0.5 shrink-0"
                  style={{ color: '#ea6c2e' }}
                />
                <span className="text-slate-300 text-sm">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-slate-600 text-xs">
          © {new Date().getFullYear()} PipCat Studio. All rights reserved.
        </p>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex-1 bg-white dark:bg-slate-900 flex items-center justify-center p-8 relative">

        {/* Theme toggle — top right corner */}
        <button
          onClick={toggleTheme}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#ea6c2e' }}
            >
              <MdOutlinePets className="text-white text-lg" />
            </div>
            <span className="font-bold text-gray-900 dark:text-slate-100 text-lg tracking-tight">
              PipCat Studio
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1.5">
              Sign in to your account
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Welcome back! Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Email address
              </label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-base pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-[#ea6c2e] transition-all"
                  style={{ '--tw-ring-color': 'rgba(234,108,46,0.25)' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-medium hover:underline"
                  style={{ color: '#ea6c2e' }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-base pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-[#ea6c2e] transition-all"
                  style={{ '--tw-ring-color': 'rgba(234,108,46,0.25)' } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <HiEyeOff className="text-base" />
                    : <HiEye className="text-base" />
                  }
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                <span className="text-red-500 text-base mt-0.5 shrink-0">⚠</span>
                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg text-white text-sm font-semibold tracking-wide transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundColor: '#ea6c2e' }}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-4 px-4 py-3 rounded-lg border border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
            <p className="text-xs text-gray-400 dark:text-slate-500 font-medium mb-0.5">Demo credentials</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Email: <span className="font-mono text-gray-700 dark:text-slate-300">john@mail.com</span>
              &nbsp;·&nbsp;
              Password: <span className="font-mono text-gray-700 dark:text-slate-300">changeme</span>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">Or continue with</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-3 gap-3">
            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all cursor-pointer">
              <FaGoogle className="text-[#EA4335] text-base" />
              <span>Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all cursor-pointer">
              <FaFacebook className="text-[#1877F2] text-base" />
              <span>Facebook</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all cursor-pointer">
              <FaApple className="text-gray-900 dark:text-slate-100 text-base" />
              <span>Apple</span>
            </button>
          </div>

          {/* Sign up */}
          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-8">
            Don't have an account?{' '}
            <a
              href="#"
              className="font-semibold hover:underline"
              style={{ color: '#ea6c2e' }}
            >
              Create one free
            </a>
          </p>
        </div>
      </div>

    </div>
  )
}

export default LoginPage
