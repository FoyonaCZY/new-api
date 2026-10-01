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
import { useRouterState } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

type ArtworkScene = 'atlas' | 'hermes' | 'athena' | 'temple'

/** Shared decorative surface; never changes document or keyboard order. */
export function ArtBackdrop(props: {
  className?: string
  priority?: boolean
  scene?: ArtworkScene
}) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'aelion-art-backdrop',
        props.scene && 'aelion-art-panorama',
        props.className
      )}
    >
      <img
        src={
          props.scene
            ? `/images/aelion-banner-${props.scene}.png`
            : '/images/aelion-classical.png'
        }
        alt=''
        width={props.scene ? 2172 : 1672}
        height={props.scene ? 724 : 941}
        loading={props.priority ? 'eager' : 'lazy'}
        fetchPriority={props.priority ? 'high' : 'auto'}
        decoding='async'
      />
    </div>
  )
}

/** Select a consistent illustration for each page family without affecting its content. */
export function PageArtBackdrop(props: { priority?: boolean }) {
  const section = useRouterState({
    select: (state) => state.location.pathname.split('/')[1],
  })
  let scene: ArtworkScene = 'temple'
  switch (section) {
    case 'dashboard':
    case 'usage-logs':
    case 'system-info':
      scene = 'atlas'
      break
    case 'pricing':
    case 'models':
    case 'rankings':
    case 'playground':
    case 'chat':
      scene = 'athena'
      break
    case 'channels':
    case 'keys':
    case 'task-plugins':
    case 'wallet':
    case 'subscriptions':
    case 'redemption-codes':
      scene = 'hermes'
      break
  }
  return <ArtBackdrop scene={scene} priority={props.priority} />
}
