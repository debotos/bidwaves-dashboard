import { useSelector } from 'react-redux'
import { loadStripe } from '@stripe/stripe-js'
import { useMount, useSafeState } from 'ahooks'
import { Alert, Button, Row, Space } from 'antd'
import { useStripe, useElements, Elements, PaymentElement, LinkAuthenticationElement } from '@stripe/react-stripe-js'

import { links } from 'config/vars'
import handleError from 'helpers/handleError'
import { getCssVar, getErrorAlert, getReadableCurrency, renderLoading, sleep } from 'helpers/utility'

// eslint-disable-next-line no-undef
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK)

const PaymentForm = ({ order, onComplete, total, amount }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [fetching, setFetching] = useSafeState(true)
  const { user } = useSelector(state => state.auth)
  const [errorMsg, setErrorMsg] = useSafeState('')
  const [loading, setLoading] = useSafeState(false)

  const getData = async () => {
    try {
      setFetching(true)
      await sleep(2500)
    } catch (error) {
      handleError(error, true)
    } finally {
      setFetching(false)
    }
  }

  useMount(() => {
    getData()
  })

  const handleSubmit = async event => {
    try {
      event.preventDefault()
      setLoading(true)
      setErrorMsg('')

      if (!stripe || !elements) return

      // Confirm the Payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + links.paymentSuccess.to + `?orderId=${encodeURIComponent(order.id)}`
        }
      })

      if (error) {
        window.log(error)
        setErrorMsg(error.message)
      } else {
        onComplete?.() // Will never reach here because of return_url
      }
    } catch (error) {
      const { finalMsg } = handleError(error)
      finalMsg && setErrorMsg(finalMsg)
    } finally {
      setLoading(false)
    }
  }

  const free = amount <= 0

  return (
    <>
      {fetching && renderLoading({ className: 'mt-4 mb-2', tip: 'Loading Stripe...' })}
      <form onSubmit={handleSubmit} className="mt-3">
        <Space direction="vertical" size="middle" className="w-100">
          <LinkAuthenticationElement options={{ defaultValues: { email: user.email } }} />
          <PaymentElement
            options={{
              layout: { type: 'auto', defaultCollapsed: false, radios: false, spacedAccordionItems: true }
            }}
          />
          {errorMsg && <Alert showIcon closable message={errorMsg} type="warning" />}
          {!fetching && (
            <Row justify="center" className="mt-2">
              <Button
                block
                type="primary"
                htmlType="submit"
                size="large"
                // shape="round"
                disabled={!stripe || !elements || free}
                loading={loading}
              >
                <b>Pay&nbsp;&nbsp;{getReadableCurrency(total)}</b>
              </Button>
            </Row>
          )}
        </Space>
      </form>
    </>
  )
}

const RecurringCheckoutForm = props => {
  const { order, total } = props
  const amount = Number(total) * 100
  const [clientSecret] = useSafeState(order.pending_payment_info?.clientSecret)

  if (!clientSecret) return getErrorAlert()

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            fontSizeBase: getCssVar('base-font-size'),
            fontWeightNormal: 500,
            borderRadius: getCssVar('base-border-radius'),
            fontFamily: getCssVar('main-font'),
            colorPrimary: getCssVar('primary-color')
          }
        }
      }}
    >
      <PaymentForm {...props} amount={amount} />
    </Elements>
  )
}

export default RecurringCheckoutForm
