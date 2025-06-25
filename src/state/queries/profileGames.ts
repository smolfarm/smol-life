import {useQuery} from '@tanstack/react-query'

import {STALE} from '#/state/queries'
import {useAgent} from '#/state/session'

export const PROFILE_GAMES_KEY = (did: string) => ['profileGames', did]

const gameUris = ['https://skyrdle.com', 'https://2048.blue']

export function useProfileGamesQuery(did: string) {
  const agent = useAgent()
  return useQuery<any[], Error>({
    queryKey: PROFILE_GAMES_KEY(did),
    staleTime: STALE.MINUTES.ONE,
    enabled: !!did,
    queryFn: async () => {
      const res = await agent.com.atproto.repo.listRecords({
        repo: did,
        collection: 'life.smol.installed',
        limit: 100,
      })
      return res.data.records
        .filter(r => gameUris.includes((r.value as {uri: string}).uri))
        .map(r => r.value)
    },
  })
}
