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
import { useState } from 'react'
import { expect, it } from 'vitest'

import type { DataTableViewMode } from '../../hooks/use-data-table-view-mode'
import { DataTableViewModeToggle } from '../view-mode-toggle'

function ViewModeFixture() {
  const [mode, setMode] = useState<DataTableViewMode>('table')
  return <DataTableViewModeToggle value={mode} onChange={setMode} />
}

it('keeps the selected view and keyboard focus in sync when switching modes', async () => {
  const user = userEvent.setup()
  render(<ViewModeFixture />)
  const card = screen.getByRole('button', { name: 'Card view' })
  const table = screen.getByRole('button', { name: 'Table view' })
  expect(table).toHaveAttribute('aria-pressed', 'true')
  await user.tab()
  expect(card).toHaveFocus()
  await user.keyboard(' ')
  expect(card).toHaveAttribute('aria-pressed', 'true')
  expect(table).toHaveAttribute('aria-pressed', 'false')
  await user.tab()
  await user.keyboard('{Enter}')
  expect(table).toHaveAttribute('aria-pressed', 'true')
  expect(card).toHaveAttribute('aria-pressed', 'false')
})
