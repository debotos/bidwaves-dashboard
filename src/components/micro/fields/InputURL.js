import React from 'react'
import { Input } from 'antd'
import { useSafeState } from 'ahooks'

import { isEmpty } from 'helpers/utility'

const InputURL = props => {
  const { value, onChange } = props

  // State to manage the input value
  const [inputValue, setInputValue] = useSafeState(value)

  // Custom formatter function
  const formatInput = inputValue => {
    if (isEmpty(inputValue)) return undefined
    // Check if the value starts with 'http://' or 'https://'
    if (inputValue.startsWith('http://') || inputValue.startsWith('https://')) {
      // If it's a valid format, leave it as is
      return inputValue
    } else {
      // If it's an invalid format, add 'https://'
      return `https://${inputValue}`
    }
  }

  const handleBlur = () => {
    const formattedValue = formatInput(inputValue)
    setInputValue(formattedValue) // Update the input value in state
    onChange(formattedValue) // Call the parent component's onChange with the formatted value
  }

  const handleChange = e => {
    const { value: newInputValue } = e.target
    setInputValue(newInputValue) // Update the input value in state
  }

  return (
    <Input
      {...props}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur} // Format the input value when onBlur
    />
  )
}

export default InputURL
