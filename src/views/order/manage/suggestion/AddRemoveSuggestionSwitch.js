import Axios from 'axios'
import { useSafeState } from 'ahooks'
import { Modal, Switch, message } from 'antd'
import { CheckOutlined, CloseOutlined, QuestionCircleFilled } from '@ant-design/icons'

import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'

const AddRemoveSuggestionSwitch = props => {
  const { product, orderId, confirmModalProps = {} } = props
  const [val, setVal] = useSafeState(!!product.suggested)
  const [loading, setLoading] = useSafeState(false)

  const onChange = async checked => {
    try {
      setVal(checked)
      setLoading(true)
      if (checked) {
        const { data } = await Axios.patch(endpoints.order(orderId) + '/product-suggestion', [product.id])
        window.log(`Suggestion add response -> `, data)
        message.success('Action successful.')
        if (product.active === false) message.warning('However, the product is not currently active.')
      } else {
        const { data } = await Axios.delete(endpoints.order(orderId) + `/product-suggestion/${product.id}`)
        window.log(`Suggestion delete response -> `, data)
        message.success('Action successful.')
      }
    } catch (error) {
      setVal(!checked)
      handleError(error, true)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = checked => {
    Modal.confirm({
      title: 'Please confirm before proceeding?',
      icon: <QuestionCircleFilled />,
      content: `The product with the name "${product.name}" will be ${
        checked ? 'added as a' : 'removed from'
      } suggestion for this order(Campaign). Please carefully review and verify the changes before proceeding to ensure accuracy and prevent potential errors.`,
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
      checkedChildren={<CheckOutlined />}
      unCheckedChildren={<CloseOutlined />}
      onChange={handleChange}
    />
  )
}

export default AddRemoveSuggestionSwitch
