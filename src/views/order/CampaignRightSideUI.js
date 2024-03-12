import Axios from 'axios'
import loadable from '@loadable/component'
import { FaPencilAlt } from 'react-icons/fa'
import { Fade } from 'react-awesome-reveal'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useSetState, useSafeState, useMount } from 'ahooks'
import { EditOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons'
import {
  Flex,
  Modal,
  Row,
  InputNumber,
  Card,
  Space,
  Button,
  Tag,
  Form,
  message,
  Input,
  Alert,
  Empty,
  Badge,
  Switch,
  Col,
  Image
} from 'antd'

import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { loadableOptions } from 'components/micro/Common'
import { generateBudgetOptionLabel } from 'pages/Calculator'
import { getCssVar, getReadableCurrency, isEmpty, renderLoading } from 'helpers/utility'

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

  const [adCopy, setAdCopy] = useSafeState(null)
  const [updating, setUpdating] = useSafeState(false)
  const [checking, setChecking] = useSafeState(true)
  const [suggestionCount, setSuggestionCount] = useSafeState(0)
  const [searchAdCopyModal, openSearchAdCopyModal] = useSafeState(false)
  const [displayAdCopyModal, openDisplayAdCopyModal] = useSafeState(false)

  const init = async (silent = false) => {
    try {
      !silent && setChecking(true)
      const {
        data: { count }
      } = await Axios.get(endpoints.order(orderId) + '/product-suggestion?count=yes')
      if (count) setSuggestionCount(count)

      const { data } = await Axios.get(endpoints.order(order.id) + '/adcopy')
      setAdCopy(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      !silent && setChecking(false)
    }
  }

  const handleAdCopyUpdate = async (values, notify = true, cb) => {
    try {
      setUpdating(true)
      if ('asset_list' in values) {
        values.asset_update_list = values.asset_list.map(x => ({ index: x.index, accepted: !!x.accepted }))
        delete values.asset_list
      }
      window.log(`Update postData -> `, values)
      const { data } = await Axios.patch(endpoints.order(order.id) + '/adcopy', { ...values })
      window.log(`Update response -> `, data)
      notify && message.success('Successful.')
      await init(true)
      cb && cb()
    } catch (error) {
      handleError(error, true)
    } finally {
      setUpdating(false)
    }
  }

  useMount(() => {
    init()
  })

  if (checking) return renderLoading({ tip: 'Checking...', className: 'my-5' })
  if (suggestionCount || isEmpty(adCopy)) return null

  const assetListExist = !isEmpty(adCopy.asset_list)
  const textListExist = !isEmpty(adCopy.text_list)
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

  const searchCopyApproved = adCopy.is_text_accepted === true
  const assetCopyApproved = adCopy.is_asset_accepted === true

  if (
    (!textListExist || searchCopyApproved) &&
    (!assetListExist || assetCopyApproved) &&
    !showSubscriptionConfirmUI &&
    !showSubscriptionPayUI
  )
    return null

  return (
    <>
      <div>
        <Space className="mb-3">
          <h2 className="m-0 text-2xl font-bold">{`Approve Campaign & Campaign Assets`}</h2>
        </Space>

        <Space direction="vertical" className="w-full">
          {textListExist && (
            <Fade>
              <Card>
                <h3 className="font-bold">{`Review Search Ad Copy`}</h3>
                <Flex justify="space-between" gap={20}>
                  <h4 className="m-0 font-semibold">{`Review Ad Copy`}</h4>

                  <div>
                    {searchCopyApproved ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Complete
                      </Tag>
                    ) : (
                      <Tag color="warning" icon={<WarningOutlined />}>
                        Incomplete
                      </Tag>
                    )}
                  </div>

                  <Button
                    type={searchCopyApproved ? 'default' : 'primary'}
                    shape="round"
                    size="small"
                    onClick={() => openSearchAdCopyModal(true)}
                  >
                    {searchCopyApproved ? 'Review' : 'Complete'}
                  </Button>
                </Flex>
              </Card>
            </Fade>
          )}

          {assetListExist && (
            <Fade>
              <Card>
                <h3 className="font-bold">{`Review Display Ad Copy`}</h3>
                <Flex justify="space-between" gap={20}>
                  <h4 className="m-0 font-semibold">{`Review Ad Copy`}</h4>

                  <div>
                    {assetCopyApproved ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Complete
                      </Tag>
                    ) : (
                      <Tag color="warning" icon={<WarningOutlined />}>
                        Incomplete
                      </Tag>
                    )}
                  </div>

                  <Button
                    type={assetCopyApproved ? 'default' : 'primary'}
                    shape="round"
                    size="small"
                    onClick={() => openDisplayAdCopyModal(true)}
                  >
                    {assetCopyApproved ? 'Review' : 'Complete'}
                  </Button>
                </Flex>
              </Card>
            </Fade>
          )}

          {showSubscriptionConfirmUI && (
            <Card>
              <h3 className="font-bold">Confirm Monthly Ad Budget</h3>
              <p>
                Below is the monthly budget you initially set and the estimated campaign results. Please confirm or
                adjust your monthly budget.
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
                By approving the budget, you authorize BidWaves LLC to charge the stored card on Stripe. By submitting
                you accept the Terms & Conditions.
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
        </Space>
      </div>

      <Modal
        destroyOnClose
        title={
          <Space>
            <span>{searchCopyApproved ? '' : 'Approve'} Search Ad Copy</span>
            {adCopy.is_text_accepted !== null ? (
              <>
                {searchCopyApproved ? (
                  <Tag color={getCssVar('success-color')}>
                    You Approved Number {adCopy.text_list.findIndex(x => !!x.accepted) + 1}
                  </Tag>
                ) : (
                  <Tag color={getCssVar('danger-color')}>You Rejected</Tag>
                )}
              </>
            ) : null}
          </Space>
        }
        open={searchAdCopyModal}
        footer={null}
        maskClosable={false}
        onCancel={() => openSearchAdCopyModal(false)}
        className="ant-modal-width-full"
      >
        <Form
          className=""
          disabled={updating || searchCopyApproved}
          layout="vertical"
          initialValues={{ ...(adCopy ?? {}) }}
        >
          {adCopy.csm_text_comment && (
            <Alert
              showIcon
              className="mb-2"
              type={adCopy.is_text_accepted ? 'success' : 'warning'}
              message={<b>BidWaves saying,</b>}
              description={adCopy.csm_text_comment}
              closable
              onClose={() => handleAdCopyUpdate({ csm_text_comment: null }, false)}
            />
          )}

          <PerfectScrollbar options={{ suppressScrollY: true }} className="pt-3">
            <Form.List name="text_list">
              {fields => (
                <>
                  {isEmpty(fields) ? (
                    <Row justify="center">
                      <Empty />
                    </Row>
                  ) : (
                    <Flex gap={20} className="">
                      {fields.map(({ key, name, ...restField }, index) => {
                        return (
                          <Card
                            key={key}
                            size="small"
                            title={
                              <>
                                <Badge className="mr-2" color={getCssVar('primary-color')} count={index + 1} />
                                Search Ad Copy Text
                              </>
                            }
                            styles={{ body: { minWidth: 270 } }}
                          >
                            <Row justify={`center`}>
                              <Form.Item shouldUpdate noStyle>
                                {({ getFieldValue, setFieldValue }) => {
                                  return (
                                    <Form.Item
                                      {...restField}
                                      shouldUpdate
                                      name={[name, 'accepted']}
                                      valuePropName="checked"
                                    >
                                      <Switch
                                        checkedChildren={'Approved'}
                                        unCheckedChildren={'Not Approved'}
                                        onChange={checked => {
                                          if (!checked) return
                                          /* Logic to set only one approved at a time */
                                          const text_list_value = getFieldValue('text_list')
                                          setFieldValue(
                                            `text_list`,
                                            text_list_value.map((row, i) => {
                                              if (i === name) return row
                                              return { ...row, accepted: false }
                                            })
                                          )
                                        }}
                                      />
                                    </Form.Item>
                                  )
                                }}
                              </Form.Item>
                            </Row>
                            <Form.Item
                              {...restField}
                              className="mb-3"
                              name={[name, 'text']}
                              rules={[{ required: true, whitespace: true, message: 'Required!' }]}
                            >
                              <Input.TextArea rows={12} readOnly placeholder={`Write Ad Copy Text ${index + 1}`} />
                            </Form.Item>
                          </Card>
                        )
                      })}
                    </Flex>
                  )}
                </>
              )}
            </Form.List>
          </PerfectScrollbar>

          {!searchCopyApproved && (
            <Form.Item
              name="client_text_comment"
              className="mt-3"
              rules={[{ whitespace: true, message: 'Provide real comment!' }]}
            >
              <Input.TextArea allowClear rows={2} disabled={searchCopyApproved} placeholder="Write your comment" />
            </Form.Item>
          )}

          {!searchCopyApproved && (
            <Row justify={`center`} className="mt-4">
              <Space size={`large`}>
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldsValue }) => {
                    return (
                      <Button
                        danger
                        ghost
                        type="primary"
                        htmlType="button"
                        loading={updating}
                        onClick={() => {
                          const values = getFieldsValue()

                          if (!values.client_text_comment) return Modal.error(hintNotApproveModalConfig)

                          handleAdCopyUpdate(
                            { client_text_comment: values.client_text_comment, is_text_accepted: false },
                            false,
                            () => openSearchAdCopyModal(false)
                          )
                        }}
                      >
                        Not Approved
                      </Button>
                    )
                  }}
                </Form.Item>
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldsValue }) => {
                    return (
                      <Button
                        type="primary"
                        htmlType="button"
                        loading={updating}
                        onClick={() => {
                          const values = getFieldsValue()
                          const accepted = values.text_list?.findIndex(x => !!x.accepted)
                          if (accepted === null) return
                          if (accepted === -1) return Modal.error(hintApproveModalConfig)

                          handleAdCopyUpdate({ ...values, csm_reviewed_text_accepted: false }, true, () =>
                            openSearchAdCopyModal(false)
                          )
                        }}
                      >
                        Approve
                      </Button>
                    )
                  }}
                </Form.Item>
              </Space>
            </Row>
          )}
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        title={
          <Space>
            <span>{assetCopyApproved ? '' : 'Approve'} Display Ad Copy</span>
            {adCopy.is_asset_accepted !== null ? (
              <>
                {assetCopyApproved ? (
                  <Tag color={getCssVar('success-color')}>
                    You Approved Number {adCopy.text_list.findIndex(x => !!x.accepted) + 1}
                  </Tag>
                ) : (
                  <Tag color={getCssVar('danger-color')}>You Rejected</Tag>
                )}
              </>
            ) : null}
          </Space>
        }
        open={displayAdCopyModal}
        footer={null}
        maskClosable={false}
        onCancel={() => openDisplayAdCopyModal(false)}
        className="ant-modal-width-full"
      >
        <Form
          className=""
          disabled={updating || assetCopyApproved}
          layout="vertical"
          initialValues={{ ...(adCopy ?? {}) }}
        >
          {adCopy.csm_asset_comment && (
            <Alert
              showIcon
              className="mb-2"
              type={adCopy.is_asset_accepted ? 'success' : 'warning'}
              message={<b>BidWaves saying,</b>}
              description={adCopy.csm_asset_comment}
              closable
              onClose={() => handleAdCopyUpdate({ csm_asset_comment: null }, false)}
            />
          )}

          <PerfectScrollbar options={{ suppressScrollY: true }} className="pt-3">
            <Form.List name="asset_list">
              {fields => (
                <>
                  {isEmpty(fields) ? (
                    <Row justify="center">
                      <Empty />
                    </Row>
                  ) : (
                    <Flex gap={20} className="">
                      {fields.map(({ key, name, ...restField }, index) => {
                        return (
                          <Card
                            key={key}
                            size="small"
                            title={
                              <>
                                <Badge className="mr-2" color={getCssVar('primary-color')} count={index + 1} />
                                Display Ad Copy Image
                              </>
                            }
                            styles={{ body: { minWidth: 270 } }}
                          >
                            <Form.Item
                              {...restField}
                              noStyle
                              shouldUpdate
                              hidden
                              initialValue={index}
                              name={[name, 'index']}
                            >
                              <InputNumber
                                type="number"
                                min={0}
                                defaultValue={index}
                                max={fields.length ? fields.length - 1 : 0}
                              />
                            </Form.Item>
                            <Row justify={`center`}>
                              <Form.Item shouldUpdate noStyle>
                                {({ getFieldValue, setFieldValue }) => {
                                  return (
                                    <Form.Item
                                      {...restField}
                                      shouldUpdate
                                      initialValue={!!adCopy.asset_list?.[index]?.accepted}
                                      name={[name, 'accepted']}
                                      valuePropName="checked"
                                    >
                                      <Switch
                                        checkedChildren={'Approved'}
                                        unCheckedChildren={'Not Approved'}
                                        onChange={checked => {
                                          if (!checked) return
                                          /* Logic to set only one approved at a time */
                                          const asset_list_value = getFieldValue('asset_list')
                                          setFieldValue(
                                            `asset_list`,
                                            asset_list_value.map((row, i) => {
                                              if (i === name) return row
                                              return { ...row, accepted: false }
                                            })
                                          )
                                        }}
                                      />
                                    </Form.Item>
                                  )
                                }}
                              </Form.Item>
                            </Row>

                            <Row justify={`center`}>
                              <Form.Item shouldUpdate noStyle>
                                {({ getFieldValue }) => {
                                  const value_list = getFieldValue('asset_list') || []
                                  const current_value = value_list[index] ?? ''

                                  return (
                                    <Image.PreviewGroup items={value_list.map(x => x.secure_url)}>
                                      <Image
                                        width={200}
                                        title={current_value?.original_filename}
                                        src={current_value?.secure_url}
                                      />
                                    </Image.PreviewGroup>
                                  )
                                }}
                              </Form.Item>
                            </Row>
                          </Card>
                        )
                      })}
                    </Flex>
                  )}
                </>
              )}
            </Form.List>
          </PerfectScrollbar>

          {!assetCopyApproved && (
            <Form.Item
              name="client_asset_comment"
              className="mt-3"
              rules={[{ whitespace: true, message: 'Provide real comment!' }]}
            >
              <Input.TextArea allowClear rows={2} disabled={assetCopyApproved} placeholder="Write your comment" />
            </Form.Item>
          )}

          {!assetCopyApproved && (
            <Row justify={`center`} className="mt-4">
              <Space size={`large`}>
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldsValue }) => {
                    return (
                      <Button
                        danger
                        ghost
                        type="primary"
                        htmlType="button"
                        loading={updating}
                        onClick={() => {
                          const values = getFieldsValue()

                          if (!values.client_asset_comment) return Modal.error(hintNotApproveModalConfig)

                          handleAdCopyUpdate(
                            { client_asset_comment: values.client_asset_comment, is_asset_accepted: false },
                            false,
                            () => openDisplayAdCopyModal(false)
                          )
                        }}
                      >
                        Not Approved
                      </Button>
                    )
                  }}
                </Form.Item>
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldsValue }) => {
                    return (
                      <Button
                        type="primary"
                        htmlType="button"
                        loading={updating}
                        onClick={() => {
                          const values = getFieldsValue()
                          const accepted = values.asset_list?.findIndex(x => !!x.accepted)
                          if (accepted === null) return
                          if (accepted === -1) return Modal.error(hintApproveModalConfig)

                          handleAdCopyUpdate({ ...values, csm_reviewed_asset_accepted: false }, true, () =>
                            openDisplayAdCopyModal(false)
                          )
                        }}
                      >
                        Approve
                      </Button>
                    )
                  }}
                </Form.Item>
              </Space>
            </Row>
          )}
        </Form>
      </Modal>
    </>
  )
}

export default CampaignRightSideUI

const hintNotApproveModalConfig = {
  title: 'Missing Comment',
  content: `Put a comment that help us to identify the reason behind this 'Not Approved' action.`
}
const hintApproveModalConfig = {
  title: 'Please Approve One Ad Copy',
  content: (
    <Row justify={`center`} className="my-3" gutter={12}>
      <Col>
        <Switch className="pointer-events-none" checkedChildren={'Approved'} unCheckedChildren={'Not Approved'} />
      </Col>
      <Col>To</Col>
      <Col>
        <Switch
          className="pointer-events-none"
          checkedChildren={'Approved'}
          unCheckedChildren={'Not Approved'}
          defaultChecked
        />
      </Col>
    </Row>
  )
}
