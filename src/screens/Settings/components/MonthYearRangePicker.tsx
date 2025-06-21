import React from 'react'
import {Switch, Text, View} from 'react-native'
import {Trans} from '@lingui/macro'
import {Picker} from '@react-native-picker/picker'

import {atoms as a, useTheme} from '#/alf'

const _: (msg: string) => string = msg => msg

const MONTHS = [
  {label: _('Jan'), value: '01'},
  {label: _('Feb'), value: '02'},
  {label: _('Mar'), value: '03'},
  {label: _('Apr'), value: '04'},
  {label: _('May'), value: '05'},
  {label: _('Jun'), value: '06'},
  {label: _('Jul'), value: '07'},
  {label: _('Aug'), value: '08'},
  {label: _('Sep'), value: '09'},
  {label: _('Oct'), value: '10'},
  {label: _('Nov'), value: '11'},
  {label: _('Dec'), value: '12'},
]

const YEARS = Array.from(
  {length: 50},
  (_, i) => `${new Date().getFullYear() - i}`,
)

type MonthYearRangePickerProps = {
  startDate: string
  endDate: string
  onStartChange: (date: string) => void
  onEndChange: (date: string) => void
  allowCurrent?: boolean
}

export default function MonthYearRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  allowCurrent = false,
}: MonthYearRangePickerProps) {
  const theme = useTheme()
  const [isCurrent, setIsCurrent] = React.useState(!endDate)
  const partsStart = startDate.split('-')
  const startYear = partsStart[0] || ''
  const startMonth = partsStart[1] || ''
  const partsEnd = endDate.split('-')
  const endYear = partsEnd[0] || ''
  const endMonth = partsEnd[1] || ''

  const handleCurrentToggle = (val: boolean) => {
    setIsCurrent(val)
    if (val) onEndChange('')
    else
      onEndChange(
        `${startYear || YEARS[0]}-${startMonth || MONTHS[0].value}-01`,
      )
  }

  return (
    <View style={[a.flex_row, a.align_center, a.gap_md]}>
      {/* Start */}
      <Picker
        style={[
          a.flex_1,
          a.px_sm,
          a.py_xs,
          a.rounded_sm,
          a.border,
          {borderColor: 'black'},
        ]}
        itemStyle={{color: theme.atoms.text_contrast_high.color}}
        selectedValue={startMonth}
        onValueChange={val => {
          onStartChange(`${startYear || YEARS[0]}-${val}-01`)
        }}>
        <Picker.Item label={_('Month')} value="" />
        {MONTHS.map(item => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
      <Picker
        style={[
          a.flex_1,
          a.px_sm,
          a.py_xs,
          a.rounded_sm,
          a.border,
          {borderColor: 'black'},
        ]}
        itemStyle={{color: theme.atoms.text_contrast_high.color}}
        selectedValue={startYear}
        onValueChange={val => {
          onStartChange(`${val}-${startMonth || MONTHS[0].value}-01`)
        }}>
        <Picker.Item label={_('Year')} value="" />
        {YEARS.map(item => (
          <Picker.Item key={item} label={item} value={item} />
        ))}
      </Picker>

      {/* Current */}
      {allowCurrent && (
        <>
          <Switch value={isCurrent} onValueChange={handleCurrentToggle} />
          <Text style={[a.ml_sm, theme.atoms.text_contrast_high]}>
            <Trans>Current</Trans>
          </Text>
        </>
      )}

      {/* To */}
      {!isCurrent && (
        <>
          <Text style={[a.ml_sm, theme.atoms.text_contrast_medium]}>
            <Trans>to</Trans>
          </Text>
          <Picker
            style={[
              a.flex_1,
              a.px_sm,
              a.py_xs,
              a.rounded_sm,
              a.border,
              {borderColor: 'black'},
            ]}
            itemStyle={{color: theme.atoms.text_contrast_high.color}}
            selectedValue={endMonth}
            onValueChange={val => {
              onEndChange(`${endYear || YEARS[0]}-${val}-01`)
            }}>
            <Picker.Item label={_('Month')} value="" />
            {MONTHS.map(item => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
          <Picker
            style={[
              a.flex_1,
              a.px_sm,
              a.py_xs,
              a.rounded_sm,
              a.border,
              {borderColor: 'black'},
            ]}
            itemStyle={{color: theme.atoms.text_contrast_high.color}}
            selectedValue={endYear}
            onValueChange={val => {
              onEndChange(`${val}-${endMonth || MONTHS[0].value}-01`)
            }}>
            <Picker.Item label={_('Year')} value="" />
            {YEARS.map(item => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        </>
      )}
    </View>
  )
}
