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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { ArtBackdrop } from '@/components/art-backdrop'
import { HeaderLogo } from '@/components/layout/components/header-logo'
import { SiteBrandName } from '@/components/site-brand-name'
import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading, logoLoaded } = useSystemConfig()

  return (
    <div className='aelion-auth relative grid max-w-none'>
      <Link
        to='/'
        className='absolute top-4 left-4 z-10 flex max-w-[calc(100%-2rem)] min-w-0 items-center gap-2 transition-opacity hover:opacity-80 sm:top-8 sm:left-8 sm:max-w-[calc(100%-4rem)]'
      >
        <div className='relative size-8 shrink-0'>
          {loading ? (
            <Skeleton className='absolute inset-0 rounded-full' />
          ) : (
            <HeaderLogo
              src={logo}
              alt={t('Logo')}
              loading={loading}
              logoLoaded={logoLoaded}
              className='size-8 object-contain'
            />
          )}
        </div>
        {loading ? (
          <Skeleton className='h-6 w-24' />
        ) : (
          <h1 className='min-w-0 truncate text-xl font-medium'>
            <SiteBrandName name={systemName} />
          </h1>
        )}
      </Link>
      <div className='aelion-auth-art'>
        <ArtBackdrop priority />
      </div>
      <div className='aelion-auth-form container flex items-center'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 px-4 py-8 sm:w-[480px] sm:p-8'>
          {children}
        </div>
      </div>
    </div>
  )
}
