import {BskyAgent} from '@atproto/api'
import {useQuery} from '@tanstack/react-query'

import {BSKY_SERVICE} from '#/lib/constants'
import {STALE} from '#/state/queries'

export interface JobEntry {
  company: string
  position: string
  startDate: string
  endDate?: string
  description?: string
}

export interface EducationEntry {
  institution: string
  degree: string
  startDate: string
  endDate?: string
  description?: string
}

export interface CvRecord {
  overview: string
  jobHistory: JobEntry[]
  educationHistory: EducationEntry[]
  skills: string[]
}

export const RQKEY_ROOT = 'cv'
export const RQKEY = (did: string) => [RQKEY_ROOT, did]

export function useCvQuery(did: string) {
  const service = did.startsWith('did:web:')
    ? `https://${did.slice('did:web:'.length).replace(/:/g, '/')}`
    : BSKY_SERVICE
  const agent = new BskyAgent({service})

  return useQuery<CvRecord | null, Error>({
    queryKey: RQKEY(did),
    queryFn: async () => {
      const res = await agent.com.atproto.repo.listRecords({
        repo: did,
        collection: 'life.smol.resume',
        limit: 1,
      })
      if (res.data.records.length > 0) {
        return res.data.records[0].value as unknown as CvRecord
      }
      return null
    },
    staleTime: STALE.MINUTES.FIVE,
    enabled: !!did,
  })
}
