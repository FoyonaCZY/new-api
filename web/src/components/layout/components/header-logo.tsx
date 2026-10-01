/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { cn } from '@/lib/utils'

interface HeaderLogoProps {
  src: string
  alt?: string
  loading: boolean
  logoLoaded: boolean
  className?: string
}

/**
 * Operator mark or the configured project logo, retaining the shared loading state.
 */
export function HeaderLogo(props: HeaderLogoProps) {
  if (import.meta.env.VITE_SITE_BRAND?.trim() === 'Aelion') {
    return (
      <span
        role='img'
        aria-label={props.alt || 'Aelion'}
        className={cn(
          'aelion-brand-mark block size-6 shrink-0 transition-opacity duration-200',
          props.loading ? 'opacity-0' : 'opacity-100',
          props.className
        )}
      />
    )
  }

  return (
    <img
      src={props.src}
      alt={props.alt || 'logo'}
      className={cn(
        'h-6 w-6 rounded-full transition-opacity duration-200',
        !props.loading && props.logoLoaded ? 'opacity-100' : 'opacity-0',
        props.className
      )}
    />
  )
}
