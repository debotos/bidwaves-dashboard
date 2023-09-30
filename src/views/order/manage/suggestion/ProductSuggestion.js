import { Alert } from 'antd'

import Products from './ProductsList'

function ProductSuggestion(props) {
  const { order } = props

  return (
    <>
      <Alert className="mb-3" message="Product recommended from CSM for this campaign." type="info" showIcon />

      <Products suggestionUI={true} orderId={order.id} {...props} />
    </>
  )
}

export default ProductSuggestion
