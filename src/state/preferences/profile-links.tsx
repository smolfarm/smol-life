import React from 'react'

import * as persisted from '#/state/persisted'

// Preferences for showing elements in the Profile Links section

type State = NonNullable<persisted.Schema['profileLinks']>
type Action = (key: keyof State, value: boolean) => void

const stateContext = React.createContext<State>(
  persisted.defaults.profileLinks!,
)
const setContext = React.createContext<Action>(() => {})

export function Provider({children}: React.PropsWithChildren<{}>) {
  const [state, setState] = React.useState<State>(
    () => persisted.get('profileLinks') ?? persisted.defaults.profileLinks!,
  )

  const setStateWrapped = React.useCallback(
    (key: keyof State, value: boolean) => {
      setState(prev => {
        const next = {...prev, [key]: value}
        persisted.write('profileLinks', next)
        return next
      })
    },
    [],
  )

  React.useEffect(() => {
    return persisted.onUpdate('profileLinks', next => {
      setState(next ?? persisted.defaults.profileLinks!)
    })
  }, [])

  return (
    <stateContext.Provider value={state}>
      <setContext.Provider value={setStateWrapped}>
        {children}
      </setContext.Provider>
    </stateContext.Provider>
  )
}

export function useProfileLinksPrefs() {
  return React.useContext(stateContext)
}

export function useSetProfileLinkPref() {
  return React.useContext(setContext)
}
