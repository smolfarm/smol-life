import {useEffect, useRef, useState} from 'react'
import {ScrollView, TextInput, View} from 'react-native'
import {Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {Picker} from '@react-native-picker/picker'
import {type NativeStackScreenProps} from '@react-navigation/native-stack'

import {type CommonNavigatorParams} from '#/lib/routes/types'
import {type TipMethod, useTipQuery} from '#/state/queries/tips'
import {useAgent, useSession} from '#/state/session'
import * as Toast from '#/view/com/util/Toast'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import * as SettingsList from './components/SettingsList'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'TipSettings'>

export function TipSettingsScreen({}: Props) {
  const {_} = useLingui()
  const theme = useTheme()
  const {currentAccount} = useSession()
  const agent = useAgent()
  const did = currentAccount?.did || ''
  const {data: existing, isLoading} = useTipQuery(did)

  const defaultMethods: TipMethod[] = []
  const [methods, setMethods] = useState<TipMethod[]>(defaultMethods)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current && existing) {
      setMethods(existing)
      initialized.current = true
    }
  }, [existing])

  const updateMethod = (idx: number, field: keyof TipMethod, value: string) => {
    const updated = [...methods]
    updated[idx] = {...updated[idx], [field]: value}
    setMethods(updated)
  }

  const addMethod = () => {
    setMethods(prev => [...prev, {type: 'venmo', value: ''}])
  }

  const removeMethod = (idx: number) => {
    setMethods(prev => prev.filter((_, i) => i !== idx))
  }

  const saveTips = async () => {
    if (!did) {
      Toast.show(_('No DID'))
      return
    }
    try {
      const listRes = await agent.com.atproto.repo.listRecords({
        repo: did,
        collection: 'life.smol.tipJar',
        limit: 100,
      })
      const existing = listRes.data.records as any[]
      // Delete all existing tip methods
      for (const rec of existing) {
        // Derive rkey from record URI
        const rkey = rec.uri.split('/').pop() as string
        await agent.com.atproto.repo.deleteRecord({
          repo: did,
          collection: 'life.smol.tipJar',
          rkey,
        })
      }

      // Create new tip method records
      let idx = 0
      for (const method of methods) {
        await agent.com.atproto.repo.createRecord({
          repo: did,
          collection: 'life.smol.tipJar',
          record: method as unknown as {[key: string]: unknown},
          rkey: idx.toString(),
        })

        idx++
      }
      Toast.show(_('Tips saved.'))
    } catch (error) {
      console.error(error)
      Toast.show(_('Failed to save tips.'))
    }
  }

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Tip Settings</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
      <Layout.Content>
        <ScrollView contentContainerStyle={a.px_md}>
          <SettingsList.Container>
            {isLoading ? (
              <Text>
                <Trans>Loading...</Trans>
              </Text>
            ) : (
              <>
                {methods.map((method, idx) => (
                  <SettingsList.Item key={idx} style={[a.mb_md]}>
                    <View
                      style={[a.flex_row, a.justify_between, a.align_center]}>
                      <View style={{flex: 1, marginRight: 8}}>
                        <Picker
                          selectedValue={method.type}
                          onValueChange={value =>
                            updateMethod(idx, 'type', value as any)
                          }
                          style={[
                            a.border,
                            a.rounded_sm,
                            theme.atoms.bg_contrast_25,
                            a.px_md,
                            a.py_sm,
                          ]}>
                          <Picker.Item label="Venmo" value="venmo" />
                          <Picker.Item label="Cash App" value="cashapp" />
                          <Picker.Item label="ETH Address" value="eth" />
                        </Picker>
                      </View>
                      <View style={{flex: 1}}>
                        <TextInput
                          accessibilityLabel="Text input field"
                          accessibilityHint={_('Tip value')}
                          placeholder={_('Account or address')}
                          value={method.value}
                          onChangeText={text =>
                            updateMethod(idx, 'value', text)
                          }
                          style={[
                            a.border,
                            a.rounded_sm,
                            theme.atoms.bg_contrast_25,
                            a.px_md,
                            a.py_sm,
                          ]}
                        />
                      </View>
                    </View>
                    <Button
                      label={_('Delete')}
                      variant="solid"
                      color="negative"
                      size="small"
                      onPress={() => removeMethod(idx)}
                      style={[a.mt_sm, a.align_end]}>
                      <ButtonText>
                        <Trans>Delete</Trans>
                      </ButtonText>
                    </Button>
                  </SettingsList.Item>
                ))}
                <Button
                  label={_('Add Tip Method')}
                  variant="solid"
                  color="primary"
                  size="large"
                  onPress={addMethod}
                  style={[a.m_md, a.align_center]}>
                  <ButtonText>
                    <Trans>Add Tip Method</Trans>
                  </ButtonText>
                </Button>
                <Button
                  label={_('Save')}
                  variant="solid"
                  color="primary"
                  size="large"
                  onPress={saveTips}
                  style={[a.m_md, a.align_center]}>
                  <ButtonText>
                    <Trans>Save</Trans>
                  </ButtonText>
                </Button>
              </>
            )}
          </SettingsList.Container>
        </ScrollView>
      </Layout.Content>
    </Layout.Screen>
  )
}
