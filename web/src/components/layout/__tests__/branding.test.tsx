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
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { SiteBrandName } from '@/components/site-brand-name'

import { HeaderLogo } from '../components/header-logo'

afterEach(() => vi.unstubAllEnvs())

describe('operator logo', () => {
  test('Aelion uses its accessible local mark without waiting for an unrelated project logo', () => {
    vi.stubEnv('VITE_SITE_BRAND', 'Aelion')
    render(
      <HeaderLogo
        src='/logo.png'
        loading={false}
        logoLoaded={false}
        className='size-8'
      />
    )
    const logo = screen.getByRole('img', { name: 'Aelion' })
    expect(logo).toHaveClass('aelion-brand-mark', 'opacity-100', 'size-8')
    expect(logo).not.toHaveAttribute('src')
  })

  test.each(['', 'Another operator'])(
    'brand %s retains the configured project image and its loading state',
    (operator) => {
      vi.stubEnv('VITE_SITE_BRAND', operator)
      const view = render(
        <HeaderLogo
          src='/custom-project-logo.svg'
          alt='Project logo'
          loading={false}
          logoLoaded={false}
        />
      )
      const logo = screen.getByRole('img', { name: 'Project logo' })
      expect(logo).toHaveAttribute('src', '/custom-project-logo.svg')
      expect(logo).toHaveClass('opacity-0')
      expect(logo).not.toHaveClass('aelion-brand-mark')

      view.rerender(
        <HeaderLogo
          src='/custom-project-logo.svg'
          alt='Project logo'
          loading={false}
          logoLoaded
        />
      )
      expect(logo).toHaveClass('opacity-100')
    }
  )

  test('long operator names retain their full accessible text and title', () => {
    const name = 'Aelion — a long organization name for the model service'
    vi.stubEnv('VITE_SITE_BRAND', name)
    render(<SiteBrandName name='New API' />)
    expect(screen.getByText(name)).toHaveAttribute('title', name)
    expect(screen.queryByText('New API')).not.toBeInTheDocument()
  })
})
