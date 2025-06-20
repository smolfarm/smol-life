import {useEffect, useRef, useState} from 'react'
import {TextInput} from 'react-native'
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
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import * as SettingsList from './components/SettingsList'

type Props = NativeStackScreenProps<
  CommonNavigatorParams,
  'ProfileLinksSettings'
>

export function ProfileLinksSettingsScreen({}: Props) {
  const {_} = useLingui()
  const t = useTheme()
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
                  <SettingsList.ItemText>
                    <Trans>Link {idx + 1}</Trans>
                  </SettingsList.ItemText>
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
                    style={[
                      a.border,
                      a.rounded_sm,
                      t.atoms.bg_contrast_25,
                      a.px_md,
                      a.py_sm,
                    ]}
                  />
                  <TextInput
                    accessibilityLabel="Text input field"
                    accessibilityHint={_(`Input text for link ${idx + 1}`)}
                    placeholder={_('Text')}
                    value={link.text}
                    onChangeText={text => updateLink(idx, 'text', text)}
                    style={[
                      a.border,
                      a.rounded_sm,
                      t.atoms.bg_contrast_25,
                      a.px_md,
                      a.py_sm,
                      a.mt_sm,
                    ]}
                  />
                  <TextInput
                    accessibilityLabel="Text input field"
                    accessibilityHint={_(`Input URL for link ${idx + 1}`)}
                    placeholder={_('URL')}
                    value={link.url}
                    onChangeText={text => updateLink(idx, 'url', text)}
                    style={[
                      a.border,
                      a.rounded_sm,
                      t.atoms.bg_contrast_25,
                      a.px_md,
                      a.py_sm,
                      a.mt_sm,
                    ]}
                  />
                  <Button
                    label={_('Delete')}
                    variant="solid"
                    color="negative"
                    size="small"
                    onPress={() => removeLink(idx)}
                    style={[a.mt_sm, a.align_end]}>
                    <ButtonText>
                      <Trans>Delete</Trans>
                    </ButtonText>
                  </Button>
                </SettingsList.Item>
              ))}
              <Button
                label={_('Add Link')}
                variant="solid"
                color="primary"
                size="large"
                onPress={addLink}
                style={[a.m_md, a.align_center]}>
                <ButtonText>
                  <Trans>Add Link</Trans>
                </ButtonText>
              </Button>
              <Button
                label={_('Save')}
                variant="solid"
                color="primary"
                size="large"
                onPress={saveLinks}
                style={[a.m_md, a.align_center]}>
                <ButtonText>
                  <Trans>Save</Trans>
                </ButtonText>
              </Button>
            </>
          )}
        </SettingsList.Container>
      </Layout.Content>
    </Layout.Screen>
  )
}
