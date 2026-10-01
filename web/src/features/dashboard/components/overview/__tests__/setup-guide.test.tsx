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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { useSystemConfigStore } from '@/stores/system-config-store'

import { OverviewDashboard } from '../overview-dashboard'

const storageKey = 'dashboard_overview_setup_guide_expanded'
let client: QueryClient
let keyLookupError: Error | null
let hasApiKey: boolean

beforeEach(() => {
  window.localStorage.clear()
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
  useAuthStore.getState().auth.setUser({
    id: 1,
    username: 'dashboard-user',
    role: 1,
    quota: 1000000,
    used_quota: 1000,
    request_count: 1,
  })
  client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  keyLookupError = null
  hasApiKey = true
  vi.spyOn(api, 'get').mockImplementation(async (url) => {
    switch (url) {
      case '/api/token/?p=1&size=10':
        if (keyLookupError) throw keyLookupError
        return {
          data: {
            success: true,
            data: {
              items: hasApiKey
                ? [{ id: 1, name: 'App key', key: 'masked', status: 1 }]
                : [],
            },
          },
        }
      case '/api/status':
        return {
          data: {
            data: {
              api_info_enabled: false,
              announcements_enabled: false,
              faq_enabled: false,
              uptime_kuma_enabled: false,
            },
          },
        }
      case '/api/user/models':
        return { data: { success: true, data: ['gpt-4o-mini'] } }
      case '/api/data/self':
        return {
          data: {
            success: true,
            data: [{ created_at: 1780000000, quota: 125000, count: 8 }],
          },
        }
      case '/api/perf-metrics/summary':
        return { data: { success: true, data: { models: [], summary: null } } }
      default:
        throw new Error(`Unexpected dashboard request: ${url}`)
    }
  })
})

afterEach(() => {
  cleanup()
  client.clear()
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
  window.localStorage.clear()
})

