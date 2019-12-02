/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import React, { useState } from 'react'
import Dropdown from '../../dropdown'
import { Menu, MenuItem,MenuItemDisabled } from '../../menu'
import TextField from '../../text-field'
import styled from 'styled-components'
import { getFilteredSuggestions, inputMatchesSuggestions } from './enumHelper'
import PropTypes from 'prop-types'
const sources = require('../../../component/singletons/sources-instance')
const TextWrapper = styled.div`
  padding: ${({ theme }) => theme.minimumSpacing};
`
const EnumMenuItem = props => (
  <MenuItemDisabled {...props} style={{ paddingLeft: '1.5rem' }} />
)
const UnsupportedAttribute = styled.div`
border-style: solid
border-color: red
`
const isAttributeDisabled = (AllSupportedAttributes, currValue) => {
  //All attributes are supprted
  if (AllSupportedAttributes.length == 0) {
    return false
  }
  //If attribute is supporteed in dont disable the option
  if (AllSupportedAttributes.indexOf(currValue) >= 0) {
    return false
  }
  //attribute was not found in the supported list therefore disbale the option
  return true
}
const isAttributeUnsupported = (currValue, settingsModel) => {
  // if no source is selected gather all supportedAttributes from all available sources
  if (settingsModel.length == 0) {
    let AllSupportedAttributes = sources.models.map(source => {
      //NDL EAST is only supported in NCL-Search not in advanced search
      if (!(source.id == 'NDL-East')) {
        return source.attributes.supportedAttributes
      }
      return []
    })
    AllSupportedAttributes = AllSupportedAttributes.flat()
    AllSupportedAttributes.push('ext.acquisition-status')
    return isAttributeDisabled(AllSupportedAttributes, currValue)
  } else {
    let sourceModelsSelected = sources.models.filter(source =>
      settingsModel.includes(source.id)
    )

    let AllSupportedAttributes = sourceModelsSelected.map(sourceSelected => {
      if (sourceSelected.id == 'GIMS_GIN') {
        return ['ext.alternate-identifier-qualifier']
      }
      if (!(sourceSelected.id == 'NDL-East')) {
        return sourceSelected.attributes.supportedAttributes
      }
      return []
    })

    AllSupportedAttributes = AllSupportedAttributes.flat()
    return isAttributeDisabled(AllSupportedAttributes, currValue)
  }
}

const isAttributeUnsupportedHelper = (settingsModel, suggestion) => {
  //if settingsModel is passed down from a parent componenet , proceed to check if the  attribute is unsupported
  return (
    settingsModel &&
    isAttributeUnsupported(suggestion.value, settingsModel.attributes.src)
  )
}

const EnumInput = ({
  allowCustom,
  matchCase,
  onChange,
  suggestions,
  value,
  settingsModel,
}) => {
  const [input, setInput] = useState('')


  const selected = suggestions.find(suggestion => suggestion.value === value)

  const filteredSuggestions = getFilteredSuggestions(
    input,
    suggestions,
    matchCase
  )

  const displayInput = !inputMatchesSuggestions(input, suggestions, matchCase)

  const attributeDropdown = (
    <Dropdown label={(selected && selected.label) || value}>
      <TextWrapper>
        <TextField
          autoFocus
          value={input}
          placeholder={'Type to Filter'}
          onChange={setInput}
        />
      </TextWrapper>
      <Menu value={value} onChange={onChange} class="fa">
        {allowCustom &&
          displayInput && (
            <EnumMenuItem value={input}>{input} (custom)</EnumMenuItem>
          )}
        {filteredSuggestions.map(suggestion => {
          return (
            <EnumMenuItem
              title={
                isAttributeUnsupportedHelper(settingsModel, suggestion)
                  ? 'Attribute is unsupported by the content store selected'
                  : ''
              }
              key={suggestion.value}
              value={suggestion.value}
              disabled={isAttributeUnsupportedHelper(settingsModel, suggestion)}
            >
              {suggestion.label}
            </EnumMenuItem>

           )
      })}
    </Menu>
  </Dropdown>

  )
  return (
    <div>
      {isAttributeUnsupportedHelper(settingsModel, selected) ? (
        <div>
          <UnsupportedAttribute title="Attribute is unsupported by the content store">
            {attributeDropdown}
          </UnsupportedAttribute>
          <div style={{ color: 'red' }}>
            {' '}
            This selection does not work with the content store selected{' '}
          </div>
        </div>
      ) : (
        <div>{attributeDropdown}</div>
      )}
    </div>
  )
}

EnumInput.propTypes = {
  /** The current selected value. */
  value: PropTypes.string,

  /** Value change handler. */
  onChange: PropTypes.func.isRequired,

  /** Array that represents the options. [{ label: string, value: string}] */
  suggestions: PropTypes.array.isRequired,

  /** Should filtering be case sensitive? */
  matchCase: PropTypes.bool,

  /** Should custom values be allowed? */
  allowCustom: PropTypes.bool,


}
export default EnumInput