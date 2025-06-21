import {useEffect, useRef, useState} from 'react'
import {ScrollView, TextInput, View} from 'react-native'
import {Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {type NativeStackScreenProps} from '@react-navigation/native-stack'

import {type CommonNavigatorParams} from '#/lib/routes/types'
import {
  type CvRecord,
  type EducationEntry,
  type JobEntry,
  useCvQuery,
} from '#/state/queries/cv'
import {useAgent, useSession} from '#/state/session'
import * as Toast from '#/view/com/util/Toast'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography' // add Text import
import MonthYearPicker from './components/MonthYearPicker' // new date picker component
import * as SettingsList from './components/SettingsList'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'ResumeSettings'>

export function CvSettingsScreen({}: Props) {
  const {_} = useLingui()
  const theme = useTheme()
  const {currentAccount} = useSession()
  const agent = useAgent()
  const did = currentAccount?.did || ''
  const {data: existing, isLoading} = useCvQuery(did)

  const defaultCv: CvRecord = {
    name: '',
    overview: '',
    jobHistory: [],
    educationHistory: [],
    skills: [],
  }

  const [cv, setCv] = useState<CvRecord>(defaultCv)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current && existing) {
      setCv(existing)
      initialized.current = true
    }
  }, [existing])

  const saveCv = async () => {
    try {
      if (!did) throw new Error('No DID')
      const listRes = await agent.com.atproto.repo.listRecords({
        repo: did,
        collection: 'life.smol.resume',
        limit: 1,
      })
      if (listRes.data.records.length > 0) {
        await agent.com.atproto.repo.putRecord({
          record: cv as unknown as {[x: string]: unknown},
          repo: did,
          collection: 'life.smol.resume',
          rkey: 'primary',
        })
      } else {
        await agent.com.atproto.repo.createRecord({
          repo: did,
          collection: 'life.smol.resume',
          record: cv as unknown as {[x: string]: unknown},
          rkey: 'primary',
        })
      }
      Toast.show('CV saved.')
    } catch (e) {
      Toast.show('Failed to save CV.')
    }
  }

  const updateField = (key: keyof CvRecord, value: any) => {
    setCv(prev => ({...prev, [key]: value} as CvRecord))
  }

  const updateJob = (idx: number, field: keyof JobEntry, value: string) => {
    const jobs = [...cv.jobHistory]
    jobs[idx] = {...jobs[idx], [field]: value}
    updateField('jobHistory', jobs)
  }

  const addJob = () =>
    updateField('jobHistory', [
      ...cv.jobHistory,
      {company: '', position: '', startDate: ''},
    ])
  const removeJob = (idx: number) =>
    updateField(
      'jobHistory',
      cv.jobHistory.filter((_, i) => i !== idx),
    )

  const updateEducation = (
    idx: number,
    field: keyof EducationEntry,
    value: string,
  ) => {
    const edu = [...cv.educationHistory]
    edu[idx] = {...edu[idx], [field]: value}
    updateField('educationHistory', edu)
  }

  const addEducation = () =>
    updateField('educationHistory', [
      ...cv.educationHistory,
      {institution: '', degree: '', startDate: ''},
    ])
  const removeEducation = (idx: number) =>
    updateField(
      'educationHistory',
      cv.educationHistory.filter((_, i) => i !== idx),
    )

  const updateSkill = (idx: number, value: string) => {
    const skills = [...cv.skills]
    skills[idx] = value
    updateField('skills', skills)
  }

  const addSkill = () => updateField('skills', [...cv.skills, ''])
  const removeSkill = (idx: number) =>
    updateField(
      'skills',
      cv.skills.filter((_, i) => i !== idx),
    )

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>CV Settings</Trans>
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
                <Text
                  style={[
                    a.text_md,
                    a.font_bold,
                    a.mb_lg,
                    theme.atoms.text_contrast_high,
                  ]}>
                  <Trans>Overview</Trans>
                </Text>
                <SettingsList.Item>
                  <SettingsList.ItemText>
                    <Trans>Name</Trans>
                  </SettingsList.ItemText>
                  <TextInput
                    accessibilityLabel="Text input field"
                    accessibilityHint={_('Name')}
                    placeholder={_('Name')}
                    value={cv.name}
                    onChangeText={text => updateField('name', text)}
                    style={[
                      a.border,
                      a.rounded_sm,
                      theme.atoms.bg_contrast_25,
                      a.px_md,
                      a.py_sm,
                    ]}
                  />
                </SettingsList.Item>
                <SettingsList.Item>
                  <SettingsList.ItemText>
                    <Trans>Overview</Trans>
                  </SettingsList.ItemText>
                  <TextInput
                    accessibilityLabel="Text input field"
                    multiline
                    accessibilityHint={_('Overview')}
                    placeholder={_('Overview')}
                    value={cv.overview}
                    onChangeText={text => updateField('overview', text)}
                    style={[
                      a.border,
                      a.rounded_sm,
                      theme.atoms.bg_contrast_25,
                      a.px_md,
                      a.py_sm,
                      {height: 100},
                    ]}
                  />
                </SettingsList.Item>

                <Text
                  style={[
                    a.text_md,
                    a.font_bold,
                    a.mb_lg,
                    theme.atoms.text_contrast_high,
                  ]}>
                  <Trans>Work History</Trans>
                </Text>
                {cv.jobHistory.map((job, idx) => (
                  <SettingsList.Item key={idx} style={[a.mb_md]}>
                    <TextInput
                      accessibilityLabel="Text input field"
                      accessibilityHint={_('Company')}
                      placeholder={_('Company')}
                      value={job.company}
                      onChangeText={text => updateJob(idx, 'company', text)}
                      style={[
                        a.border,
                        a.rounded_sm,
                        theme.atoms.bg_contrast_25,
                        a.px_md,
                        a.py_sm,
                      ]}
                    />
                    <TextInput
                      accessibilityLabel="Text input field"
                      accessibilityHint={_('Position')}
                      placeholder={_('Position')}
                      value={job.position}
                      onChangeText={text => updateJob(idx, 'position', text)}
                      style={[
                        a.border,
                        a.rounded_sm,
                        theme.atoms.bg_contrast_25,
                        a.px_md,
                        a.py_sm,
                        a.mt_sm,
                      ]}
                    />
                    <View style={[a.flex_row, a.align_center, a.gap_sm]}>
                      <MonthYearPicker
                        date={job.startDate}
                        onChange={d => updateJob(idx, 'startDate', d)}
                      />
                      <Text
                        style={[
                          theme.atoms.text_contrast_medium,
                          a.self_center,
                        ]}>
                        <Trans>to</Trans>
                      </Text>
                      <MonthYearPicker
                        date={job.endDate || ''}
                        onChange={d => updateJob(idx, 'endDate', d)}
                        allowCurrent
                      />
                    </View>
                    <TextInput
                      multiline
                      accessibilityLabel="Text input field"
                      accessibilityHint={_('Description')}
                      placeholder={_('Description')}
                      value={job.description || ''}
                      onChangeText={text => updateJob(idx, 'description', text)}
                      style={[
                        a.border,
                        a.rounded_sm,
                        theme.atoms.bg_contrast_25,
                        a.px_md,
                        a.py_sm,
                        a.mt_sm,
                      ]}
                    />
                    <Button
                      accessibilityHint={_('Delete job')}
                      label={_('Delete')}
                      variant="solid"
                      color="negative"
                      size="small"
                      onPress={() => removeJob(idx)}
                      style={[a.mt_sm, a.align_end]}>
                      <ButtonText>
                        <Trans>Delete</Trans>
                      </ButtonText>
                    </Button>
                  </SettingsList.Item>
                ))}
                <Button
                  label={_('Add Job')}
                  variant="solid"
                  color="primary"
                  size="large"
                  onPress={addJob}
                  style={[a.mb_md, a.align_center]}>
                  <ButtonText>
                    <Trans>Add Job</Trans>
                  </ButtonText>
                </Button>

                <Text
                  style={[
                    a.text_md,
                    a.font_bold,
                    a.mb_lg,
                    theme.atoms.text_contrast_high,
                  ]}>
                  <Trans>Education</Trans>
                </Text>
                {cv.educationHistory.map((edu, idx) => (
                  <SettingsList.Item key={idx} style={[a.mb_md]}>
                    <TextInput
                      accessibilityLabel="Text input field"
                      accessibilityHint={_('Institution')}
                      placeholder={_('Institution')}
                      value={edu.institution}
                      onChangeText={text =>
                        updateEducation(idx, 'institution', text)
                      }
                      style={[
                        a.border,
                        a.rounded_sm,
                        theme.atoms.bg_contrast_25,
                        a.px_md,
                        a.py_sm,
                      ]}
                    />
                    <TextInput
                      accessibilityLabel="Text input field"
                      accessibilityHint={_('Degree')}
                      placeholder={_('Degree')}
                      value={edu.degree}
                      onChangeText={text =>
                        updateEducation(idx, 'degree', text)
                      }
                      style={[
                        a.border,
                        a.rounded_sm,
                        theme.atoms.bg_contrast_25,
                        a.px_md,
                        a.py_sm,
                        a.mt_sm,
                      ]}
                    />
                    <View style={[a.flex_row, a.align_center, a.gap_sm]}>
                      <MonthYearPicker
                        date={edu.startDate}
                        onChange={d => updateEducation(idx, 'startDate', d)}
                      />
                      <Text
                        style={[
                          theme.atoms.text_contrast_medium,
                          a.self_center,
                        ]}>
                        <Trans>to</Trans>
                      </Text>
                      <MonthYearPicker
                        date={edu.endDate || ''}
                        onChange={d => updateEducation(idx, 'endDate', d)}
                        allowCurrent
                      />
                    </View>
                    <TextInput
                      multiline
                      accessibilityLabel="Text input field"
                      accessibilityHint={_('Description')}
                      placeholder={_('Description')}
                      value={edu.description || ''}
                      onChangeText={text =>
                        updateEducation(idx, 'description', text)
                      }
                      style={[
                        a.border,
                        a.rounded_sm,
                        theme.atoms.bg_contrast_25,
                        a.px_md,
                        a.py_sm,
                        a.mt_sm,
                      ]}
                    />
                    <Button
                      accessibilityHint={_('Delete education')}
                      label={_('Delete')}
                      variant="solid"
                      color="negative"
                      size="small"
                      onPress={() => removeEducation(idx)}
                      style={[a.mt_sm, a.align_end]}>
                      <ButtonText>
                        <Trans>Delete</Trans>
                      </ButtonText>
                    </Button>
                  </SettingsList.Item>
                ))}
                <Button
                  label={_('Add Education')}
                  variant="solid"
                  color="primary"
                  size="large"
                  onPress={addEducation}
                  style={[a.mb_md, a.align_center]}>
                  <ButtonText>
                    <Trans>Add Education</Trans>
                  </ButtonText>
                </Button>

                <Text
                  style={[
                    a.text_md,
                    a.font_bold,
                    a.mb_lg,
                    theme.atoms.text_contrast_high,
                  ]}>
                  <Trans>Skills</Trans>
                </Text>
                {cv.skills.map((skill, idx) => (
                  <SettingsList.Item key={idx} style={[a.mb_md]}>
                    <TextInput
                      accessibilityLabel="Text input field"
                      accessibilityHint={_('Skill')}
                      placeholder={_('Skill')}
                      value={skill}
                      onChangeText={text => updateSkill(idx, text)}
                      style={[
                        a.border,
                        a.rounded_sm,
                        theme.atoms.bg_contrast_25,
                        a.px_md,
                        a.py_sm,
                      ]}
                    />
                    <Button
                      accessibilityHint={_('Delete skill')}
                      label={_('Delete')}
                      variant="solid"
                      color="negative"
                      size="small"
                      onPress={() => removeSkill(idx)}
                      style={[a.mt_sm, a.align_end]}>
                      <ButtonText>
                        <Trans>Delete</Trans>
                      </ButtonText>
                    </Button>
                  </SettingsList.Item>
                ))}
                <Button
                  label={_('Add Skill')}
                  variant="solid"
                  color="primary"
                  size="large"
                  onPress={addSkill}
                  style={[a.mb_md, a.align_center]}>
                  <ButtonText>
                    <Trans>Add Skill</Trans>
                  </ButtonText>
                </Button>

                <SettingsList.Divider />
                <Button
                  label={_('Save')}
                  variant="solid"
                  color="primary"
                  size="large"
                  onPress={saveCv}
                  style={[a.align_center]}>
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
