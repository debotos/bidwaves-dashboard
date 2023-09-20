import { Alert } from 'antd'

import Products from 'views/product/List'

function ProductSuggestion(props) {
  const { order } = props

  return (
    <>
      <Alert className="my-3" message="Product recommended from CSM for this campaign." type="info" showIcon />

      <Products suggestionUI={true} orderId={order.id} />
    </>
  )
}

export default ProductSuggestion
