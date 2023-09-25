import Axios from 'axios'
import styled from 'styled-components'
import { useSafeState } from 'ahooks'
import { SaveOutlined } from '@ant-design/icons'
import { Avatar, Button, Col, Form, Input, Row, Slider, Space, Tooltip } from 'antd'

import { message } from 'App'
import keys from 'config/keys'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { getCssVar, getReadableCurrency, isEmpty } from 'helpers/utility'
import AsyncSelect, { genericSearchOptionsFunc } from 'components/micro/fields/AsyncSelect'

const valClass = 'm-0 whitespace-nowrap font-bold text-[--primary-color] lg:text-2xl'

const OrderEdit = props => {
  const { order, refetch, fetching } = props
  const [form] = Form.useForm()
  const [budget, setBudget] = useSafeState(order.budget_info)
  const [industry, setIndustry] = useSafeState(order.industries_info?.[0])
  const [updating, setUpdating] = useSafeState(false)

  const onEditFinish = async values => {
    try {
      setUpdating(true)
      const { id } = order
      window.log(`Update postData -> `, values)
      const { data } = await Axios.patch(endpoints.order(id), values)
      window.log(`Update response -> `, data)
      refetch()
      message.success('Action successful.')
    } catch (error) {
      handleError(error, true)
    } finally {
      setUpdating(false)
    }
  }

  if (!order) return null

  return (
    <>
      <Row justify="center">
        <Col span={24} md={14} xl={10} xxl={9}>
          <Form disabled={fetching} form={form} layout="vertical" initialValues={{ ...order }} onFinish={onEditFinish}>
            <Form.Item className="mt-4 flex justify-center">
              <Space align="center">
                <Avatar size="large" src={order.advertisement_info?.image?.secure_url} />
                <h5 className="m-0 text-4xl font-bold">{order.advertisement_info?.name}</h5>
              </Space>
            </Form.Item>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, whitespace: true, message: 'Provide name!' }]}
            >
              <Input allowClear placeholder="Name" />
            </Form.Item>

            {/* <Form.Item label="Status" name="status">
              <Select
                placeholder="Order status"
                options={Object.values(keys.ORDER_STATUS).map(x => ({ value: x, label: x }))}
              />
            </Form.Item> */}

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
                        railStyle={{ backgroundColor: getCssVar('primary-color'), padding: 5, borderRadius: 5 }}
                        trackStyle={{
                          backgroundColor: getCssVar('primary-color'),
                          padding: 5,
                          borderRadius: 5
                        }}
                        handleStyle={{
                          backgroundColor: getCssVar('primary-color'),
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          zIndex: 9,
                          top: -2
                        }}
                      />
                    </Form.Item>
                    <Form.Item shouldUpdate={true} noStyle>
                      {() => {
                        const budget_amount = form.getFieldValue('budget_amount')
                        const industries = form.getFieldValue('industries')
                        if (!budget_amount || isEmpty(industry) || isEmpty(industries)) return null

                        const visitors_count = Math.round(budget_amount / Number(industry.cpc))
                        const leads_count = Math.round((visitors_count * Number(industry.rate_pct)) / 100)

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

            {/* <Row justify="space-around" align="middle" className="mt-4" gutter={[10, 0]} wrap={false}>
              <Col span={12}>
                <Form.Item className="mb-0" name="allow_qa_edit" label="Allow QA Edit" valuePropName="checked">
                  <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item className="mb-0" name="qa_approved" label="QA Approved" valuePropName="checked">
                  <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                </Form.Item>
              </Col>
            </Row>

            <Row justify="space-around" align="middle" className="mt-4" gutter={[10, 0]} wrap={false}>
              <Col span={12}>
                <Form.Item className="mb-0" name="active" label="Active" valuePropName="checked">
                  <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item className="mb-0" name="complete" label="Complete" valuePropName="checked">
                  <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                </Form.Item>
              </Col>
            </Row> */}

            <Form.Item className="mt-4">
              <Button block type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updating}>
                Save
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </>
  )
}

export default OrderEdit

const ValCol = styled(Col)`
  min-width: 103px;
`
