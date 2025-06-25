import {useQuery} from '@tanstack/react-query'

import {STALE} from '#/state/queries'

export interface SkyrdleStats {
  currentStreak: number
  gamesWon: number
  averageScore: number
}

export function useSkyrdleStats(did: string) {
  return useQuery<SkyrdleStats, Error>({
    queryKey: ['skyrdleStats', did],
    staleTime: STALE.MINUTES.ONE,
    enabled: !!did,
    queryFn: async () => {
      const res = await fetch(
        `https://skyrdle.com/api/stats?did=${encodeURIComponent(did)}`,
      )
      if (!res.ok) throw new Error('Failed to fetch Skyrdle stats')
      return res.json() as Promise<SkyrdleStats>
    },
  })
}
