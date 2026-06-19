import { useState } from 'react'

// ── Deterministic color palette for initials fallback ──────────────────────
const PALETTE = ['#6366f1', '#0891b2', '#7c3aed', '#0d9488', '#b45309', '#be185d', '#15803d', '#0369a1']

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  lg: 'w-20 h-20 text-2xl',
} as const

interface UserAvatarProps {
  id: number
  firstName: string
  lastName: string
  profilePic?: string
  size?: keyof typeof SIZE_CLASSES
}

const UserAvatar = ({ id, firstName, lastName, profilePic, size = 'sm' }: UserAvatarProps) => {
  const [imgError, setImgError] = useState(false)
  const sizeClass = SIZE_CLASSES[size]

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  const color = PALETTE[id % PALETTE.length]

  const fallback = (
    <span
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  )

  if (profilePic && !imgError) {
    return (
      <img
        src={profilePic}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
        onError={() => setImgError(true)}
      />
    )
  }

  return fallback
}

export default UserAvatar
