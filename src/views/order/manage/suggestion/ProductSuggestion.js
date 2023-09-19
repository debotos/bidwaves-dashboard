import { Alert } from 'antd'

import Products from 'views/product/List'

function ProductSuggestion(props) {
  const { order } = props

  return (
    <>
      <Alert
        className="my-3"
        message="If no suggested products are added, then all available products will be displayed to this order(Campaign)."
        type="info"
        showIcon
        closable
      />

      <Products suggestionUI={true} orderId={order.id} />
    </>
  )
}

export default ProductSuggestion
