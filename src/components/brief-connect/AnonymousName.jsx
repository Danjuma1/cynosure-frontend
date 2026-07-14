/**
 * Renders a Brief Connect identity — either a real name or an anonymized
 * handle ("Lawyer #A1B2" / "Applicant #C3D4"). Anonymized handles get a
 * muted eye-slash badge so users understand why no name is shown yet.
 */
import { EyeSlashIcon } from '@heroicons/react/24/outline'
import { isAnonymizedName } from '@/utils/helpers'

export default function AnonymousName({ name, className = '' }) {
  if (!isAnonymizedName(name)) {
    return <span className={className}>{name}</span>
  }

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      title="Identity is hidden until you both connect on an accepted engagement"
    >
      <EyeSlashIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
      {name}
    </span>
  )
}
