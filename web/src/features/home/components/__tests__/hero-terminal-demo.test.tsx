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
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { HeroTerminalDemo } from '../hero-terminal-demo'

let reduced = false

beforeEach(() => {
  reduced = false
  vi.useFakeTimers()
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query.includes('prefers-reduced-motion') && reduced,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }))
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it('pauses automatic protocol changes and keeps manual selection available', () => {
  render(<HeroTerminalDemo />)
  act(() => vi.advanceTimersByTime(5000))
  expect(screen.getByRole('button', { name: 'Responses' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  fireEvent.click(screen.getByRole('button', { name: 'Pause animation' }))
  act(() => vi.advanceTimersByTime(10000))
  expect(screen.getByRole('button', { name: 'Responses' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  fireEvent.click(screen.getByRole('button', { name: 'Chat' }))
  expect(screen.getByRole('button', { name: 'Chat' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  expect(screen.getByText('/v1/chat/completions')).toBeVisible()
})

it('disables automatic playback for reduced motion while allowing protocol selection', () => {
  reduced = true
  render(<HeroTerminalDemo />)
  expect(screen.getByRole('button', { name: 'Play animation' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Gemini' }))
  act(() => vi.advanceTimersByTime(10000))
  expect(screen.getByRole('button', { name: 'Gemini' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
})
