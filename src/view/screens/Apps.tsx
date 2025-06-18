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
//import {Divider} from '#/components/Divider'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import {UserAvatar} from '../com/util/UserAvatar'

function AppListItem({
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
            label={_(msg`Use ${title}`)}
            onPress={() => Linking.openURL(playUrl)}
            size="small"
            style={[{paddingHorizontal: 16, borderRadius: 8}]}>
            <ButtonText>{_(msg`Use`)}</ButtonText>
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

export function AppsScreen() {
  type App = (typeof apps)[0]
  // grid icon item
  const InstalledGridItem = ({app}: {app: App}) => {
    const {data: profile} = useProfileQuery({did: app.did})
    return (
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => Linking.openURL(app.playUrl)}
        style={{width: '30%', padding: 8, alignItems: 'center'}}>
        <UserAvatar type="user" size={64} avatar={profile?.avatar} />
        <Text style={[a.text_xs, a.text_center, a.mt_md]} numberOfLines={1}>
          {app.title}
        </Text>
      </TouchableOpacity>
    )
  }

  const {_} = useLingui()
  const theme = useTheme()
  // installed state
  const {data: installedRecords = []} = useInstalledRecordsQuery()
  const [tab, setTab] = React.useState<'installed' | 'directory'>('installed')
  // static app directory
  const apps = [
    {
      title: 'linkat.blue',
      description:
        'Tree of links stored in your PDS. Natively displays in smol life profiles.',
      accountHandle: 'linkat.blue',
      did: 'did:plc:thpg3rkgfslxsgeekhkxgdyu',
      playUrl: 'https://linkat.blue',
    },
  ]
  const installedApps = apps.filter(app =>
    installedRecords.some(r => r.uri === app.playUrl),
  )

  return (
    <Layout.Screen testID="AppsScreen">
      <Layout.Center>
        <Layout.Header.Outer>
          <Layout.Header.BackButton />
          <Layout.Header.Content>
            <Layout.Header.TitleText>
              <Trans>Apps</Trans>
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
            {apps.map(app => (
              <AppListItem
                key={app.playUrl}
                title={app.title}
                description={app.description}
                accountHandle={app.accountHandle}
                did={app.did}
                playUrl={app.playUrl}
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
            {installedApps.map(app => (
              <View style={{width: '45%', margin: 8}} key={app.playUrl}>
                <InstalledGridItem app={app} />
              </View>
            ))}
          </ScrollView>
        )}
      </Layout.Center>
    </Layout.Screen>
  )
}
