import React from 'react'
import {Linking, ScrollView, TouchableOpacity, View} from 'react-native'
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
import {Text} from '#/components/Typography' // use Typography Text
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
                ? uninstallMutation.mutate({rkey: playUrl.split('/').pop()!})
                : installMutation.mutate({
                    rkey: playUrl.split('/').pop()!,
                    uri: playUrl,
                  })
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
  type Game = (typeof gamesList)[0]
  // grid icon item
  const InstalledGridItem = ({game}: {game: Game}) => {
    const {data: profile} = useProfileQuery({did: game.did})
    return (
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => Linking.openURL(game.playUrl)}
        style={{padding: 8, alignItems: 'center'}}>
        <UserAvatar type="user" size={72} avatar={profile?.avatar} />
        <Text style={[a.text_sm, a.text_center, a.mt_md]} numberOfLines={1}>
          {game.title}
        </Text>
      </TouchableOpacity>
    )
  }
  const {_} = useLingui()
  const theme = useTheme()
  // installed state
  const {data: installedRecords = []} = useInstalledRecordsQuery()
  const [tab, setTab] = React.useState<'installed' | 'directory'>('installed')
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
        <View
          style={[
            a.flex_row,
            {borderBottomWidth: 1, borderColor: theme.palette.contrast_200},
          ]}>
          <TouchableOpacity
            accessibilityRole="button"
            style={[
              {flex: 1, alignItems: 'center', paddingVertical: 8},
              tab === 'installed' && {
                borderBottomWidth: 2,
                borderColor: theme.palette.primary_500,
              },
            ]}
            onPress={() => setTab('installed')}>
            <Text style={[a.text_md, tab === 'installed' && a.font_bold]}>
              {_(msg`Installed`)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            style={[
              {flex: 1, alignItems: 'center', paddingVertical: 8},
              tab === 'directory' && {
                borderBottomWidth: 2,
                borderColor: theme.palette.primary_500,
              },
            ]}
            onPress={() => setTab('directory')}>
            <Text style={[a.text_md, tab === 'directory' && a.font_bold]}>
              {_(msg`Directory`)}
            </Text>
          </TouchableOpacity>
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
        ) : installedGames.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 16,
            }}>
            <Text>
              <Trans>No games installed</Trans>
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              a.flex_row,
              a.flex_wrap,
              {paddingHorizontal: 16},
            ]}>
            {installedGames.map(game => (
              <View
                key={game.playUrl}
                style={[{width: 160, margin: 6, maxWidth: 160}]}>
                <InstalledGridItem game={game} />
              </View>
            ))}
          </ScrollView>
        )}
      </Layout.Center>
    </Layout.Screen>
  )
}
