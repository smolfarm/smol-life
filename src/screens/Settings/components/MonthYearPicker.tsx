import {Switch, Text, View} from 'react-native'
import {Trans} from '@lingui/macro'
import {Picker} from '@react-native-picker/picker'

import {atoms as a} from '#/alf'

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

type MonthYearPickerProps = {
  date: string
  onChange: (date: string) => void
  allowCurrent?: boolean
}

export default function MonthYearPicker({
  date,
  onChange,
  allowCurrent = false,
}: MonthYearPickerProps) {
  const parts = date.split('-')
  const year = parts[0] || ''
  const month = parts[1] || ''

  return (
    <View style={[a.flex_row, a.gap_md]}>
      <Picker
        style={[a.flex_1]}
        selectedValue={month}
        onValueChange={val => {
          const y = year || YEARS[0]
          onChange(`${y}-${val}-01`)
        }}>
        <Picker.Item label={_('Month')} value="" />
        {MONTHS.map(item => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>

      <Picker
        selectedValue={year}
        onValueChange={val => {
          const m = month || MONTHS[0].value
          onChange(`${val}-${m}-01`)
        }}>
        <Picker.Item label={_('Year')} value="" />
        {YEARS.map(item => (
          <Picker.Item key={item} label={item} value={item} />
        ))}
      </Picker>

      {allowCurrent && (
        <View style={[a.flex_row, a.ml_md]}>
          <Switch
            value={!date}
            onValueChange={val => {
              if (val) onChange('')
              else {
                const y = year || YEARS[0]
                const m = month || MONTHS[0].value
                onChange(`${y}-${m}-01`)
              }
            }}
          />
          <Text style={[a.ml_sm]}>
            <Trans>I currently work here</Trans>
          </Text>
        </View>
      )}
    </View>
  )
}
