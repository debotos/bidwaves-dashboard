import Axios from 'axios'
import { useSafeState } from 'ahooks'
import { Button, Modal, message } from 'antd'
import { DeleteOutlined, QuestionCircleFilled } from '@ant-design/icons'

import handleError from 'helpers/handleError'

const AsyncDeleteButton = props => {
  const { endpoint, onFinish, confirmModalProps = {}, disabled = false } = props
  const [loading, setLoading] = useSafeState(false)

  const onChange = async () => {
    try {
      setLoading(true)
      const { data } = await Axios.delete(endpoint)
      window.log(`Delete response -> `, data)
      message.success('Deleted Successfully.')
      onFinish?.(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      setLoading(false)
    }
  }

  const onClick = checked => {
    Modal.confirm({
      title: 'Please confirm before proceeding?',
      icon: <QuestionCircleFilled />,
      okText: 'Yes, Delete',
      okType: 'danger',
      content:
        'Please carefully review and verify the impacts before the delete action to ensure accuracy and prevent potential errors.',
      onOk() {
        onChange(checked)
      },
      ...confirmModalProps
    })
  }

  return (
    <Button
      disabled={disabled || loading}
      loading={loading}
      danger
      size="small"
      icon={<DeleteOutlined />}
      onClick={onClick}
    />
  )
}

export default AsyncDeleteButton
