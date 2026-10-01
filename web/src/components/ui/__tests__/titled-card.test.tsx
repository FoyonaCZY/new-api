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
import { describe, expect, test, vi } from 'vitest'

import { Button } from '../button'
import { TitledCard } from '../titled-card'

describe('settings section layout', () => {
  test('a long section heading allows actions to stack on mobile and remain usable', async () => {
    const onSave = vi.fn()
    render(
      <TitledCard
        title='Manage interface preferences across all of your connected devices'
        description='Preferences are applied to each signed-in device.'
        icon={<svg aria-label='Preferences decoration' />}
        action={<Button onClick={onSave}>Save preferences</Button>}
      >
        <p>Available interface languages</p>
      </TitledCard>
    )

    const title = screen.getByText(
      'Manage interface preferences across all of your connected devices'
    )
    expect(title).not.toHaveClass('truncate', 'whitespace-nowrap')
    const action = screen.getByRole('button', { name: 'Save preferences' })
    expect(action.parentElement).toHaveClass('w-full', 'sm:w-auto')
    expect(action.parentElement?.parentElement).toHaveClass(
      'flex-col',
      'sm:flex-row'
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(
      screen.getByLabelText('Preferences decoration').parentElement
    ).toHaveAttribute('aria-hidden', 'true')

    await userEvent.click(action)
    expect(onSave).toHaveBeenCalledOnce()
  })
})
