import Axios from 'axios'
// import { useRef } from 'react'
import { useSafeState } from 'ahooks'
import { useSelector } from 'react-redux'
import { loadStripe } from '@stripe/stripe-js'
import { FaCheckCircle } from 'react-icons/fa'
import { CloseCircleOutlined } from '@ant-design/icons'
import { Button, Row, Space, Input, message, Col, Alert, Tooltip } from 'antd'
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js'

import { modal } from 'App'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { getReadableCurrency, isEmpty } from 'helpers/utility'

// eslint-disable-next-line no-undef
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK)

function applyDiscount(price, currentAmount, discount, isPercentage) {
  if (price < 0 || discount < 0) return 0
  if (discount >= 100 && isPercentage) return 0

  let discountedPrice
  let nextAmount
  let deductAmount = discount

  if (isPercentage) {
    // Discount is given as a percentage
    deductAmount = Number(((price * discount) / 100).toFixed(2))
    discountedPrice = price - deductAmount
    nextAmount = currentAmount - deductAmount
  } else {
    // Discount is given as a fixed amount
    discountedPrice = price - discount
    nextAmount = currentAmount - discount
  }

  if (discountedPrice <= 0) discountedPrice = 0
  if (nextAmount <= 0) nextAmount = 0

  return [deductAmount, Number(nextAmount.toFixed(2)), Number(discountedPrice.toFixed(2))]
}

const PaymentForm = ({ product, onComplete, className = 'mt-4', withCoupon = true }) => {
  const productPrice = Number(product.price)
  const stripe = useStripe()
  const elements = useElements()
  // const couponInputRef = useRef(null)
  const { user } = useSelector(state => state.auth)
  const [loading, setLoading] = useSafeState(false)
  const [code, setCode] = useSafeState('')
  const [checking, setChecking] = useSafeState(false)
  const [amount, setAmount] = useSafeState(productPrice)
  const [coupons, setCoupons] = useSafeState([])

  const codes = coupons.map(x => x.code)

  const handleSubmit = async event => {
    try {
      setLoading(true)
      event.preventDefault()

      if (elements == null) return

      // Step 1: Create a PaymentIntent
      const { data: config } = await Axios.post(endpoints.orderBase + '/payment-intent', {
        amount: Number(amount) * 100,
        currency: 'usd',
        description: product.name,
        coupons: coupons.map(x => ({ code: x.code, amount: x.__deducted ?? 0 }))
      })

      // Step 2: Confirm the PaymentIntent on the client
      const card = elements.getElement(CardElement)
      const { error, paymentIntent } = await stripe.confirmCardPayment(config.client_secret, {
        payment_method: {
          card,
          billing_details: { name: user.first_name, email: user.email, address: { line1: user.address } }
        },
        receipt_email: user.email
      })

      if (error) {
        modal.error({ title: 'Error', content: error.message ?? 'Something went wrong.' })
        return
      }

      onComplete?.(paymentIntent)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const checkCoupon = async e => {
    try {
      e?.preventDefault?.()
      e?.stopPropagation?.()

      if (!code) return message.error('Provide coupon code.')
      if (code.length < 2) return message.warning('Coupon code is invalid.')
      if (codes.includes(code)) return message.info('Coupon already applied.')

      setChecking(true)
      const { data } = await Axios.get(endpoints.couponBase + `/check?code=${encodeURIComponent(code)}`)
      window.log(`Coupon response -> `, data)
      if (isEmpty(data)) return message.warning('Coupon is invalid or expired.')
      const { product_ids, is_percentage, discount } = data
      if (!isEmpty(product_ids) && !product_ids.includes(product.id)) {
        return message.info('Coupon is not valid for this product.')
      }
      let [deductAmount, nextAmount] = applyDiscount(productPrice, amount, discount, is_percentage)
      setAmount(nextAmount)
      setCoupons(prevValues => [...prevValues, { ...data, __deducted: deductAmount }])
      message.success(`Successful! You got ${getReadableCurrency(deductAmount, false)} discount.`)
      setCode('')
    } catch (error) {
      handleError(error, true)
    } finally {
      setChecking(false)
      // couponInputRef.current?.focus?.()
    }
  }

  const removeCoupon = couponData => {
    if (isEmpty(couponData)) return
    const leftCoupons = coupons.filter(x => x.code !== couponData.code)
    let updatedAmount = productPrice
    leftCoupons.forEach(x => (updatedAmount -= x.__deducted))
    setAmount(Number(updatedAmount.toFixed(2)))
    setCoupons(leftCoupons)
  }

  const cardElementOptions = {
    hidePostalCode: true,
    style: {
      base: { fontSize: '16px', color: '#32325d', '::placeholder': { color: '#aab7c4' } },
      invalid: { color: '#fa755a', iconColor: '#fa755a' }
    }
  }

  const free = amount <= 0

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="rounded-lg border-2 border-solid border-[--body-bg-color] px-2 py-3">
        <CardElement options={cardElementOptions} />
      </div>

      {withCoupon ? (
        <>
          <Space.Compact style={{ width: '100%' }} className="mt-3">
            <Input
              allowClear
              // ref={couponInputRef}
              placeholder="Coupon Code"
              onPressEnter={checkCoupon}
              disabled={checking || free}
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            <Button type="primary" onClick={checkCoupon} disabled={!code || checking || free}>
              Apply Code
            </Button>
          </Space.Compact>

          {isEmpty(codes) ? null : (
            <Space className="w-100 mt-3" size="small" direction="vertical">
              {free ? (
                <Alert
                  message={`The current payment amount is zero or less than zero, which is not acceptable. To proceed with the payment, you need to remove some of the coupons you have applied.`}
                  type="error"
                  showIcon
                />
              ) : null}
              {coupons.map((x, i) => {
                return (
                  <Row
                    key={i}
                    align="middle"
                    justify="space-between"
                    wrap={false}
                    className="rounded-lg border border-solid border-[--body-bg-color] px-1 py-1"
                  >
                    <Col className="mx-2 flex items-center">
                      <FaCheckCircle size={18} color="green" />
                    </Col>
                    <Col span={8} className="mx-2 flex items-center">
                      {x.code}
                    </Col>
                    <Col span={8} className="mx-2 flex items-center">
                      - {getReadableCurrency(x.__deducted, false)}
                    </Col>
                    <Col className="mx-2 flex items-center">
                      <Tooltip title="Remove">
                        <CloseCircleOutlined
                          className="cursor-pointer"
                          style={{ fontSize: 18, color: 'tomato' }}
                          onClick={() => removeCoupon(x)}
                        />
                      </Tooltip>
                    </Col>
                  </Row>
                )
              })}
            </Space>
          )}
        </>
      ) : null}

      <Row justify="center" className="mt-4">
        <Button type="primary" htmlType="submit" disabled={!stripe || !elements || checking || free} loading={loading}>
          Pay {getReadableCurrency(amount)}
        </Button>
      </Row>
    </form>
  )
}

const CheckoutForm = props => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}

export default CheckoutForm
