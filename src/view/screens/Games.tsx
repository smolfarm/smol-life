import React from 'react'
import {Linking, ScrollView, View} from 'react-native'
import {TouchableOpacity} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {useNavigationDeduped} from '#/lib/hooks/useNavigationDeduped'
import {
  useInstalledRecordsQuery,
  useInstallMutation,
  useUninstallMutation,
} from '#/state/queries/installed'
import {useProfileQuery} from '#/state/queries/profile'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import {UserAvatar} from '../com/util/UserAvatar'

function GameListItem({
  title,
  description,
  accountHandle,
  did,
  playUrl,
}: {
  title: string
  description: string
  accountHandle: string
  did: string
  playUrl: string
}) {
  const t = useTheme()
  const {_} = useLingui()
  const {data: profile} = useProfileQuery({did})
  const navigation = useNavigationDeduped()
  // install state hooks
  const {data: installedRecords = []} = useInstalledRecordsQuery()
  const installMutation = useInstallMutation()
  const uninstallMutation = useUninstallMutation()
  const isInstalled = installedRecords.some(r => r.uri === playUrl)

  const goToProfile = React.useCallback(() => {
    if (profile?.handle) {
      navigation.navigate('Profile', {name: profile.handle})
    } else if (did) {
      navigation.navigate('Profile', {name: did})
    }
  }, [navigation, profile?.handle, did])

  return (
    <View
      style={[
        a.flex_row,
        a.align_center,
        a.gap_md,
        a.px_lg, // horizontal padding to match FeedCard
        a.py_md,
        t.atoms.bg_contrast_25,
        {borderRadius: 12, width: '100%', minHeight: 72},
      ]}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={goToProfile}
        activeOpacity={0.7}
        style={{marginRight: 8}}>
        <UserAvatar type="user" size={80} avatar={profile?.avatar} />
      </TouchableOpacity>
      <View style={[a.flex_1, {minWidth: 0}]}>
        <Text style={[a.text_lg, a.font_bold]} numberOfLines={1}>
          {title}
        </Text>
        <Text
          style={[a.text_sm, t.atoms.text_contrast_medium]}
          numberOfLines={1}>
          @{accountHandle}
        </Text>
        <Text style={[a.text_sm, a.mt_sm]} numberOfLines={1}>
          {description}
        </Text>
        <View style={[a.flex_row, a.gap_md, a.mt_sm]}>
          <Button
            variant="solid"
            color="primary"
            label={_(msg`Play ${title}`)}
            onPress={() => Linking.openURL(playUrl)}
            size="small"
            style={[{paddingHorizontal: 16, borderRadius: 8}]}>
            <ButtonText>{_(msg`Play`)}</ButtonText>
          </Button>
          <Button
            variant="solid"
            label={_(msg`${isInstalled ? 'Uninstall' : 'Install'}`)}
            color="primary"
            onPress={() =>
              isInstalled
                ? uninstallMutation.mutate({rkey: accountHandle})
                : installMutation.mutate({rkey: accountHandle, uri: playUrl})
            }
            size="small"
            style={[{paddingHorizontal: 16, borderRadius: 8}]}>
            <ButtonText>
              {_(msg`${isInstalled ? 'Uninstall' : 'Install'}`)}
            </ButtonText>
          </Button>
        </View>
      </View>
    </View>
  )
}

export function GamesScreen() {
  const {_} = useLingui()
  // installed state
  const {data: installedRecords = []} = useInstalledRecordsQuery()
  const [tab, setTab] = React.useState<'installed' | 'directory'>('directory')
  // static game directory
  const gamesList = [
    {
      title: 'Skyrdle',
      description: 'Guess the daily word in 6 tries or fewer!',
      accountHandle: 'skyrdle.com',
      did: 'did:plc:jylenhzj4u2te27qmcrdjtoh',
      playUrl: 'https://skyrdle.com',
    },
    {
      title: '2048',
      description: 'Combine tiles to try to reach a value of 2048!',
      accountHandle: '2048.blue',
      did: 'did:plc:zylhqsjug3f76uqxguhviqka',
      playUrl: 'https://2048.blue',
    },
  ]
  const installedGames = gamesList.filter(g =>
    installedRecords.some(r => r.uri === g.playUrl),
  )

  return (
    <Layout.Screen testID="GamesScreen">
      <Layout.Center>
        <Layout.Header.Outer>
          <Layout.Header.BackButton />
          <Layout.Header.Content>
            <Layout.Header.TitleText>
              <Trans>Games</Trans>
            </Layout.Header.TitleText>
          </Layout.Header.Content>
        </Layout.Header.Outer>
        {/* Tab bar */}
        <View style={[a.flex_row, a.justify_center, a.gap_md, a.mb_md]}>
          <Button
            variant={tab === 'installed' ? 'solid' : 'outline'}
            label={_(msg`Installed`)}
            size="small"
            onPress={() => setTab('installed')}>
            <ButtonText>{_(msg`Installed`)}</ButtonText>
          </Button>
          <Button
            variant={tab === 'directory' ? 'solid' : 'outline'}
            label={_(msg`Directory`)}
            size="small"
            onPress={() => setTab('directory')}>
            <ButtonText>{_(msg`Directory`)}</ButtonText>
          </Button>
        </View>
        {tab === 'directory' ? (
          <View
            style={[
              a.pt_lg,
              a.pb_xl,
              a.gap_lg,
              {width: '100%', paddingHorizontal: 16},
            ]}>
            {gamesList.map(game => (
              <GameListItem
                key={game.playUrl}
                title={game.title}
                description={game.description}
                accountHandle={game.accountHandle}
                did={game.did}
                playUrl={game.playUrl}
              />
            ))}
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              a.flex_row,
              a.flex_wrap,
              a.justify_center,
              a.gap_lg,
              {paddingHorizontal: 16},
            ]}>
            {installedGames.map(game => (
              <View key={game.playUrl} style={{width: '45%', margin: 8}}>
                <GameListItem
                  title={game.title}
                  description={game.description}
                  accountHandle={game.accountHandle}
                  did={game.did}
                  playUrl={game.playUrl}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </Layout.Center>
    </Layout.Screen>
  )
}
