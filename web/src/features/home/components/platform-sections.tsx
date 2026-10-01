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
import { ArrowUpRight, Check, Pause, Play } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useSystemConfigStore } from '@/stores/system-config-store'

interface PlatformSectionsProps {
  isAuthenticated?: boolean
}

function RequestFlow(props: { routing?: boolean }) {
  const { t } = useTranslation()
  const systemName = useSystemConfigStore((state) => state.config.systemName)
  const siteBrand = import.meta.env.VITE_SITE_BRAND?.trim() || systemName
  const clients = props.routing
    ? ['POST /v1/chat/completions']
    : ['Chat Completions', 'Responses', 'Claude', 'Gemini']
  const destinations = props.routing
    ? [t('Priority'), t('Fallback')]
    : ['OpenAI', 'Anthropic', 'Google', 'DeepSeek']

  return (
    <div className='platform-request-flow'>
      <div className='min-w-0'>
        <p className='text-muted-foreground mb-5 text-xs'>{t('Client')}</p>
        <ul className='divide-border/60 divide-y'>
          {clients.map((client) => (
            <li
              key={client}
              className='py-3 font-mono text-xs break-words sm:text-sm'
            >
              {client}
            </li>
          ))}
        </ul>
      </div>
      <div className='platform-flow-connector' aria-hidden='true' />
      <div className='min-w-0 border-y py-8 text-center'>
        <p className='font-serif text-3xl tracking-tight break-words sm:text-4xl'>
          {siteBrand}
        </p>
        <p className='text-muted-foreground mt-3 text-xs'>API</p>
      </div>
      <div className='platform-flow-connector' aria-hidden='true' />
      <div className='min-w-0'>
        <p className='text-muted-foreground mb-5 text-xs'>{t('Upstream')}</p>
        <ul className='divide-border/60 divide-y'>
          {destinations.map((destination, index) => (
            <li
              key={destination}
              className='flex items-baseline justify-between gap-3 py-3 text-sm'
            >
              <span>{destination}</span>
              {props.routing && (
                <span className='text-muted-foreground font-mono text-xs'>
                  {index + 1}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function PlatformSections(props: PlatformSectionsProps) {
  const { t } = useTranslation()
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [paused, setPaused] = useState(false)
  const animationPaused = paused || prefersReducedMotion
  const baseUrl =
    typeof window === 'undefined' ? '/v1' : `${window.location.origin}/v1`
  const capabilities = [
    {
      id: 'protocols',
      title: t('Multi-protocol Compatible'),
      description: t(
        'Use Chat Completions, Responses, Claude and Gemini through one gateway.'
      ),
      to: '/pricing' as const,
      action: t('Model Square'),
    },
    {
      id: 'routing',
      title: t('Channels'),
      description: t(
        'Route traffic by priority and retry eligible failures on another channel.'
      ),
      to: '/channels' as const,
      action: t('Channels'),
    },
    {
      id: 'keys',
      title: t('API Keys'),
      description: t(
        'Set model access, quotas and expiry separately for each API key.'
      ),
      to: '/keys' as const,
      action: t('API Keys'),
    },
    {
      id: 'usage',
      title: t('Usage Logs'),
      description: t(
        'Review model, token usage, latency and cost for each request.'
      ),
      to: '/usage-logs' as const,
      action: t('Usage Logs'),
    },
  ]

  return (
    <>
      <section
        className='platform-sections border-t px-6 py-20 md:py-28'
        aria-labelledby='platform-features-title'
        data-animation-paused={animationPaused}
      >
        <div className='mx-auto max-w-6xl'>
          <AnimateInView className='mb-12 flex flex-wrap items-end justify-between gap-6'>
            <h2
              id='platform-features-title'
              className='text-3xl font-medium tracking-tight sm:text-5xl'
            >
              {t('Core Features')}
            </h2>
            <Button
              variant='ghost'
              size='sm'
              aria-label={
                animationPaused ? t('Play animation') : t('Pause animation')
              }
              aria-pressed={animationPaused}
              disabled={prefersReducedMotion}
              onClick={() => setPaused((value) => !value)}
            >
              {animationPaused ? (
                <Play aria-hidden='true' className='size-3.5' />
              ) : (
                <Pause aria-hidden='true' className='size-3.5' />
              )}
              {animationPaused ? t('Play animation') : t('Pause animation')}
            </Button>
          </AnimateInView>

          <AnimateInView>
            <Tabs defaultValue='protocols' className='gap-0'>
              <TabsList
                aria-label={t('Core Features')}
                className='mb-10 h-auto w-full flex-wrap gap-x-8 gap-y-2'
              >
                {capabilities.map((capability) => (
                  <TabsTrigger
                    key={capability.id}
                    value={capability.id}
                    className='min-h-11 flex-none px-0 sm:text-base'
                  >
                    {capability.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {capabilities.map((capability) => (
                <TabsContent
                  key={capability.id}
                  value={capability.id}
                  className='platform-feature-panel min-h-80'
                >
                  <div className='grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-16'>
                    <div className='flex min-w-0 flex-col items-start gap-5'>
                      <h3 className='text-2xl leading-snug font-medium'>
                        {capability.title}
                      </h3>
                      <p className='text-muted-foreground max-w-sm text-sm leading-7 sm:text-base'>
                        {capability.description}
                      </p>
                      <Button
                        variant='link'
                        className='px-0'
                        render={<Link to={capability.to} />}
                      >
                        {capability.action}
                        <ArrowUpRight aria-hidden='true' className='size-4' />
                      </Button>
                    </div>
                    <figure className='min-w-0'>
                      <figcaption className='text-muted-foreground mb-6 flex items-center justify-between gap-3 border-b pb-3 text-xs'>
                        <span>{t('Example')}</span>
                        <span>{capability.title}</span>
                      </figcaption>
                      {capability.id === 'protocols' && <RequestFlow />}
                      {capability.id === 'routing' && <RequestFlow routing />}
                      {capability.id === 'keys' && (
                        <dl className='divide-border/60 divide-y text-sm'>
                          {[
                            [t('API Key'), 'sk-••••••••••••'],
                            [t('Model Limits'), 'gpt-4.1-mini'],
                            [t('Quota'), `100,000 ${t('Tokens')}`],
                            [t('Expires'), '2027-01-01'],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className='flex flex-wrap justify-between gap-3 py-4'
                            >
                              <dt className='text-muted-foreground'>{label}</dt>
                              <dd className='font-mono text-xs break-all'>
                                {value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      {capability.id === 'usage' && (
                        <div>
                          <div className='mb-4 flex flex-wrap items-baseline justify-between gap-3'>
                            <code className='text-sm'>gpt-4.1-mini</code>
                            <span className='text-success flex items-center gap-2 text-xs'>
                              <Check aria-hidden='true' className='size-3.5' />
                              {t('Success')}
                            </span>
                          </div>
                          <dl className='divide-border/60 divide-y text-sm'>
                            {[
                              [t('Input Tokens'), '128'],
                              [t('Output Tokens'), '256'],
                              [t('Latency'), '420 ms'],
                              [t('Cost'), '$0.001'],
                            ].map(([label, value]) => (
                              <div
                                key={label}
                                className='flex justify-between gap-3 py-3'
                              >
                                <dt className='text-muted-foreground'>
                                  {label}
                                </dt>
                                <dd className='font-mono text-xs'>{value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </figure>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </AnimateInView>
        </div>
      </section>

      <section
        className='border-t px-6 py-20 md:py-28'
        aria-labelledby='platform-setup-title'
      >
        <div className='mx-auto max-w-6xl'>
          <AnimateInView className='mb-12'>
            <h2
              id='platform-setup-title'
              className='text-3xl font-medium tracking-tight sm:text-5xl'
            >
              {t('Three steps to get started')}
            </h2>
          </AnimateInView>
          <ol className='grid gap-10 md:grid-cols-3 md:gap-12'>
            <AnimateInView
              as='li'
              className='flex min-w-0 flex-col items-start border-t pt-6'
              delay={0}
            >
              <span
                className='text-muted-foreground font-serif text-4xl'
                aria-hidden='true'
              >
                01
              </span>
              <h3 className='mt-6 text-base font-medium'>
                {t('Create API Key')}
              </h3>
              <p className='text-muted-foreground mt-3 mb-6 flex-1 text-sm leading-7'>
                {t('Create a key for your app or service')}
              </p>
              <Button
                variant='outline'
                render={
                  <Link to={props.isAuthenticated ? '/keys' : '/sign-up'} />
                }
              >
                {t('Create API Key')}
                <ArrowUpRight aria-hidden='true' className='size-4' />
              </Button>
            </AnimateInView>
            <AnimateInView
              as='li'
              className='flex min-w-0 flex-col items-start border-t pt-6'
              delay={90}
            >
              <span
                className='text-muted-foreground font-serif text-4xl'
                aria-hidden='true'
              >
                02
              </span>
              <h3 className='mt-6 text-base font-medium'>
                {t('API Base URL')}
              </h3>
              <p className='text-muted-foreground mt-3 mb-6 text-sm leading-7'>
                {t(
                  'Set this address as the base URL in your SDK or application.'
                )}
              </p>
              <div className='mt-auto flex w-full min-w-0 items-center gap-3 border-b pb-2'>
                <code className='min-w-0 flex-1 text-xs break-all'>
                  {baseUrl}
                </code>
                <CopyButton
                  value={baseUrl}
                  size='sm'
                  tooltip={t('Copy API URL')}
                  aria-label={t('Copy API URL')}
                />
              </div>
            </AnimateInView>
            <AnimateInView
              as='li'
              className='flex min-w-0 flex-col items-start border-t pt-6'
              delay={180}
            >
              <span
                className='text-muted-foreground font-serif text-4xl'
                aria-hidden='true'
              >
                03
              </span>
              <h3 className='mt-6 text-base font-medium'>
                {t('Send a request')}
              </h3>
              <p className='text-muted-foreground mt-3 mb-6 flex-1 text-sm leading-7'>
                {t(
                  'Use Playground to try a model before connecting your application.'
                )}
              </p>
              <Button variant='outline' render={<Link to='/playground' />}>
                {t('Playground')}
                <ArrowUpRight aria-hidden='true' className='size-4' />
              </Button>
            </AnimateInView>
          </ol>
        </div>
      </section>
    </>
  )
}
