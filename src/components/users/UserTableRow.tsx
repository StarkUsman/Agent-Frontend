import { useNavigate } from 'react-router-dom'
import { MdOutlineEdit, MdOutlineDeleteOutline } from 'react-icons/md'
import UserAvatar from './UserAvatar'

// ── Types ──────────────────────────────────────────────────────────────────
export type UserRole = 'Admin' | 'Manager' | 'Agent' | 'Viewer'

export interface UserRowData {
  id: number
  first_name: string
  last_name: string
  username: string
  email: string
  password: string
  role: UserRole
  profile_pic: string
  organisation_name: string
}

// ── Sub-components ─────────────────────────────────────────────────────────
const ROLE_STYLES: Record<UserRole, string> = {
  Admin:   'border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30',
  Manager: 'border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30',
  Agent:   'border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30',
  Viewer:  'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800',
}

const RoleBadge = ({ role }: { role: UserRole }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${ROLE_STYLES[role]}`}>
    {role}
  </span>
)

// ── Row component ──────────────────────────────────────────────────────────
interface UserTableRowProps extends UserRowData {
  onDelete: (id: number) => void
}

const UserTableRow = ({
  id,
  first_name,
  last_name,
  username,
  email,
  role,
  profile_pic,
  organisation_name,
  onDelete,
}: UserTableRowProps) => {
  const navigate = useNavigate()

  return (
    <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors group">

      {/* User */}
      <td className="py-4 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <UserAvatar id={id} firstName={first_name} lastName={last_name} profilePic={profile_pic} />
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {first_name} {last_name}
          </p>
        </div>
      </td>

      {/* Username */}
      <td className="py-4 px-4">
        <span className="text-sm text-slate-600 dark:text-slate-400">{username}</span>
      </td>

      {/* Email */}
      <td className="py-4 px-4">
        <span className="text-sm text-slate-600 dark:text-slate-400">{email}</span>
      </td>

      {/* Role */}
      <td className="py-4 px-4">
        <RoleBadge role={role} />
      </td>

      {/* Organisation */}
      <td className="py-4 px-4">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{organisation_name}</span>
      </td>

      {/* Actions */}
      <td className="py-4 pl-4 pr-6">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/users/${id}/edit`)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            title="Edit user"
            aria-label="Edit user"
          >
            <MdOutlineEdit className="text-lg" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 transition-colors cursor-pointer"
            title="Delete user"
            aria-label="Delete user"
          >
            <MdOutlineDeleteOutline className="text-lg" />
          </button>
        </div>
      </td>

    </tr>
  )
}

export default UserTableRow
