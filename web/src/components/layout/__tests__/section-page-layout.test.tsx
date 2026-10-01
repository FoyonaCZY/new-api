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
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SiteBrandName } from '@/components/site-brand-name'
import { Button } from '@/components/ui/button'

import { PageFooterPortal } from '../components/page-footer'
import { SectionPageLayout } from '../components/section-page-layout'

afterEach(() => vi.unstubAllEnvs())

function PageFixture() {
  const [count, setCount] = useState(0)
  return (
    <SectionPageLayout fixedContent stackActionsOnMobile>
      <SectionPageLayout.Title>Requests</SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <Button onClick={() => setCount(count + 1)}>Refresh</Button>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        <output aria-label='Refresh count'>{count}</output>
        <PageFooterPortal>
          <Button>Next page</Button>
        </PageFooterPortal>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}

describe('shared page layout', () => {
  it('keeps page actions and content interactive with the decorative heading', () => {
    render(<PageFixture />)
    expect(screen.getByRole('heading', { name: 'Requests' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(screen.getByLabelText('Refresh count')).toHaveTextContent('1')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('keeps pagination available outside the scrolling content', () => {
    render(<PageFixture />)
    const main = screen.getByRole('main')
    expect(
      within(main).getByRole('button', { name: 'Next page' })
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Next page' }).closest('main')
    ).toBe(main)
  })

  it('keeps actions outside the artwork and reachable before pagination', async () => {
    const user = userEvent.setup()
    render(<PageFixture />)
    const heading = screen.getByRole('heading', { name: 'Requests' })
    const refresh = screen.getByRole('button', { name: 'Refresh' })
    expect(heading.closest('header')).not.toContainElement(refresh)
    await user.tab()
    expect(refresh).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('Refresh count')).toHaveTextContent('1')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveFocus()
  })
})

describe('operator branding', () => {
  it('shows only the configured operator name in the header brand', () => {
    vi.stubEnv('VITE_SITE_BRAND', 'Aelion')
    render(<SiteBrandName name='New API' />)
    expect(screen.getByText('Aelion')).toBeVisible()
    expect(screen.queryByText('New API')).not.toBeInTheDocument()
  })

  it('uses the original brand when no operator is configured', () => {
    vi.stubEnv('VITE_SITE_BRAND', '')
    render(<SiteBrandName name='New API' />)
    expect(screen.getByText('New API')).toBeVisible()
    expect(screen.queryByText('Aelion')).not.toBeInTheDocument()
  })
})