async function renderOverview() {
  const router = createRouter({
    routeTree: createRootRoute({ component: OverviewDashboard }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

describe('overview setup guide', () => {
  it('keeps balance, recent usage, historical usage and request counts visible in the usage section', async () => {
    await renderOverview()

    const usage = await screen.findByRole('region', { name: 'Usage' })
    expect(await within(usage).findByText('$0.25')).toBeVisible()
    expect(within(usage).getByText('$2')).toBeVisible()
    expect(within(usage).getByText('$0.002')).toBeVisible()
    expect(within(usage).getByText('1')).toBeVisible()
    expect(
      within(usage).getByRole('button', { name: 'Wallet' })
    ).toHaveAttribute('href', '/wallet')
  })

  it('keeps request examples keyboard scrollable and fetches the real key only when copying', async () => {
    const user = userEvent.setup()
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue()
    const fetchKey = vi.spyOn(api, 'post').mockResolvedValue({
      data: { success: true, data: { key: 'test-real-key' } },
    })
    window.localStorage.setItem(storageKey, 'expanded')
    await renderOverview()

    const copy = await screen.findByRole('button', {
      name: 'Copy ready-to-run curl',
    })
    const preview = screen.getByLabelText('First API request')
    expect(preview).toHaveAttribute('tabindex', '0')
    expect(preview).toHaveClass('overflow-x-auto')
    expect(preview).toHaveTextContent('sk-masked')
    expect(fetchKey).not.toHaveBeenCalled()

    await user.click(copy)
    expect(fetchKey).toHaveBeenCalledWith('/api/token/1/key')
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Authorization: Bearer sk-test-real-key')
    )
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('"model":"gpt-4o-mini"')
    )
    expect(preview).not.toHaveTextContent('test-real-key')
  })

  it('offers key creation instead of copying when the account has no API key', async () => {
    hasApiKey = false
    await renderOverview()

    expect(
      await screen.findByText('Create an API key to unlock the real request')
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Copy ready-to-run curl' })
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Create API Key' })
    ).toHaveLength(2)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it.each([
    { role: 1, admin: false },
    { role: 10, admin: true },
  ])(
    'shows channel and service health entry points only for administrators ($role)',
    async ({ role, admin }) => {
      useAuthStore.getState().auth.setUser({
        id: 1,
        username: 'dashboard-user',
        role,
        quota: 1000000,
      })
      window.localStorage.setItem(storageKey, 'expanded')
      await renderOverview()
      await screen.findByRole('button', { name: 'Hide setup guide' })

      if (admin) {
        expect(
          screen.getByRole('button', { name: /^Channels/ })
        ).toHaveAttribute('href', '/channels')
        expect(
          screen.getByRole('heading', { name: 'Performance health' })
        ).toBeVisible()
      } else {
        expect(
          screen.queryByRole('button', { name: /^Channels/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('heading', { name: 'Performance health' })
        ).not.toBeInTheDocument()
      }
    }
  )

  it('shows usage first and only a header entry when setup is complete', async () => {
    await renderOverview()

    const toggle = await screen.findByRole('button', { name: 'Setup guide' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.getAllByRole('heading').map((heading) => heading.textContent)
    ).toEqual(['Overview', 'Usage'])
    expect(screen.queryByText('Setup guide complete')).not.toBeInTheDocument()
    expect(screen.queryByText('Setup progress: 3/3')).not.toBeInTheDocument()
    for (const name of ['API Keys', 'Channels', 'Usage Logs', 'Pricing']) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument()
    }
    const panel = document.querySelector(
      `[id="${toggle.getAttribute('aria-controls')}"]`
    )
    expect(panel).toBeInTheDocument()
    expect(panel).not.toBeVisible()
  })

  it('toggles the completed guide with the keyboard and restores focus after hiding it', async () => {
    const user = userEvent.setup()
    await renderOverview()
    const toggle = await screen.findByRole('button', { name: 'Setup guide' })

    await user.tab()
    expect(toggle).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(
      document.querySelector(`[id="${toggle.getAttribute('aria-controls')}"]`)
    ).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: 'Setup guide',
      })
    ).toBeVisible()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^API Keys/ })).toBeVisible()
    )

    await user.keyboard(' ')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
    await user.click(toggle)
    await user.click(screen.getByRole('button', { name: 'Hide setup guide' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('restores the completed guide preference after remounting', async () => {
    const user = userEvent.setup()
    const first = await renderOverview()
    await user.click(await screen.findByRole('button', { name: 'Setup guide' }))
    first.unmount()

    const second = await renderOverview()
    expect(
      await screen.findByRole('button', { name: 'Setup guide' })
    ).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('button', { name: 'Hide setup guide' }))
    second.unmount()

    await renderOverview()
    expect(
      await screen.findByRole('button', { name: 'Setup guide' })
    ).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Setup guide complete')).not.toBeInTheDocument()
  })

  it('keeps the existing progress banner when an incomplete guide is manually collapsed', async () => {
    const user = userEvent.setup()
    useAuthStore
      .getState()
      .auth.setUser({ id: 1, username: 'new-user', role: 1 })
    await renderOverview()

    await user.click(
      await screen.findByRole('button', { name: 'Hide setup guide' })
    )
    expect(screen.getByText('Setup progress: 1/3')).toBeVisible()
    expect(screen.getByRole('button', { name: 'API Keys' })).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Setup guide' })
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Show setup guide' }))
    expect(
      screen.getByRole('button', { name: 'Hide setup guide' })
    ).toBeVisible()
  })

  it('removes the collapsed progress banner when the remaining setup step completes', async () => {
    useAuthStore.getState().auth.setUser({
      id: 1,
      username: 'dashboard-user',
      role: 1,
      quota: 1000000,
    })
    window.localStorage.setItem(storageKey, 'collapsed')
    await renderOverview()
    expect(await screen.findByText('Setup progress: 2/3')).toBeVisible()

    act(() => {
      useAuthStore.getState().auth.setUser({
        id: 1,
        username: 'dashboard-user',
        role: 1,
        quota: 1000000,
        request_count: 1,
      })
    })
    expect(
      await screen.findByRole('button', { name: 'Setup guide' })
    ).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(/Setup progress:/)).not.toBeInTheDocument()
  })

  it('does not show a completed setup entry when the key lookup fails', async () => {
    keyLookupError = new Error('Key lookup unavailable')
    await renderOverview()

    expect(
      await screen.findByRole('button', { name: 'Hide setup guide' })
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Setup guide' })
    ).not.toBeInTheDocument()
  })
})
