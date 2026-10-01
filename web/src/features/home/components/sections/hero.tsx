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
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ArtBackdrop } from '@/components/art-backdrop'
import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'
import { cn } from '@/lib/utils'

import { HeroTerminalDemo } from '../hero-terminal-demo'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'

  return (
    <>
      <section className={cn('aelion-banner aelion-hero', props.className)}>
        <ArtBackdrop priority />
        <div className='aelion-hero-copy'>
          <h1>
            {t('One API.')}
            <br />
            {t('Connect multiple AI models.')}
          </h1>
          <p>
            {t(
              'Access OpenAI, Claude, Gemini and more. Manage requests, keys and usage in one place.'
            )}
          </p>
          <div className='aelion-hero-actions'>
            <Button
              render={
                <Link to={props.isAuthenticated ? '/dashboard' : '/sign-up'} />
              }
            >
              {props.isAuthenticated ? t('Go to Dashboard') : t('Get Started')}
              <ArrowUpRight aria-hidden='true' className='size-4' />
            </Button>
            <Button
              className='aelion-hero-secondary'
              variant='outline'
              render={<Link to='/pricing' />}
            >
              {t('Model Square')}
            </Button>
          </div>
        </div>
      </section>
      <section className='aelion-providers' aria-label={t('Supported Models')}>
        <h2>{t('Supported Models')}</h2>
        {['OpenAI', 'Anthropic', 'Google', 'DeepSeek'].map((name) => (
          <span key={name}>{name}</span>
        ))}
      </section>
      <section className='aelion-api-section'>
        <div>
          <h2>{t('Use the API you already know.')}</h2>
          <p>
            {t(
              'Use a unified interface for multiple models, with support for Chat Completions, Responses and more.'
            )}
          </p>
          <Button
            className='mt-5'
            variant='outline'
            render={
              docsUrl.startsWith('http') ? (
                <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
              ) : (
                <Link to={docsUrl} />
              )
            }
          >
            {t('Docs')}
            <ArrowUpRight aria-hidden='true' className='size-4' />
          </Button>
          <div className='aelion-apps'>
            <a
              href='https://cherry-ai.com'
              target='_blank'
              rel='noopener noreferrer'
            >
              Cherry Studio
            </a>
            <a
              href='https://ccswitch.io'
              target='_blank'
              rel='noopener noreferrer'
            >
              CC Switch
            </a>
          </div>
          <p className='text-xs'>
            {t(
              'Supports one-click configuration and perfectly adapts to NewAPI multi-protocol configuration.'
            )}
          </p>
        </div>
        <HeroTerminalDemo />
      </section>
    </>
  )
}
