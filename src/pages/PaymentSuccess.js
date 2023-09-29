import { Button, Result } from 'antd'
import { useMount, useSafeState } from 'ahooks'
import { useNavigate } from 'react-router-dom'

import keys from 'config/keys'
import { links } from 'config/vars'
import { Page } from 'components/micro/Common'

export default function PaymentSuccess() {
  const navigate = useNavigate()

  const [ok, setOk] = useSafeState(false)

  const goToOrders = () => {
    navigate(links.orders.to, { replace: true })
  }

  useMount(() => {
    if (localStorage.getItem(keys.SHOW_PAYMENT_SUCCESS_PAGE)) {
      setOk(true)
      localStorage.removeItem(keys.SHOW_PAYMENT_SUCCESS_PAGE)
    } else {
      goToOrders()
    }
  })

  if (!ok) return null

  return (
    <Page>
      <div className="flex h-screen items-center justify-center">
        <div className={`mb-5 w-full max-w-2xl p-4`}>
          <Result
            status="success"
            title="Payment Successful"
            subTitle="Payment successful and you can continue."
            extra={[
              <Button type="primary" key="orders" onClick={() => goToOrders()}>
                Go Back To Your Campaigns
              </Button>
            ]}
          />
        </div>
      </div>
    </Page>
  )
}
