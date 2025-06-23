import {BskyAgent} from '@atproto/api'
import {useQuery} from '@tanstack/react-query'

import {BSKY_SERVICE} from '#/lib/constants'
import {STALE} from '#/state/queries'

export type TipType = 'venmo' | 'cashapp' | 'eth'

export interface TipMethod {
  type: TipType
  value: string
}

export const RQKEY_ROOT = 'tips'
export const RQKEY = (did: string) => [RQKEY_ROOT, did]

export function useTipQuery(did: string) {
  const service = did.startsWith('did:web:')
    ? `https://${did.slice('did:web:'.length).replace(/:/g, '/')}`
    : BSKY_SERVICE
  const agent = new BskyAgent({service})

  return useQuery<TipMethod[], Error>({
    queryKey: RQKEY(did),
    queryFn: async () => {
      const res = await agent.com.atproto.repo.listRecords({
        repo: did,
        collection: 'life.smol.tipJar',
        limit: 100,
      })
      return res.data.records.map(r => r.value as unknown as TipMethod)
    },
    staleTime: STALE.MINUTES.FIVE,
    enabled: !!did,
  })
}
