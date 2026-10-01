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
import { Link } from '@tanstack/react-router'
import { Fragment, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { useTopNavLinks } from '@/hooks/use-top-nav-links'
import { cn } from '@/lib/utils'

interface FooterLink {
  text: string
  href: string
}

interface FooterColumnProps {
  title: string
  links: FooterLink[]
}

interface FooterProps {
  logo?: string
  name?: string
  columns?: FooterColumnProps[]
  copyright?: string
  className?: string
}

const NEW_API_FOOTER_ATTRIBUTION_KEY = [
  'footer',
  'new' + 'api',
  'projectAttributionSuffix',
].join('.')

function FooterLinkItem(props: { link: FooterLink }) {
  const { t } = useTranslation()
  const isExternal = props.link.href.startsWith('http')
  const label = t(props.link.text)

  if (isExternal) {
    return (
      <a
        href={props.link.href}
        target='_blank'
        rel='noopener noreferrer'
        className='text-muted-foreground hover:text-primary inline-block py-1 text-sm leading-6 transition-colors duration-200 hover:underline hover:underline-offset-4'
      >
        {label}
      </a>
    )
  }

  return (
    <Link
      to={props.link.href}
      className='text-muted-foreground hover:text-primary inline-block py-1 text-sm leading-6 transition-colors duration-200 hover:underline hover:underline-offset-4'
    >
      {label}
    </Link>
  )
}

// Renders User Agreement / Privacy Policy links inline with the parent's
// copyright row when either is configured in System Settings → Site. Emits
// fragmented siblings so the parent flex container's gap controls spacing.
function LegalLinks(props: { leadingSeparator?: boolean }) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const items: { key: string; label: string; href: string }[] = []
  if (status?.user_agreement_enabled) {
    items.push({
      key: 'user-agreement',
      label: t('User Agreement'),
      href: '/user-agreement',
    })
  }
  if (status?.privacy_policy_enabled) {
    items.push({
      key: 'privacy-policy',
      label: t('Privacy Policy'),
      href: '/privacy-policy',
    })
  }
  if (items.length === 0) {
    return null
  }
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={item.key}>
          {(props.leadingSeparator || index > 0) && (
            <span aria-hidden='true' className='text-muted-foreground/30'>
              ·
            </span>
          )}
          <Link
            to={item.href}
            className='hover:text-foreground transition-colors duration-200'
          >
            {item.label}
          </Link>
        </Fragment>
      ))}
    </>
  )
}

// inline=true returns just the inner span for composition in a parent flex
// row. inline=false wraps in a centered/right-aligned div (default).
function ProjectAttribution(props: { currentYear: number; inline?: boolean }) {
  const { t } = useTranslation()
  const content = (
    <span className='text-muted-foreground'>
      &copy; {props.currentYear}{' '}
      <a
        href='https://github.com/QuantumNous/new-api'
        target='_blank'
        rel='noopener noreferrer'
        className='text-foreground hover:text-primary font-medium transition-colors'
      >
        {t('New API')}
      </a>
      . {t(NEW_API_FOOTER_ATTRIBUTION_KEY)}{' '}
      <a
        href='https://github.com/QuantumNous'
        target='_blank'
        rel='noopener noreferrer'
        className='text-foreground hover:text-primary transition-colors'
      >
        QuantumNous
      </a>
    </span>
  )
  if (props.inline) {
    return content
  }
  return (
    <div className='text-muted-foreground text-xs leading-6 sm:text-right'>
      {content}
    </div>
  )
}

