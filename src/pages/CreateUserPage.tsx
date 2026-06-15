import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MdCheck, MdOutlineFileUpload, MdKeyboardArrowDown } from 'react-icons/md'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import Sidebar from '../components/dashboard/Sidebar'
import UserAvatar from '../components/users/UserAvatar'
import { USERS } from '../data/users'
import { useCurrentUser } from '../contexts/CurrentUserContext'
import type { UserRole, UserRowData } from '../components/users/UserTableRow'

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm ' +
  'text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder-slate-300 dark:placeholder-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition'

const ROLES: UserRole[] = ['Admin', 'Manager', 'Agent', 'Viewer']

interface UserDraft {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  role: UserRole
  profilePic: string
  organisationName: string
}

const INITIAL_DRAFT: UserDraft = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  role: 'Agent',
  profilePic: '',
  organisationName: '',
}

// ── Page ───────────────────────────────────────────────────────────────────
const CreateUserPage = () => {
  const navigate = useNavigate()
  const { isViewer } = useCurrentUser()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const editingUser = isEdit ? USERS.find((u) => u.id === Number(id)) ?? null : null

  const [draft, setDraft] = useState<UserDraft>(INITIAL_DRAFT)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/', { replace: true })
  }, [navigate])

  useEffect(() => {
    if (isViewer) navigate('/users', { replace: true })
  }, [isViewer, navigate])

  useEffect(() => {
    if (editingUser) {
      setDraft({
        firstName: editingUser.first_name,
        lastName: editingUser.last_name,
        username: editingUser.username,
        email: editingUser.email,
        password: '',
        role: editingUser.role,
        profilePic: editingUser.profile_pic,
        organisationName: editingUser.organisation_name,
      })
    }
  }, [editingUser])

  const updateDraft = (patch: Partial<UserDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateDraft({ profilePic: reader.result as string })
    reader.readAsDataURL(file)
  }

  const canSave =
    draft.firstName.trim().length > 0 &&
    draft.lastName.trim().length > 0 &&
    draft.username.trim().length > 0 &&
    draft.email.trim().length > 0 &&
    draft.organisationName.trim().length > 0 &&
    (isEdit || draft.password.trim().length > 0)

  const handleSave = () => {
    const fields = {
      first_name: draft.firstName.trim(),
      last_name: draft.lastName.trim(),
      username: draft.username.trim(),
      email: draft.email.trim(),
      role: draft.role,
      profile_pic: draft.profilePic,
      organisation_name: draft.organisationName.trim(),
    }

    if (isEdit && editingUser) {
      const updated: UserRowData = {
        ...editingUser,
        ...fields,
        password: draft.password ? draft.password : editingUser.password,
      }
      console.log('[User] updated:', updated)
      const idx = USERS.findIndex((u) => u.id === editingUser.id)
      USERS[idx] = updated
    } else {
      const newUser: UserRowData = {
        id: USERS.length ? Math.max(...USERS.map((u) => u.id)) + 1 : 1,
        ...fields,
        password: draft.password,
      }
      console.log('[User] created:', newUser)
      USERS.push(newUser)
    }

    navigate('/users')
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {isEdit ? 'Edit user' : 'Create new user'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isEdit ? 'Update account details and permissions.' : 'Add a new account and assign access.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/users')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: '#6366f1' }}
            >
              <MdCheck className="text-base" />
              {isEdit ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-8 py-10 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-xl">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Account details</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
                This information is used to identify the user and control what they can access.
              </p>

              {/* Profile photo */}
              <div className="mb-6 flex items-center gap-4">
                <UserAvatar
                  id={editingUser?.id ?? 0}
                  firstName={draft.firstName || '?'}
                  lastName={draft.lastName || ''}
                  profilePic={draft.profilePic}
                  size="lg"
                />
                <div>
                  <label
                    htmlFor="profile-pic-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
                  >
                    <MdOutlineFileUpload className="text-base" />
                    Upload photo
                  </label>
                  <input
                    id="profile-pic-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">JPG or PNG, recommended 256x256px.</p>
                </div>
              </div>

              {/* First / Last name */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.firstName}
                    onChange={(e) => updateDraft({ firstName: e.target.value })}
                    placeholder="Jane"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.lastName}
                    onChange={(e) => updateDraft({ lastName: e.target.value })}
                    placeholder="Doe"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={draft.username}
                  onChange={(e) => updateDraft({ username: e.target.value })}
                  placeholder="jane.doe"
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => updateDraft({ email: e.target.value })}
                  placeholder="jane.doe@example.com"
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={draft.password}
                    onChange={(e) => updateDraft({ password: e.target.value })}
                    placeholder={isEdit ? '••••••••' : 'Enter a password'}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <HiEyeOff className="text-base" /> : <HiEye className="text-base" />}
                  </button>
                </div>
                {isEdit && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Leave blank to keep the current password.</p>
                )}
              </div>

              {/* Role */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                <div className="relative">
                  <select
                    value={draft.role}
                    onChange={(e) => updateDraft({ role: e.target.value as UserRole })}
                    className={`${inputClass} appearance-none cursor-pointer pr-10`}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none text-lg" />
                </div>
              </div>

              {/* Organisation name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Organisation name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={draft.organisationName}
                  onChange={(e) => updateDraft({ organisationName: e.target.value })}
                  placeholder="Acme Corporation"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default CreateUserPage
