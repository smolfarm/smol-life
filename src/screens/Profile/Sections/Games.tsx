import React from 'react'
import {Text, View} from 'react-native'
import {findNodeHandle} from 'react-native'
import {useSafeAreaFrame} from 'react-native-safe-area-context'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {isIOS} from '#/platform/detection'
import {EmptyState} from '#/view/com/util/EmptyState'
import {type ListRef} from '#/view/com/util/List'
import {atoms as a, useTheme} from '#/alf'
import {Loader} from '#/components/Loader'
import {ErrorState} from '../ErrorState'
import {type SectionRef} from './types'

interface GamesSectionProps {
  did: string
  scrollElRef: ListRef
  headerHeight: number
  isFocused: boolean
  setScrollViewTag: (tag: number | null) => void
}
import {useProfileGamesQuery} from '#/state/queries/profileGames'
import {
  type SkyrdleStats,
  useSkyrdleStats,
} from '#/state/queries/useSkyrdleStats'

export const ProfileGamesSection = React.forwardRef<
  SectionRef,
  GamesSectionProps
>(function GamesSection(
  {did, scrollElRef, headerHeight, isFocused, setScrollViewTag},
  ref,
) {
  const {_} = useLingui()
  const t = useTheme()
  const {height: minHeight} = useSafeAreaFrame()

  const {
    data: gamesRecords = [],
    isLoading: loadingGames,
    error: gamesError,
  } = useProfileGamesQuery(did)
  const {
    data: stats,
    isLoading: loadingStats,
    error: statsError,
  } = useSkyrdleStats(did)

  React.useEffect(() => {
    if (isIOS && isFocused && scrollElRef.current) {
      const nativeTag = findNodeHandle(scrollElRef.current)
      setScrollViewTag(nativeTag)
    }
  }, [isFocused, scrollElRef, setScrollViewTag])

  React.useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      scrollElRef.current?.scrollToOffset({
        animated: true,
        offset: -headerHeight,
      })
    },
  }))

  if (loadingGames || loadingStats) {
    return (
      <View style={[a.w_full, a.align_center, a.py_4xl, {minHeight}]}>
        <Loader size="xl" />
      </View>
    )
  }
  if (gamesError || statsError) {
    return (
      <View style={[a.w_full, a.align_center, a.py_4xl, {minHeight}]}>
        <ErrorState error={(gamesError || statsError)?.toString()} />
      </View>
    )
  }
  if (!gamesRecords || gamesRecords.length === 0) {
    return (
      <View style={[a.w_full, a.align_center, a.py_4xl, {minHeight}]}>
        <EmptyState icon="growth" message={_(msg`No games played.`)} />
      </View>
    )
  }

  // render stats
  const {currentStreak, gamesWon, averageScore} = stats as SkyrdleStats

  return (
    <View style={[a.p_md, {minHeight}]}>
      <Text style={[a.text_lg, t.atoms.text_contrast_high]}>
        <Trans>Skyrdle Stats</Trans>
      </Text>
      <View style={[a.mt_md, a.flex_row, a.justify_between]}>
        <View style={[a.align_center]}>
          <Text style={t.atoms.text_contrast_medium}>
            <Trans>Current Streak</Trans>
          </Text>
          <Text style={[a.text_md, t.atoms.text_contrast_high]}>
            {' '}
            {currentStreak}{' '}
          </Text>
        </View>
        <View style={[a.align_center]}>
          <Text style={t.atoms.text_contrast_medium}>
            <Trans>Games Won</Trans>
          </Text>
          <Text style={[a.text_md, t.atoms.text_contrast_high]}>
            {' '}
            {gamesWon}{' '}
          </Text>
        </View>
        <View style={[a.align_center]}>
          <Text style={t.atoms.text_contrast_medium}>
            <Trans>Average Score</Trans>
          </Text>
          <Text style={[a.text_md, t.atoms.text_contrast_high]}>
            {' '}
            {averageScore.toFixed(1)}{' '}
          </Text>
        </View>
      </View>
    </View>
  )
})
