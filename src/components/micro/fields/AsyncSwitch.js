import Axios from 'axios'
import { useSafeState } from 'ahooks'
import { Modal, Switch, message } from 'antd'
import { CheckOutlined, CloseOutlined, QuestionCircleFilled } from '@ant-design/icons'

import handleError from 'helpers/handleError'

const AsyncSwitch = props => {
  const { disabled, initVal, endpoint, onFinish, fieldKey, confirmModalProps = {} } = props
  const [val, setVal] = useSafeState(!!initVal)
  const [loading, setLoading] = useSafeState(false)

  const onChange = async checked => {
    try {
      setLoading(true)
      const { data } = await Axios.patch(endpoint, { [fieldKey]: checked })
      setVal(checked)
      window.log(`Update response -> `, data)
      message.success('Action successful.')
      onFinish?.(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = checked => {
    Modal.confirm({
      title: 'Please confirm before proceeding?',
      icon: <QuestionCircleFilled />,
      content:
        'Please carefully review and verify the changes before proceeding to ensure accuracy and prevent potential errors.',
      onOk() {
        onChange(checked)
      },
      ...confirmModalProps
    })
  }

  return (
    <Switch
      checked={val}
      loading={loading}
      disabled={!!disabled}
      checkedChildren={<CheckOutlined />}
      unCheckedChildren={<CloseOutlined />}
      onChange={handleChange}
    />
  )
}

export default AsyncSwitch
