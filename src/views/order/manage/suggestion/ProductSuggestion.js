import Products from './ProductsList'

function ProductSuggestion(props) {
  const { order } = props

  return (
    <>
      <Products suggestionUI={true} orderId={order.id} {...props} />
    </>
  )
}

export default ProductSuggestion
