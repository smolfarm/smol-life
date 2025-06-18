import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import {STALE} from '#/state/queries'
import {useAgent, useSession} from '#/state/session'

export const INSTALLED_RQKEY = (did: string) => ['installed', did]

export function useInstalledRecordsQuery() {
  const {currentAccount} = useSession()
  const agent = useAgent()
  return useQuery<{uri: string}[], Error>({
    queryKey: INSTALLED_RQKEY(currentAccount?.did || ''),
    staleTime: STALE.MINUTES.ONE,
    enabled: !!currentAccount,
    queryFn: async () => {
      const res = await agent.api.com.atproto.repo.listRecords({
        repo: currentAccount!.did,
        collection: 'life.smol.installed',
        limit: 100,
      })
      return res.data.records.map(r => r.value as {uri: string})
    },
  })
}

export function useInstallMutation() {
  const {currentAccount} = useSession()
  const agent = useAgent()
  const queryClient = useQueryClient()
  return useMutation<void, Error, {rkey: string; uri: string}>({
    mutationFn: async ({rkey, uri}) => {
      await agent.api.com.atproto.repo.putRecord({
        repo: currentAccount!.did,
        collection: 'life.smol.installed',
        rkey,
        record: {uri},
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INSTALLED_RQKEY(currentAccount!.did),
      })
    },
  })
}

export function useUninstallMutation() {
  const {currentAccount} = useSession()
  const agent = useAgent()
  const queryClient = useQueryClient()
  return useMutation<void, Error, {rkey: string}>({
    mutationFn: async ({rkey}) => {
      await agent.api.com.atproto.repo.deleteRecord({
        repo: currentAccount!.did,
        collection: 'life.smol.installed',
        rkey,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INSTALLED_RQKEY(currentAccount!.did),
      })
    },
  })
}
