import {BskyAgent} from '@atproto/api'
import {useQuery} from '@tanstack/react-query'

import {BSKY_SERVICE} from '#/lib/constants'
import {STALE} from '#/state/queries'

export type TipType = 'Venmo' | 'Cash App' | 'ETH Address'

export interface TipMethod {
  type: TipType
  value: string
}

export interface TipRecord {
  methods: TipMethod[]
}

export const RQKEY_ROOT = 'tips'
export const RQKEY = (did: string) => [RQKEY_ROOT, did]

export function useTipQuery(did: string) {
  const service = did.startsWith('did:web:')
    ? `https://${did.slice('did:web:'.length).replace(/:/g, '/')}`
    : BSKY_SERVICE
  const agent = new BskyAgent({service})

  return useQuery<TipRecord | null, Error>({
    queryKey: RQKEY(did),
    queryFn: async () => {
      const res = await agent.com.atproto.repo.listRecords({
        repo: did,
        collection: 'life.smol.tipJar',
        limit: 1,
      })
      if (res.data.records.length > 0) {
        return res.data.records[0].value as unknown as TipRecord
      }
      return null
    },
    staleTime: STALE.MINUTES.FIVE,
    enabled: !!did,
  })
}
