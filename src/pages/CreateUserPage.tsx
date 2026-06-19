import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MdCheck, MdOutlineFileUpload, MdKeyboardArrowDown } from 'react-icons/md'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import Sidebar from '../components/dashboard/Sidebar'
import UserAvatar from '../components/users/UserAvatar'
import { fetchUser, createUser, updateUser, toUserRole } from '../api/users'
import type { UserRole } from '../components/users/UserTableRow'

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
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [draft, setDraft]           = useState<UserDraft>(INITIAL_DRAFT)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [loadError, setLoadError]   = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchUser(id)
      .then((u) => {
        setDraft({
          firstName:        u.first_name,
          lastName:         u.last_name,
          username:         u.username,
          email:            u.email,
          password:         '',
          role:             toUserRole(u.role),
          profilePic:       u.profile_pic ?? '',
          organisationName: u.organization_name,
        })
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load user'))
  }, [id])

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

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const payload = {
        first_name:        draft.firstName.trim(),
        last_name:         draft.lastName.trim(),
        username:          draft.username.trim(),
        email:             draft.email.trim(),
        role:              draft.role.toUpperCase(),
        organization_name: draft.organisationName.trim(),
        profile_pic:       draft.profilePic || undefined,
        ...(draft.password ? { password: draft.password } : {}),
      }

      if (isEdit && id) {
        await updateUser(id, payload)
      } else {
        await createUser({ ...payload, password: draft.password })
      }

      navigate('/users')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save user')
    } finally {
      setSaving(false)
    }
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
              disabled={!canSave || saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: '#6366f1' }}
            >
              <MdCheck className="text-base" />
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-8 py-5 bg-slate-50 dark:bg-slate-900">
          {loadError ? (
            <p className="text-sm text-red-500 dark:text-red-400 mt-4">{loadError}</p>
          ) : (
          <div className="max-w-xxl">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Account details</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
                This information is used to identify the user and control what they can access.
              </p>

              {/* Profile photo */}
              <div className="mb-6 flex items-center gap-4">
                <UserAvatar
                  id={id ? parseInt(id, 10) : 0}
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
          )}
        </div>

      </main>
    </div>
  )
}

export default CreateUserPage
