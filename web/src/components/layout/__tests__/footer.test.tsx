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
  RouterContextProvider,
} from '@tanstack/react-router'
import { act, render, screen, within } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { STATUS_QUERY_KEY } from '@/lib/status-query'
import { useSystemConfigStore } from '@/stores/system-config-store'

import { Footer } from '../components/footer'

let client: QueryClient
const originalConfig = useSystemConfigStore.getState().config

function renderFooter(props: ComponentProps<typeof Footer> = {}) {
  const router = createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(
    <QueryClientProvider client={client}>
      <RouterContextProvider router={router}>
        <Footer {...props} />
      </RouterContextProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.stubEnv('VITE_SITE_BRAND', '')
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  client.setQueryData(STATUS_QUERY_KEY, {})
  useSystemConfigStore.getState().setConfig({
    systemName: 'New API',
    logo: '/logo.png',
    footerHtml: undefined,
    demoSiteEnabled: false,
  })
})

afterEach(() => {
  client.clear()
  useSystemConfigStore.getState().setConfig(originalConfig)
  vi.unstubAllEnvs()
})

describe('footer', () => {
  it('keeps the configured project identity and attribution visible alongside Aelion', () => {
    vi.stubEnv('VITE_SITE_BRAND', 'Aelion')
    const { container } = renderFooter()
    expect(screen.getByRole('link', { name: 'Aelion' })).toHaveAttribute(
      'href',
      '/'
    )
    expect(screen.getAllByText('New API').length).toBeGreaterThan(0)
    expect(container.querySelector('img[src="/logo.png"]')).toBeVisible()
    expect(screen.getByRole('link', { name: 'New API' })).toHaveAttribute(
      'href',
      'https://github.com/QuantumNous/new-api'
    )
    expect(screen.getByRole('link', { name: 'QuantumNous' })).toHaveAttribute(
      'href',
      'https://github.com/QuantumNous'
    )
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'footer.newapi.projectAttributionSuffix'
    )
  })

  it('uses configured name and logo when no operator brand is set', () => {
    useSystemConfigStore.getState().setConfig({
      systemName: 'Configured Gateway',
      logo: '/configured-logo.svg',
    })
    const { container } = renderFooter({ copyright: 'Configured copyright' })
    expect(
      screen.getByRole('link', { name: 'Configured Gateway' })
    ).toHaveAttribute('href', '/')
    expect(
      container.querySelector('img[src="/configured-logo.svg"]')
    ).toBeVisible()
    expect(screen.getByText(/Configured copyright/)).toBeVisible()
    expect(screen.queryByText('Aelion')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'New API' })).toBeVisible()
  })

  it('preserves custom HTML, enabled legal links and attribution without adding default navigation', () => {
    vi.stubEnv('VITE_SITE_BRAND', 'Aelion')
    client.setQueryData(STATUS_QUERY_KEY, {
      user_agreement_enabled: true,
      privacy_policy_enabled: true,
    })
    useSystemConfigStore.getState().setConfig({
      footerHtml:
        '<p>Configured footer <a href="https://example.com/support">Support</a></p>',
    })
    renderFooter()
    expect(screen.getByText(/Configured footer/)).toBeVisible()
    expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute(
      'href',
      'https://example.com/support'
    )
    expect(
      screen.getByRole('link', { name: 'User Agreement' })
    ).toHaveAttribute('href', '/user-agreement')
    expect(
      screen.getByRole('link', { name: 'Privacy Policy' })
    ).toHaveAttribute('href', '/privacy-policy')
    expect(screen.getByRole('link', { name: 'New API' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'QuantumNous' })).toBeVisible()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('preserves demo project links and removes them when demo mode is disabled', () => {
    useSystemConfigStore.getState().setConfig({ demoSiteEnabled: true })
    renderFooter()
    const docs = screen.getByRole('navigation', {
      name: 'footer.columns.docs.title',
    })
    const apiDocs = within(docs).getByRole('link', {
      name: 'footer.columns.docs.links.apiDocs',
    })
    expect(apiDocs).toHaveAttribute('href', 'https://docs.newapi.pro/api/')
    expect(apiDocs).toHaveAttribute('rel', 'noopener noreferrer')
    expect(
      screen.getByRole('link', {
        name: 'footer.columns.related.links.newApiKeyTool',
      })
    ).toHaveAttribute('href', 'https://github.com/Calcium-Ion/new-api-key-tool')
    act(() =>
      useSystemConfigStore.getState().setConfig({ demoSiteEnabled: false })
    )
    expect(
      screen.queryByRole('navigation', { name: 'footer.columns.docs.title' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Platform' })).toBeVisible()
  })

  it('uses the configured platform navigation and omits disabled pages and legal links', () => {
    client.setQueryData(STATUS_QUERY_KEY, {
      HeaderNavModules: { pricing: false, rankings: false, about: false },
      docs_link: 'https://example.com/docs',
    })
    renderFooter()
    const platform = screen.getByRole('navigation', { name: 'Platform' })
    expect(
      within(platform).getByRole('link', { name: 'Console' })
    ).toHaveAttribute('href', '/dashboard')
    expect(
      within(platform).getByRole('link', { name: 'Docs' })
    ).toHaveAttribute('href', 'https://example.com/docs')
    expect(
      within(platform).queryByRole('link', { name: 'Model Square' })
    ).not.toBeInTheDocument()
    expect(
      within(platform).queryByRole('link', { name: 'Rankings' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'User Agreement' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Privacy Policy' })
    ).not.toBeInTheDocument()
  })

  it('uses supplied footer columns in demo mode without restoring the default columns', () => {
    useSystemConfigStore.getState().setConfig({ demoSiteEnabled: true })
    renderFooter({
      columns: [
        {
          title: 'Resources',
          links: [{ text: 'Support', href: 'https://example.com/support' }],
        },
      ],
    })
    const resources = screen.getByRole('navigation', { name: 'Resources' })
    expect(
      within(resources).getByRole('link', { name: 'Support' })
    ).toHaveAttribute('href', 'https://example.com/support')
    expect(
      screen.queryByRole('navigation', { name: 'footer.columns.docs.title' })
    ).not.toBeInTheDocument()
  })
})
