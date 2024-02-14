import React, { useRef } from 'react'
import { useSafeState } from 'ahooks'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Input, Space, Select, Divider } from 'antd'

const CustomSelect = ({ onAddSelectToo = true, initialOptions, ...rest }) => {
  const inputRef = useRef(null)
  const [text, setText] = useSafeState('')
  const [options, setOptions] = useSafeState(initialOptions ?? [])

  const addItem = e => {
    e.preventDefault()
    if (text) {
      const _text = text.trim()
      setOptions(prev => [...prev, { label: _text, value: _text }])

      if (onAddSelectToo) {
        rest.onChange?.([...(rest.value ?? []), _text])
      }

      setText('')
    }
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <Select
      allowClear
      mode="tags"
      placeholder="Campaign Goal"
      options={options}
      dropdownRender={menu => (
        <>
          {menu}
          <Divider className="my-2" />
          <Space.Compact className="w-100">
            <Input
              placeholder="Other"
              ref={inputRef}
              value={text}
              onChange={e => {
                const val = e.target.value
                setText(val)
              }}
              onKeyDown={e => e.stopPropagation()}
              onPressEnter={addItem}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={addItem}>
              Add Goal
            </Button>
          </Space.Compact>
        </>
      )}
      {...rest}
    />
  )
}

export default CustomSelect
