import Axios from 'axios'
import { Button, Col, Result, Row, message } from 'antd'
import { useMount, useSafeState } from 'ahooks'
import { useLocation, useNavigate } from 'react-router-dom'

import { links } from 'config/vars'
import endpoints from 'config/endpoints'
import { Page } from 'components/micro/Common'
import handleError from 'helpers/handleError'
import { getErrorAlert, isEmpty, renderLoading } from 'helpers/utility'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const orderId = searchParams.get('orderId')
  const paymentIntent = searchParams.get('payment_intent')
  const clientSecret = searchParams.get('payment_intent_client_secret')

  const [response, setResponse] = useSafeState(null)
  const [processing, setProcessing] = useSafeState(true)

  const goToOrders = (qs = '', state) => {
    navigate(links.orders.to + qs, { replace: true, state })
  }

  const checkPaymentDone = async () => {
    try {
      setProcessing(true)
      const ep = endpoints.order(decodeURIComponent(orderId))
      const { data } = await Axios.post(ep + '/payment-success', { paymentIntent, clientSecret })
      window.log(`Payment success res:`, data)
      setResponse(data)
      if (data.success) {
        setTimeout(() => {
          goToOrders(`?open=${encodeURIComponent(orderId)}`)
        }, 2000)
      }
    } catch (error) {
      handleError(error, true)
    } finally {
      setProcessing(false)
    }
  }

  useMount(() => {
    if (paymentIntent && clientSecret && orderId) {
      checkPaymentDone()
    } else {
      message.warning(`You're trying to access a restricted page with invalid data.`)
      goToOrders()
    }
  })

  if (processing) {
    return renderLoading({
      size: 'large',
      tip: 'Please wait...',
      className: 'flex h-screen items-center justify-center'
    })
  }

  if (isEmpty(response)) {
    return (
      <Row className="flex h-screen items-center justify-center p-5">
        <Col span={20}>{getErrorAlert({ fullScreen: true, onRetry: checkPaymentDone })}</Col>
      </Row>
    )
  }

  const getUI = () => {
    if (response.success) {
      return (
        <Result
          status="success"
          title="Payment Successful"
          subTitle={response.message}
          extra={[
            <Button type="primary" key="orders" onClick={() => goToOrders()}>
              Go Back To Your Campaigns
            </Button>
          ]}
        />
      )
    } else if (response.status === 'processing') {
      return (
        <Result
          status="warning"
          title="Don't close. Please wait..."
          subTitle={response.message}
          extra={[
            <Button type="primary" key="orders" onClick={() => checkPaymentDone()}>
              Check Status Again
            </Button>
          ]}
        />
      )
    } else {
      return (
        <Result
          status="warning"
          title="Try Again Or Contact BidWaves"
          subTitle={response.message}
          extra={[
            <Button type="primary" key="orders" onClick={() => goToOrders()}>
              Go Back
            </Button>
          ]}
        />
      )
    }
  }

  return (
    <Page>
      <div className="flex min-h-screen justify-center">
        <div className={`mt-16 w-full max-w-2xl p-4`}>{getUI()}</div>
      </div>
    </Page>
  )
}
