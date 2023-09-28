import Axios from 'axios'
import { useMount, useSafeState } from 'ahooks'
import { useSelector } from 'react-redux'
import { loadStripe } from '@stripe/stripe-js'
import { useStripe, useElements, Elements, PaymentElement, LinkAuthenticationElement } from '@stripe/react-stripe-js'

import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { getCssVar, getErrorAlert, getReadableCurrency, renderLoading } from 'helpers/utility'
import { Alert, Button, Row, Space } from 'antd'

// eslint-disable-next-line no-undef
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK)

const PaymentForm = ({ onComplete, amount, clientSecret }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useSelector(state => state.auth)
  const [errorMsg, setErrorMsg] = useSafeState('')
  const [loading, setLoading] = useSafeState(false)

  const handleSubmit = async event => {
    try {
      event.preventDefault()
      setLoading(true)
      setErrorMsg('')

      if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return
      }

      // Create a PaymentMethod using the details
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: {
            name: `${user.first_name} ${user.last_name} (ID: ${user.id})`
          }
        }
      })

      if (error) {
        // This point is only reached if there's an immediate error when
        // creating the PaymentMethod. Show the error to your customer (for example, payment details incomplete)
        setErrorMsg(error.message)
      } else {
        console.log({ paymentMethod })
      }

      // Send the PaymentMethod ID to your server for additional logic and attach the PaymentMethod

      // Confirm the PaymentIntent
      const { error: confirmError } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: 'https://example.com/order/123/complete'
        }
      })

      if (confirmError) {
        // This point is only reached if there's an immediate error when
        // confirming the payment. Show the error to your customer (for example, payment details incomplete)
        setErrorMsg(confirmError.message)
      } else {
        // The payment UI automatically closes with a success animation.
        // Your customer is redirected to your `return_url`.
        onComplete?.()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const free = amount <= 0

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <Space direction="vertical" size="middle" className="w-100">
        <LinkAuthenticationElement options={{ defaultValues: { email: user.email } }} />
        <PaymentElement
          options={{
            layout: { type: 'auto', defaultCollapsed: false, radios: false, spacedAccordionItems: true }
          }}
        />
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
            <b>Pay&nbsp;&nbsp;{getReadableCurrency(amount)}</b>
          </Button>
        </Row>
        {errorMsg && <Alert showIcon message={errorMsg} closable />}
      </Space>
    </form>
  )
}

const RecurringCheckoutForm = props => {
  const { order, total, list } = props
  const amount = Number(total)
  const [loading, setLoading] = useSafeState(true)
  const [clientSecret, setClientSecret] = useSafeState(true)

  const getData = async () => {
    try {
      setLoading(true)
      const { data: paymentIntentData } = await Axios.post(endpoints.orderBase + '/payment-intent', {
        amount: amount * 100,
        description: `${order.name} (ID: ${order.id})`,
        details: list
      })
      const { client_secret } = paymentIntentData
      setClientSecret(client_secret)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  useMount(() => {
    getData()
  })

  if (loading) return renderLoading({ className: 'my-5', tip: 'Loading Stripe...' })
  if (!clientSecret) return getErrorAlert({ onRetry: getData })

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
      <PaymentForm {...props} clientSecret={clientSecret} amount={amount} />
    </Elements>
  )
}

export default RecurringCheckoutForm
