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
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSystemConfigStore } from '@/stores/system-config-store'

import { PlatformSections } from '../platform-sections'

let reducedMotion: boolean

beforeEach(() => {
  reducedMotion = false
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query.includes('prefers-reduced-motion') && reducedMotion,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }))
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      callback: IntersectionObserverCallback
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }
      observe(target: Element) {
        this.callback(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver
        )
      }
      unobserve() {}
      disconnect() {}
    }
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
})

async function renderSections(isAuthenticated = false) {
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => <PlatformSections isAuthenticated={isAuthenticated} />,
    }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  return render(<RouterProvider router={router} />)
}

describe('homepage platform sections', () => {
  it('reserves space for the lazy decorative artwork without adding it to the accessible content', async () => {
    const { container } = await renderSections()
    const artwork = container.querySelector('img')
    expect(artwork).toHaveAttribute('loading', 'lazy')
    expect(artwork).toHaveAttribute('width', '1672')
    expect(artwork).toHaveAttribute('height', '941')
    expect(artwork).toHaveAttribute('alt', '')
    expect(artwork).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('switches feature examples with the tabs and labels them as examples', async () => {
    const user = userEvent.setup()
    await renderSections()

    const protocols = screen.getByRole('tabpanel', {
      name: 'Multi-protocol Compatible',
    })
    expect(within(protocols).getByText('Chat Completions')).toBeVisible()
    expect(within(protocols).getByText('Example')).toBeVisible()

    await user.click(screen.getByRole('tab', { name: 'Usage Logs' }))
    const usage = screen.getByRole('tabpanel', { name: 'Usage Logs' })
    expect(within(usage).getByText('Input Tokens')).toBeVisible()
    expect(within(usage).getByText('Cost')).toBeVisible()
    expect(within(usage).getByText('Example')).toBeVisible()
    expect(
      within(usage).getByRole('button', { name: 'Usage Logs' })
    ).toHaveAttribute('href', '/usage-logs')
    expect(screen.queryByText('Chat Completions')).not.toBeInTheDocument()
  })

  it('supports keyboard tab selection and keeps focus on the selected feature', async () => {
    const user = userEvent.setup()
    await renderSections()
    screen.getByRole('tab', { name: 'Multi-protocol Compatible' }).focus()

    await user.keyboard('{ArrowRight}{Enter}')

    const routing = screen.getByRole('tab', { name: 'Channels' })
    expect(routing).toHaveFocus()
    expect(routing).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('tabpanel', { name: 'Channels' })
    ).toHaveTextContent('Fallback')
  })

  it('preserves the animation pause setting when switching examples and resumes by keyboard', async () => {
    const user = userEvent.setup()
    await renderSections()
    const section = screen.getByRole('region', { name: 'Core Features' })

    await user.click(screen.getByRole('button', { name: 'Pause animation' }))
    expect(section).toHaveAttribute('data-animation-paused', 'true')
    expect(
      screen.getByRole('button', { name: 'Play animation' })
    ).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('tab', { name: 'API Keys' }))
    expect(section).toHaveAttribute('data-animation-paused', 'true')
    const play = screen.getByRole('button', { name: 'Play animation' })
    play.focus()
    await user.keyboard(' ')

    expect(section).toHaveAttribute('data-animation-paused', 'false')
    expect(
      screen.getByRole('button', { name: 'Pause animation' })
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('keeps animation paused under reduced motion while feature tabs remain usable', async () => {
    reducedMotion = true
    const user = userEvent.setup()
    await renderSections()

    const play = screen.getByRole('button', { name: 'Play animation' })
    expect(play).toBeDisabled()
    expect(play).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('region', { name: 'Core Features' })
    ).toHaveAttribute('data-animation-paused', 'true')

    await user.click(screen.getByRole('tab', { name: 'API Keys' }))
    expect(
      screen.getByRole('tabpanel', { name: 'API Keys' })
    ).toHaveTextContent('Model Limits')
  })

  it('copies only the public API base URL and provides working setup destinations', async () => {
    const user = userEvent.setup()
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue()
    await renderSections()

    await user.click(screen.getByRole('button', { name: 'Copy API URL' }))

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/v1`)
    expect(screen.getByRole('button', { name: 'Copied' })).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Create API Key' })
    ).toHaveAttribute('href', '/sign-up')
    expect(screen.getByRole('button', { name: 'Playground' })).toHaveAttribute(
      'href',
      '/playground'
    )
  })

  it('sends signed-in users directly to API key management', async () => {
    await renderSections(true)
    expect(
      screen.getByRole('button', { name: 'Create API Key' })
    ).toHaveAttribute('href', '/keys')
  })

  it('uses the configured project name when no operator brand is set', async () => {
    vi.stubEnv('VITE_SITE_BRAND', '')
    useSystemConfigStore.getState().setConfig({ systemName: 'New API' })
    await renderSections()
    expect(
      within(
        screen.getByRole('tabpanel', { name: 'Multi-protocol Compatible' })
      ).getByText('New API')
    ).toBeVisible()
  })
})
