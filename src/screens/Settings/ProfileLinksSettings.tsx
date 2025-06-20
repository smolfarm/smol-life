import {useEffect, useRef, useState} from 'react'
import {Pressable, TextInput} from 'react-native'
import {Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {
  type CommonNavigatorParams,
  type NativeStackScreenProps,
} from '#/lib/routes/types'
import {
  type ProfileLinkItem,
  useProfileLinksQuery,
} from '#/state/queries/profile-links'
import {useAgent, useSession} from '#/state/session'
import * as Toast from '#/view/com/util/Toast'
import {atoms as a} from '#/alf'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import * as SettingsList from './components/SettingsList'

type Props = NativeStackScreenProps<
  CommonNavigatorParams,
  'ProfileLinksSettings'
>

export function ProfileLinksSettingsScreen({}: Props) {
  const {_} = useLingui()
  const {currentAccount} = useSession()
  const agent = useAgent()
  const {data: existingLinks = [], isLoading} = useProfileLinksQuery(
    currentAccount?.did || '',
  )
  const [links, setLinks] = useState<ProfileLinkItem[]>([])

  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current && existingLinks.length > 0) {
      setLinks(existingLinks)
      initialized.current = true
    }
  }, [existingLinks])

  const saveLinks = async () => {
    // Validate URLs before saving
    for (const link of links) {
      if (!link.url) continue
      try {
        new URL(link.url)
      } catch {
        Toast.show(`Invalid URL: ${link.url}`)
        return
      }
    }
    try {
      const did = currentAccount?.did
      if (!did) throw new Error('No DID')
      const listRes = await agent.com.atproto.repo.listRecords({
        repo: did,
        collection: 'blue.linkat.board',
        limit: 1,
      })
      const records = listRes.data.records
      if (records.length > 0) {
        const rkey = (records[0] as any).rkey
        await agent.com.atproto.repo.putRecord({
          repo: did,
          collection: 'blue.linkat.board',
          rkey,
          record: {cards: links},
        })
      } else {
        await agent.com.atproto.repo.createRecord({
          repo: did,
          collection: 'blue.linkat.board',
          record: {cards: links},
        })
      }
      Toast.show('Links saved.')
    } catch {
      Toast.show('Failed to save links.')
    }
  }

  const addLink = () => setLinks([...links, {url: '', text: '', emoji: ''}])
  const updateLink = (
    idx: number,
    field: keyof ProfileLinkItem,
    value: string,
  ) => {
    const updated = [...links]
    updated[idx] = {...updated[idx], [field]: value}
    setLinks(updated)
  }
  const removeLink = (idx: number) =>
    setLinks(links.filter((_, i) => i !== idx))

  // Utility: validate single emoji
  const isSingleEmoji = (str: string) => {
    const regex = /\p{Extended_Pictographic}/u
    return Array.from(str).length === 1 && regex.test(str)
  }

  return (
    <Layout.Screen testID="profileLinksSettingsScreen">
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Manage Links</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
      <Layout.Content>
        <SettingsList.Container>
          {isLoading ? (
            <Text>
              <Trans>Loading...</Trans>
            </Text>
          ) : (
            <>
              {links.map((link, idx) => (
                <SettingsList.Item key={idx} style={[a.flex_col, a.mb_md]}>
                  <TextInput
                    accessibilityLabel="Text input field"
                    accessibilityHint={_(`Input emoji for link ${idx + 1}`)}
                    placeholder={_('Emoji')}
                    value={link.emoji}
                    onChangeText={text => {
                      // Allow only single emoji or empty
                      if (text === '' || isSingleEmoji(text)) {
                        updateLink(idx, 'emoji', text)
                      }
                    }}
                    style={[a.border, a.px_md, a.py_sm]}
                  />
                  <TextInput
                    accessibilityLabel="Text input field"
                    accessibilityHint={_(`Input text for link ${idx + 1}`)}
                    placeholder={_('Text')}
                    value={link.text}
                    onChangeText={text => updateLink(idx, 'text', text)}
                    style={[a.border, a.px_md, a.py_sm, a.mt_sm]}
                  />
                  <TextInput
                    accessibilityLabel="Text input field"
                    accessibilityHint={_(`Input URL for link ${idx + 1}`)}
                    value={link.url}
                    onChangeText={text => updateLink(idx, 'url', text)}
                    style={[a.border, a.px_md, a.py_sm, a.mt_sm]}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => removeLink(idx)}
                    style={[a.mt_sm, a.align_end]}>
                    <Text style={[a.text_sm]}>
                      <Trans>Delete</Trans>
                    </Text>
                  </Pressable>
                </SettingsList.Item>
              ))}
              <Pressable
                accessibilityRole="button"
                onPress={addLink}
                style={[a.mt_md, a.align_center]}>
                <Text style={[a.text_md]}>
                  <Trans>Add Link</Trans>
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={saveLinks}
                style={[a.mt_md, a.align_center]}>
                <Text style={[a.text_md]}>
                  <Trans>Save</Trans>
                </Text>
              </Pressable>
            </>
          )}
        </SettingsList.Container>
      </Layout.Content>
    </Layout.Screen>
  )
}
