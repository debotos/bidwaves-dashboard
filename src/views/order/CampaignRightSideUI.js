import Axios from 'axios'
import loadable from '@loadable/component'
import { FaPencilAlt } from 'react-icons/fa'
import { Fade } from 'react-awesome-reveal'
import { useSetState, useSafeState, useMount } from 'ahooks'
import { EditOutlined } from '@ant-design/icons'
import { Flex, Modal, Row, InputNumber, Card, Space, Button } from 'antd'

import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { loadableOptions } from 'components/micro/Common'
import { generateBudgetOptionLabel } from 'pages/Calculator'
import { getReadableCurrency, isEmpty, renderLoading } from 'helpers/utility'

const SubscriptionPaymentUI = loadable(() => import('./manage/SubscriptionPaymentUI'), loadableOptions)

function CampaignRightSideUI(props) {
  const { order, products, refetch } = props
  const orderId = order.id

  const [approvingBudget, setApprovingBudget] = useSafeState(false)
  const [state, setState] = useSetState({
    budget_amount: Number(order.budget_amount),
    budget: order.budget_info,
    industry: order.industries_info?.[0]
  })

  const [checking, setChecking] = useSafeState(true)
  const [suggestionCount, setSuggestionCount] = useSafeState(0)

  const init = async () => {
    try {
      setChecking(true)
      const {
        data: { count }
      } = await Axios.get(endpoints.order(orderId) + '/product-suggestion?count=yes')
      if (count) setSuggestionCount(count)
    } catch (error) {
      handleError(error, true)
    } finally {
      setChecking(false)
    }
  }

  useMount(() => {
    init()
  })

  if (checking) return renderLoading({ tip: 'Checking...', className: 'my-5' })
  if (suggestionCount) return null

  const showSubscriptionConfirmUI = !order.stripeSubscriptionId
  const showSubscriptionPayUI =
    !order.subscriptionStarted && order.stripeSubscriptionId && order.stripeSubscriptionClientSecret

  const handleBudgetApprove = async () => {
    try {
      setApprovingBudget(true)
      const ep = endpoints.order(orderId)
      const budget_amount = state.budget_amount
      await Axios.patch(endpoints.order(orderId), { budget_amount })

      const postData = {
        amount: Number(budget_amount) * 100,
        details: products.map(item => {
          return {
            type: item.product_info?.type,
            name: item.product_info?.name,
            price: item.product_info?.price
          }
        })
      }
      const { data: subscription } = await Axios.post(ep + '/payment/subscription', postData)
      console.log(subscription)
      refetch()
    } catch (error) {
      handleError(error, true)
    } finally {
      setApprovingBudget(false)
    }
  }

  const handleBudgetAmountEdit = () => {
    Modal.info({
      centered: true,
      closable: true,
      maskClosable: true,
      title: 'Edit Budget Amount',
      icon: <EditOutlined />,
      content: (
        <>
          <Row justify={`center`} className="mb-3 mt-2">
            {generateBudgetOptionLabel(state.budget).label}
          </Row>
          <InputNumber
            size="large"
            placeholder="Amount"
            variant="filled"
            min={Number(state.budget.min)}
            max={Number(state.budget.max)}
            defaultValue={state.budget_amount ?? 0}
            onChange={val => {
              let amount = val
              if (!amount) amount = Number(state.budget.min)
              setState({ budget_amount: amount })
            }}
            style={{ width: '100%', fontWeight: 600 }}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </>
      ),
      footer: (_, { OkBtn }) => (
        <>
          <OkBtn />
        </>
      )
    })
  }

  let visitors_count = 0
  let leads_count = 0
  if (state.budget_amount && !isEmpty(state.industry)) {
    let amount =
      Number(state.budget_amount) - (Number(state.budget?.labor_cost || 0) + Number(state.budget?.fixed_fee || 0))
    const holdout_cost = (amount * Number(state.budget?.holdout_percentage)) / 100
    amount -= holdout_cost
    visitors_count = Math.round(amount / Number(state.industry.cpc))
    leads_count = Math.round((visitors_count * Number(state.industry.rate_pct)) / 100)
  }

  return (
    <>
      <div>
        <Space className="mb-3">
          <h2 className="m-0 text-2xl font-bold">{`Approve Campaign & Campaign Assets`}</h2>
        </Space>
        {showSubscriptionConfirmUI && (
          <Card>
            <h3>Confirm Monthly Ad Budget</h3>
            <p>
              Below is the monthly budget you initially set and the estimated campaign results. Please confirm or adjust
              your monthly budget.
            </p>

            <Flex gap={14} wrap="wrap" align="center">
              <h4 className="m-0 text-center font-bold">
                Monthly Budget: {getReadableCurrency(state.budget_amount).replace('.00', '')}&nbsp;&nbsp;
                <FaPencilAlt className="cursor-pointer" size={14} onClick={handleBudgetAmountEdit} />
              </h4>

              <h4 className="m-0">Estimated Clicks: {visitors_count.toLocaleString()}</h4>

              <h4 className="m-0">Estimated Sales: {leads_count.toLocaleString()}</h4>
            </Flex>

            <Flex gap={14} wrap="wrap" align="center" justify="end" className="mt-3">
              <Button size="small" type="primary" onClick={handleBudgetApprove} loading={approvingBudget}>
                Approve
              </Button>
              <Button size="small" onClick={handleBudgetAmountEdit} disabled={approvingBudget}>
                Adjust
              </Button>
            </Flex>

            <p className="mb-0 mt-3 font-semibold">
              By approving the budget, you authorize BidWaves LLC to charge the stored card on Stripe. By submitting you
              accept the Terms & Conditions.
            </p>
          </Card>
        )}

        {showSubscriptionPayUI && (
          <>
            <Fade>
              <Card>
                <SubscriptionPaymentUI {...props} subscriptionAmount={state.budget_amount} />
              </Card>
            </Fade>
          </>
        )}
      </div>
    </>
  )
}

export default CampaignRightSideUI
