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
import { describe, expect, test } from 'vitest'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'

describe('underlined tab navigation', () => {
  test.each(['default', 'line'] as const)(
    '%s tabs keep the underline state aligned with keyboard selection and prevent disabled activation',
    async (variant) => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue='requests'>
          <TabsList variant={variant} aria-label='Usage metric'>
            <TabsTrigger value='requests'>Requests</TabsTrigger>
            <TabsTrigger value='tokens' disabled>
              Tokens
            </TabsTrigger>
            <TabsTrigger value='latency'>Latency</TabsTrigger>
          </TabsList>
          <TabsContent value='requests'>Request history</TabsContent>
          <TabsContent value='tokens'>Token history</TabsContent>
          <TabsContent value='latency'>Response time history</TabsContent>
        </Tabs>
      )

      const requests = screen.getByRole('tab', { name: 'Requests' })
      const latency = screen.getByRole('tab', { name: 'Latency' })
      expect(requests).toHaveAttribute('aria-selected', 'true')
      expect(requests).toHaveAttribute('data-active')
      expect(screen.getByRole('tab', { name: 'Tokens' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )

      await user.tab()
      expect(requests).toHaveFocus()
      await user.keyboard('{ArrowRight}{Enter}')
      expect(screen.getByRole('tab', { name: 'Tokens' })).toHaveAttribute(
        'aria-selected',
        'false'
      )
      expect(requests).toHaveAttribute('data-active')
      expect(screen.getByRole('tabpanel', { name: 'Requests' })).toBeVisible()

      await user.keyboard('{ArrowRight}{Enter}')

      expect(latency).toHaveFocus()
      expect(latency).toHaveAttribute('aria-selected', 'true')
      expect(latency).toHaveAttribute('data-active')
      expect(requests).toHaveAttribute('aria-selected', 'false')
      expect(requests).not.toHaveAttribute('data-active')
      expect(
        screen.getByRole('tabpanel', { name: 'Latency' })
      ).toHaveTextContent('Response time history')
      expect(screen.queryByText('Request history')).not.toBeInTheDocument()
    }
  )
})
