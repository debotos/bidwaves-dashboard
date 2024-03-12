import Axios from 'axios'
import styled from 'styled-components'
import { useSafeState } from 'ahooks'
import { SendOutlined } from '@ant-design/icons'
import {
  Alert,
  Avatar,
  Button,
  Col,
  Collapse,
  Form,
  Input,
  Popconfirm,
  Row,
  Slider,
  Space,
  Tooltip,
  Card,
  InputNumber
} from 'antd'

import { message } from 'App'
import keys from 'config/keys'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { getCssVar, getReadableCurrency, isEmpty } from 'helpers/utility'
import AsyncSelect, { genericSearchOptionsFunc } from 'components/micro/fields/AsyncSelect'

const getCPanelClass = last => `bg-[--body-bg-color] mb-${last ? 0 : 3}`
const valClass = 'm-0 whitespace-nowrap font-bold text-[--primary-color] lg:text-2xl'

const OrderEdit = props => {
  const { order, refetch, fetching, closeModal } = props // Don't access too much from props it's REUSED. Make sure props are available.
  const [form] = Form.useForm()
  const [budget, setBudget] = useSafeState(order.budget_info)
  const [industry, setIndustry] = useSafeState(order.industries_info?.[0])
  const [updating, setUpdating] = useSafeState(false)

  const isPaid = order.last_payment_date || order.stripeSubscriptionId
  const isLimited = isPaid || order.status === keys.ORDER_STATUS.RUNNING

  const onEditFinish = async values => {
    try {
      setUpdating(true)
      const { id } = order

      const comment_note = values.comment_note
      delete values.comment_note
      const postData = {
        pending_updates: { comment_note, update: values, details: { budget, industry } }
      }
      window.log(`Update postData -> `, postData)
      const { data } = await Axios.patch(endpoints.order(id), postData)
      window.log(`Update response -> `, data)
      refetch()
      message.success('Action successful.')
      closeModal?.()
    } catch (error) {
      handleError(error, true)
    } finally {
      setUpdating(false)
    }
  }

  if (!order) return null

  const reqExist = !isEmpty(order.pending_updates)
  const cDisabled = reqExist || fetching

  return (
    <>
      {reqExist && (
        <Alert
          className="mb-3"
          message="You already have a pending update request. Please wait until BidWaves take the necessary actions."
          type="info"
          showIcon
        />
      )}

      <Row justify={`center`} className="my-3">
        <Space align="center">
          <Avatar size="large" src={order.advertisement_info?.image?.secure_url} />
          <h5 className="m-0 text-4xl font-bold">{order.advertisement_info?.name}</h5>
        </Space>
      </Row>

      <Form disabled={cDisabled} form={form} layout="vertical" initialValues={{ ...order }} onFinish={onEditFinish}>
        <Row gutter={[30, 20]}>
          <Col span={24} lg={14}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, whitespace: true, message: 'Provide name!' }]}
            >
              <Input allowClear placeholder="Name" />
            </Form.Item>

            <Form.Item label="Campaign Budget" name="budgetId" rules={[{ required: true, message: 'Required!' }]}>
              <AsyncSelect
                allowClear={false}
                showSearch={true}
                filterOption={true}
                onlyInitialSearch={true}
                optionFilterProp="tag_label"
                placeholder="Select Budget"
                handleGetOptions={val => {
                  return genericSearchOptionsFunc(
                    endpoints.budgetBase + `?${keys.EQUAL_TO_COL_PREFIX}advertisementId=${order.advertisementId}`,
                    val,
                    {
                      optionPropsOverrideCb: item => {
                        return {
                          label: (
                            <Space>
                              {item.advertisement?.image?.secure_url && (
                                <Tooltip title={item.advertisement?.name}>
                                  <Avatar size="small" src={item.advertisement?.image?.secure_url} />
                                </Tooltip>
                              )}
                              {item.tag?.label} |
                              <b>
                                {getReadableCurrency(item.min).replace('.00', '')}&nbsp;-&nbsp;
                                {getReadableCurrency(item.max, { showUnlimited: true }).replace('.00', '')}
                              </b>
                            </Space>
                          ),
                          tag_label: item.tag?.label || ''
                        }
                      }
                    }
                  )
                }}
                onChange={(value, option) => {
                  form.setFieldsValue({
                    industries: undefined,
                    budgetId: value,
                    budget_amount: option ? Number(option.min) : null
                  })
                  setBudget(option)
                }}
              />
            </Form.Item>

            <Form.Item shouldUpdate={true} noStyle>
              {() => {
                const budgetId = form.getFieldValue('budgetId')
                if (!budgetId) return null
                return (
                  <Form.Item
                    label="Campaign Industry"
                    name="industries"
                    rules={[{ required: true, message: 'Required!' }]}
                  >
                    <AsyncSelect
                      key={budgetId}
                      allowClear={false}
                      showSearch={true}
                      filterOption={true}
                      onlyInitialSearch={true}
                      optionFilterProp="label"
                      placeholder="Select Industry"
                      handleGetOptions={val => {
                        return genericSearchOptionsFunc(
                          endpoints.industryBase + `?${keys.EQUAL_TO_COL_PREFIX}budgetId=${budgetId}`,
                          val
                        )
                      }}
                      onChange={(value, option) => {
                        form.setFieldsValue({ industries: value })
                        setIndustry(option)
                      }}
                    />
                  </Form.Item>
                )
              }}
            </Form.Item>

            {isLimited && (
              <Card title="General Campaign Update" size="small">
                <Form.Item label="Your Budget Amount" name={['running_campaign_updates', 'budget_amount']}>
                  <InputNumber
                    placeholder={`${Intl.NumberFormat('en-US').format(order.budget_amount)} USD`}
                    min={1}
                    max={20000}
                    style={{ width: '100%' }}
                    addonBefore="$"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="URL Point Ad To"
                  name={['running_campaign_updates', 'url_point_ad_to']}
                  rules={[{ whitespace: true, message: 'Space not allowed!' }]}
                >
                  <Input allowClear placeholder="www.BidWaves.com" />
                </Form.Item>

                <Form.Item
                  label="Audience Targeting"
                  name={['running_campaign_updates', 'audience_targeting']}
                  rules={[{ whitespace: true, message: 'Space not allowed!' }]}
                >
                  <Input allowClear placeholder="Mothers, Writers, Local Business" />
                </Form.Item>

                <Form.Item
                  label="Geo Target"
                  name={['running_campaign_updates', 'geo_target']}
                  rules={[{ whitespace: true, message: 'Space not allowed!' }]}
                >
                  <Input allowClear placeholder="New York, 10001" />
                </Form.Item>

                <Form.Item
                  label="More Notes"
                  name={['running_campaign_updates', 'more_notes']}
                  rules={[{ whitespace: true, message: 'Space not allowed!' }]}
                >
                  <Input.TextArea allowClear rows={6} placeholder="More changes or additional updates can go here." />
                </Form.Item>
              </Card>
            )}

            {!isLimited && (
              <Form.Item shouldUpdate={true} noStyle>
                {() => {
                  if (!budget) return null
                  const enterpriseSelected = !isEmpty(budget) && isEmpty(budget?.max)
                  if (enterpriseSelected) {
                    return <h2 className="text-center text-[--primary-color]">Spending more than $10,000 a month.</h2>
                  }
                  return (
                    <>
                      <Space direction="vertical" align="center" className="w-100">
                        <p className="mb-0 text-[--primary-color]">Amount want to spend per month?</p>
                        <h1 className="m-0 text-center font-bold text-[--primary-color] lg:text-4xl">
                          {getReadableCurrency(form.getFieldValue('budget_amount')).replace('.00', '')}
                        </h1>
                      </Space>
                      <Form.Item name="budget_amount" rules={[{ required: true, message: 'Required!' }]}>
                        <Slider
                          min={Number(budget.min)}
                          max={Number(budget.max)}
                          className="app-custom-slider w-100"
                          tooltip={{ formatter: value => getReadableCurrency(value).replace('.00', '') }}
                          styles={{
                            rail: { backgroundColor: getCssVar('primary-color'), padding: 5, borderRadius: 5 },
                            track: {
                              backgroundColor: getCssVar('primary-color'),
                              padding: 5,
                              borderRadius: 5
                            },
                            handle: {
                              backgroundColor: getCssVar('primary-color'),
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              zIndex: 9,
                              top: -2
                            }
                          }}
                        />
                      </Form.Item>
                      <Form.Item shouldUpdate={true} noStyle>
                        {() => {
                          const budget_amount = form.getFieldValue('budget_amount')
                          const industries = form.getFieldValue('industries')
                          if (!budget_amount || isEmpty(industry) || isEmpty(industries)) return null

                          let visitors_count = 0
                          let leads_count = 0
                          if (budget_amount && !isEmpty(industry)) {
                            let amount =
                              Number(budget_amount) - (Number(budget?.labor_cost || 0) + Number(budget?.fixed_fee || 0))
                            const holdout_cost = (amount * Number(budget?.holdout_percentage)) / 100
                            amount -= holdout_cost
                            visitors_count = Math.round(amount / Number(industry.cpc))
                            leads_count = Math.round((visitors_count * Number(industry.rate_pct)) / 100)
                          }

                          return (
                            <>
                              <Row justify="center" className="my-6">
                                <Col span={24}>
                                  <Space direction="vertical" className="w-100">
                                    <Row align="middle" gutter={[10, 10]} wrap={false}>
                                      <ValCol className="flex justify-end">
                                        <h3 className={valClass}>
                                          {getReadableCurrency(budget_amount).replace('.00', '')}
                                        </h3>
                                      </ValCol>
                                      <Col>
                                        <p className="m-0">
                                          The amount use spending on {order.advertisement_info?.name}.
                                        </p>
                                      </Col>
                                    </Row>
                                    <Row align="middle" gutter={[10, 10]} wrap={false}>
                                      <ValCol className="flex justify-end">
                                        <h3 className={valClass}>{visitors_count.toLocaleString()}</h3>
                                      </ValCol>
                                      <Col>
                                        <p className="m-0">The visitors you should get to the site.</p>
                                      </Col>
                                    </Row>
                                    <Row align="middle" gutter={[10, 10]} wrap={false}>
                                      <ValCol className="flex justify-end">
                                        <h3 className={valClass}>{leads_count.toLocaleString()}</h3>
                                      </ValCol>
                                      <Col>
                                        <p className="m-0">Leads converted based on your industry chosen and budget.</p>
                                      </Col>
                                    </Row>
                                  </Space>
                                </Col>
                              </Row>
                              <p className="mb-4 text-center text-red-500 lg:mb-5">
                                Please note that the leads are not guaranteed. This is based of the industry average.
                              </p>
                            </>
                          )
                        }}
                      </Form.Item>
                    </>
                  )
                }}
              </Form.Item>
            )}

            {!isLimited && !isEmpty(order.qa) && (
              <Collapse>
                <Collapse.Panel
                  header={<>Brief</>}
                  key="qa"
                  style={{ borderRadius: 6 }}
                  className={getCPanelClass(false)}
                >
                  <Form.List name="qa">
                    {fields => (
                      <>
                        {fields.map(({ key, name, ...restField }, index) => {
                          const q = order.qa[index].q
                          return (
                            <Row
                              key={key}
                              align="middle"
                              className="mb-3 rounded-lg border-2 border-solid border-[--body-bg-color] px-2 py-2"
                              wrap={false}
                              gutter={[10, 0]}
                            >
                              <Col flex={1}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'q']}
                                  rules={[{ whitespace: true, message: 'Space not allowed!' }]}
                                  noStyle
                                >
                                  <Input.TextArea
                                    readOnly={true}
                                    disabled={true}
                                    hidden={true}
                                    style={{ height: 0, width: 0, opacity: 0 }}
                                    className="pointer-events-none"
                                    rows={1}
                                    allowClear
                                    maxLength={500}
                                    showCount
                                    placeholder="Question"
                                  />
                                </Form.Item>
                                <h4 className="font-semibold">{q}</h4>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'a']}
                                  rules={[{ whitespace: true, message: 'Space not allowed!' }]}
                                >
                                  <Input.TextArea
                                    className="mt-2"
                                    rows={2}
                                    allowClear
                                    maxLength={1000}
                                    showCount
                                    placeholder="Answer"
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          )
                        })}
                      </>
                    )}
                  </Form.List>
                </Collapse.Panel>
              </Collapse>
            )}
          </Col>

          <Col span={24} lg={10}>
            <Form.Item
              label="Comment Regarding This Update Request"
              name="comment_note"
              rules={[{ whitespace: true, message: 'Provide Comment!' }]}
            >
              <Input.TextArea disabled={cDisabled} placeholder="Comment regarding this update request." rows={10} />
            </Form.Item>
          </Col>
        </Row>

        <Row justify={`center`}>
          <Col>
            <Form.Item className="mt-4">
              <Popconfirm
                okText="Yes, Submit"
                title="Are you sure? Please review the updates carefully as you can't submit again until BidWaves resolve this request."
                onConfirm={() => form.submit()}
              >
                <Button
                  shape="round"
                  size="large"
                  type="primary"
                  htmlType="button"
                  icon={<SendOutlined />}
                  loading={updating}
                >
                  Submit Update Request
                </Button>
              </Popconfirm>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default OrderEdit

const ValCol = styled(Col)`
  min-width: 103px;
`
