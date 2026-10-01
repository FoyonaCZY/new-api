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
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { LayoutProvider, useLayout } from '@/context/layout-provider'
import { getCookie, removeCookie, setCookie } from '@/lib/cookies'

function LayoutControls() {
  const layout = useLayout()
  return (
    <>
      <output aria-label='Layout'>{layout.variant}</output>
      <button type='button' onClick={() => layout.setVariant('floating')}>
        Float sidebar
      </button>
      <button type='button' onClick={layout.resetLayout}>
        Reset layout
      </button>
    </>
  )
}

function clearLayoutPreferences() {
  removeCookie('layout_variant')
  removeCookie('layout_collapsible')
}

beforeEach(clearLayoutPreferences)
afterEach(clearLayoutPreferences)

describe('layout preferences', () => {
  it('uses an edge-to-edge sidebar for a new visitor', () => {
    render(
      <LayoutProvider>
        <LayoutControls />
      </LayoutProvider>
    )
    expect(screen.getByLabelText('Layout')).toHaveTextContent('sidebar')
  })

  it('retains an explicitly saved layout preference', () => {
    setCookie('layout_variant', 'inset')
    render(
      <LayoutProvider>
        <LayoutControls />
      </LayoutProvider>
    )
    expect(screen.getByLabelText('Layout')).toHaveTextContent('inset')
  })

  it('saves layout changes and resets to the new default', async () => {
    const user = userEvent.setup()
    render(
      <LayoutProvider>
        <LayoutControls />
      </LayoutProvider>
    )
    await user.click(screen.getByRole('button', { name: 'Float sidebar' }))
    expect(getCookie('layout_variant')).toBe('floating')
    await user.click(screen.getByRole('button', { name: 'Reset layout' }))
    expect(screen.getByLabelText('Layout')).toHaveTextContent('sidebar')
    expect(getCookie('layout_variant')).toBe('sidebar')
  })
})