export function Footer(props: FooterProps) {
  const { t } = useTranslation()
  const navigationLinks = useTopNavLinks()
  const {
    systemName,
    logo: systemLogo,
    footerHtml,
    demoSiteEnabled,
  } = useSystemConfig()

  const displayLogo = systemLogo || props.logo || '/logo.png'
  const displayName = systemName || props.name || 'New API'
  const operator = import.meta.env.VITE_SITE_BRAND?.trim()
  const hasOperatorBrand = Boolean(operator && operator !== displayName)
  const isAelion = operator?.toLowerCase() === 'aelion'
  const isDemoSiteMode = Boolean(demoSiteEnabled)
  const currentYear = new Date().getFullYear()

  const fallbackColumns = useMemo<FooterColumnProps[]>(
    () => [
      {
        title: t('footer.columns.about.title'),
        links: [
          {
            text: t('footer.columns.about.links.aboutProject'),
            href: 'https://docs.newapi.pro/wiki/project-introduction/',
          },
          {
            text: t('footer.columns.about.links.contact'),
            href: 'https://docs.newapi.pro/support/community-interaction/',
          },
          {
            text: t('footer.columns.about.links.features'),
            href: 'https://docs.newapi.pro/wiki/features-introduction/',
          },
        ],
      },
      {
        title: t('footer.columns.docs.title'),
        links: [
          {
            text: t('footer.columns.docs.links.quickStart'),
            href: 'https://docs.newapi.pro/getting-started/',
          },
          {
            text: t('footer.columns.docs.links.installation'),
            href: 'https://docs.newapi.pro/installation/',
          },
          {
            text: t('footer.columns.docs.links.apiDocs'),
            href: 'https://docs.newapi.pro/api/',
          },
        ],
      },
      {
        title: t('footer.columns.related.title'),
        links: [
          {
            text: t('footer.columns.related.links.oneApi'),
            href: 'https://github.com/songquanpeng/one-api',
          },
          {
            text: t('footer.columns.related.links.midjourney'),
            href: 'https://github.com/novicezk/midjourney-proxy',
          },
          {
            text: t('footer.columns.related.links.newApiKeyTool'),
            href: 'https://github.com/Calcium-Ion/new-api-key-tool',
          },
        ],
      },
    ],
    [t]
  )

  const displayColumns = props.columns ?? fallbackColumns

  if (footerHtml) {
    return (
      <footer
        className={cn(
          'border-border bg-background relative z-10 border-t',
          props.className
        )}
      >
        <div className='mx-auto w-full max-w-[1440px] px-6 py-8 md:px-10'>
          <div className='flex flex-col justify-between gap-6 sm:flex-row sm:items-center'>
            <div
              className='custom-footer text-muted-foreground min-w-0 text-sm leading-7'
              dangerouslySetInnerHTML={{ __html: footerHtml }}
            />
            <div className='border-border text-muted-foreground flex w-full flex-wrap items-center gap-x-4 gap-y-2 border-t pt-5 text-xs leading-6 sm:w-auto sm:max-w-xl sm:justify-end sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6'>
              <LegalLinks />
              <ProjectAttribution currentYear={currentYear} inline />
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer
      className={cn(
        'border-border bg-background relative z-10 border-t',
        props.className
      )}
    >
      <div className='mx-auto max-w-[1440px] px-6 pt-12 pb-6 md:px-10 md:pt-20 md:pb-8'>
        <div className='grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20'>
          {/* Brand column */}
          <div className='min-w-0'>
            <Link
              to='/'
              className='text-foreground inline-flex max-w-full items-center gap-4 sm:gap-6'
            >
              {isAelion ? (
                <span
                  aria-hidden
                  className='aelion-brand-mark block size-12 shrink-0 sm:size-16'
                />
              ) : (
                <img
                  src={displayLogo}
                  alt=''
                  aria-hidden
                  className='size-12 shrink-0 object-contain sm:size-16'
                />
              )}
              <span className='min-w-0 font-serif text-[clamp(3rem,6vw,6.5rem)] leading-none font-medium tracking-[-0.055em] [overflow-wrap:anywhere]'>
                {operator || displayName}
              </span>
            </Link>
            {hasOperatorBrand && (
              <div className='text-muted-foreground mt-7 flex items-center gap-2.5 text-sm'>
                <img
                  src={displayLogo}
                  alt=''
                  aria-hidden
                  className='size-5 object-contain'
                />
                <span>{displayName}</span>
              </div>
            )}
            <p className='text-muted-foreground mt-3 text-sm leading-7'>
              {t('Powerful API Management Platform')}
            </p>
          </div>

          {/* Links columns */}
          <div className='grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-x-12'>
            {navigationLinks.length > 0 && (
              <nav aria-label={t('Platform')}>
                <h2 className='text-foreground mb-4 text-xs font-medium tracking-widest uppercase'>
                  {t('Platform')}
                </h2>
                <ul className='space-y-1'>
                  {navigationLinks.map((link) => (
                    <li key={link.href}>
                      <FooterLinkItem
                        link={{ text: link.title, href: link.href }}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {isDemoSiteMode &&
              displayColumns.map((column) => (
                <nav key={column.title} aria-label={t(column.title)}>
                  <h2 className='text-foreground mb-4 text-xs font-medium tracking-widest uppercase'>
                    {t(column.title)}
                  </h2>
                  <ul className='space-y-1'>
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <FooterLinkItem link={link} />
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
          </div>
        </div>

        {/* Copyright + optional legal links inline on the left, project
            attribution on the right; wraps on narrow screens. */}
        <div className='border-border mt-12 flex flex-col justify-between gap-x-10 gap-y-4 border-t pt-6 text-xs md:mt-20 lg:flex-row lg:items-start'>
          <div className='text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-2 leading-6'>
            <span>
              &copy; {currentYear} {displayName}.{' '}
              {props.copyright ?? t('footer.defaultCopyright')}
            </span>
            <LegalLinks leadingSeparator />
          </div>
          <ProjectAttribution currentYear={currentYear} />
        </div>
      </div>
    </footer>
  )
}
