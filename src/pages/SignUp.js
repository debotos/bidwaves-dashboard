import Axios from 'axios'
import { useDispatch } from 'react-redux'
import React, { useRef, useEffect } from 'react'
import { useSafeState, useSetState } from 'ahooks'
import { Link, useLocation } from 'react-router-dom'
import { Row, Button, Form, Input, Col, Steps, Space, message, Tooltip } from 'antd'
import {
  LockOutlined,
  SendOutlined,
  MailOutlined,
  UserOutlined,
  LinkedinOutlined,
  GlobalOutlined
} from '@ant-design/icons'

import keys from 'config/keys'
import { links } from 'config/vars'
import endpoints from 'config/endpoints'
import { APP_ID, reloadChannel } from 'App'
import handleError from 'helpers/handleError'
import { Page, Logo } from 'components/micro/Common'
import { setCurrentUser } from 'redux/slices/authSlice'
import { setAxiosAuthHeaderToken } from 'helpers/axiosHelper'
import { basePasswordRule, isEmpty, validateUrl } from 'helpers/utility'
import AsyncSelect, { genericSearchOptionsFunc } from 'components/micro/fields/AsyncSelect'

export const companyFields = [
  <Form.Item
    key="name"
    name={['company', 'name']}
    rules={[{ whitespace: true, required: true, message: 'Provide name!' }]}
  >
    <Input allowClear placeholder="Company Name" />
  </Form.Item>,
  <Form.Item key="url" name={['company', 'url']} rules={[{ required: false, validator: validateUrl }]}>
    <Input allowClear placeholder="Website URL" />
  </Form.Item>,
  <Tooltip
    key="phone"
    trigger={['focus']}
    title={`Please prefix the phone number with valid country code (eg. +88)`}
    placement="topLeft"
  >
    <Form.Item
      name={['company', 'phone']}
      rules={[{ required: false, whitespace: true, message: 'Provide contact number with country code!' }]}
    >
      <Input allowClear placeholder="Contact number with country code" />
    </Form.Item>
  </Tooltip>,
  <Form.Item
    key="address"
    name={['company', 'address']}
    rules={[{ required: false, whitespace: true, message: 'Provide address!' }]}
  >
    <Input.TextArea rows={1} allowClear placeholder="Address" />
  </Form.Item>,
  <Form.Item
    key="goal"
    name={['company', 'goal']}
    rules={[{ required: false, whitespace: true, message: 'Provide goal info!' }]}
  >
    <Input.TextArea rows={2} allowClear placeholder="Primary Goal" />
  </Form.Item>,
  <Form.Item
    key="note"
    name={['company', 'note']}
    rules={[{ required: false, whitespace: true, message: 'Provide notes & goals!' }]}
  >
    <Input.TextArea rows={3} allowClear placeholder="Notes & Goals" />
  </Form.Item>
]

function SignUp() {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const _isMounted = useRef(false)
  const { state } = useLocation() // Pending Campaign Creation Data

  const [values, setValues] = useSetState({})
  const [firstTry, setFirstTry] = useSafeState(true)
  const [loading, setLoading] = useSafeState(false)
  const [current, setCurrent] = useSafeState(0)
  const next = () => setCurrent(current + 1)
  const prev = () => setCurrent(current - 1)

  const onFinish = async () => {
    try {
      const postData = { ...values }
      window.log('Signup postData:', postData)
      setLoading(true)
      const { data } = await Axios.post(endpoints.signup, postData)
      window.log(`SignUp response -> `, data)
      const { token, user } = data
      /* Set JWT to Axios header for authentication */
      setAxiosAuthHeaderToken(token)
      /* Store token to localStorage for future */
      localStorage.setItem(keys.AUTH_TOKEN, token)
      /* Check pending order creation | From calculator page */
      if (!isEmpty(state)) {
        try {
          const { data: order } = await Axios.post(endpoints.orderBase, { ...state, clientId: user.id })
          window.log(`Create campaign response -> `, order)
        } catch (error) {
          window.log('Create campaign error:', error)
        } finally {
          localStorage.removeItem(keys.PENDING_CREATE_CAMPAIGN_DATA)
        }
      }
      /* Update the auth state */
      dispatch(setCurrentUser(user))
      localStorage.setItem(keys.SIGNUP_DONE_NOW, 'true')
      reloadChannel.postMessage(APP_ID)
    } catch (error) {
      handleError(error, true)
    } finally {
      setFirstTry(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    _isMounted.current = true
    message.destroy('account-deleted')
    return () => {
      _isMounted.current = false
    }
  }, [])

  const getStepProps = index => {
    if (firstTry) return {}
    return {
      onClick: () => setCurrent(index),
      className: 'cursor-pointer'
    }
  }

  const steps = [
    {
      ...getStepProps(0),
      title: 'Your Information',
      content: (
        <>
          <Row gutter={[10, 0]}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                rules={[{ whitespace: true, required: true, message: 'Provide first name!' }]}
              >
                <Input allowClear prefix={<UserOutlined />} placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" rules={[{ whitespace: true, required: true, message: 'Provide last name!' }]}>
                <Input allowClear prefix={<UserOutlined />} placeholder="Last Name" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            hasFeedback
            rules={[
              { whitespace: true, required: true, message: `Please input your email!` },
              { type: 'email', message: 'Provide valid email!' }
            ]}
          >
            <Input allowClear prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" hasFeedback rules={[basePasswordRule]}>
            <Input.Password allowClear prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>
          <Row gutter={[10, 0]}>
            <Col span={24} md={12}>
              <Form.Item name="linkedin" rules={[{ whitespace: true, message: 'Please provide LinkedIn!' }]}>
                <Input allowClear prefix={<LinkedinOutlined />} placeholder="LinkedIn" />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item name="website" rules={[{ required: false, validator: validateUrl }]}>
                <Input allowClear prefix={<GlobalOutlined />} placeholder="Website" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" rules={[{ whitespace: true, message: 'Provide address!' }]}>
            <Input.TextArea rows={2} allowClear placeholder="Address (e.g. Rodeo Drive)" />
          </Form.Item>
        </>
      )
    },
    {
      ...getStepProps(1),
      title: 'Your Budget',
      content: (
        <>
          <Form.Item name="budget">
            <AsyncSelect
              allowClear={true}
              filterOption={false}
              handleGetOptions={val =>
                genericSearchOptionsFunc(endpoints.budgetBase + `?${keys.NULL_COL_PREFIX}advertisementId=`, val)
              }
              placeholder="Select your budget"
              className="w-100"
            />
          </Form.Item>
        </>
      )
    },
    {
      ...getStepProps(2),
      title: 'Your Industries',
      content: (
        <>
          <Form.Item name="industries">
            <AsyncSelect
              mode="multiple"
              allowClear={true}
              showSearch={true}
              filterOption={true}
              onlyInitialSearch={true}
              optionFilterProp="label"
              placeholder="Select your industries"
              handleGetOptions={val =>
                genericSearchOptionsFunc(endpoints.industryBase + `?${keys.NULL_COL_PREFIX}budgetId=`, val)
              }
              className="w-100"
            />
          </Form.Item>
        </>
      )
    },
    {
      ...getStepProps(3),
      title: 'Your Company',
      content: <>{companyFields}</>
    }
  ]
  const items = steps.map(item => ({ ...item, key: item.title, title: item.title }))

  return (
    <Page>
      <div className="flex min-h-screen items-center justify-center p-5">
        <div className="bg-secondary mx-5 flex w-full max-w-5xl flex-col justify-center rounded-lg p-8 align-middle text-white lg:mb-10">
          <Row justify="center" className="my-0">
            <Logo light rowProps={{ className: 'my-0' }} />
          </Row>

          <h1 className="mb-4 text-center">Sign Up</h1>

          <div className="rounded-xl bg-white px-4 py-3">
            <Steps current={current} items={items} />
          </div>

          <div className="w-100 flex justify-center">
            <div className="w-full max-w-3xl text-white">
              <Form
                form={form}
                size="large"
                className="mt-3"
                name="signup-form"
                onFinish={onFinish}
                onValuesChange={(_, _values) => {
                  setValues(_values)
                }}
              >
                <div className="min-h-300 my-5">{steps[current].content}</div>
                <Row align="middle" justify="center" className="mt-4">
                  <Space>
                    {current > 0 && <Button onClick={() => prev()}>Previous</Button>}

                    {current < steps.length - 1 && (
                      <Button
                        type="primary"
                        onClick={async () => {
                          const { errorFields } = await form.validateFields()
                          const hasError = errorFields?.filter(({ errors }) => errors.length).length
                          if (!hasError) next()
                        }}
                      >
                        Next
                      </Button>
                    )}

                    {current === steps.length - 1 && (
                      <Button
                        block
                        type="primary"
                        htmlType="submit"
                        icon={<SendOutlined rotate={-40} />}
                        loading={loading}
                      >
                        Submit
                      </Button>
                    )}
                  </Space>
                </Row>
              </Form>

              <Row justify="center" className="mt-3">
                <Col>
                  <Link to={links.login.to} state={state}>
                    <Button type="link" className="within pl-0">
                      Already have an account?
                    </Button>
                  </Link>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default SignUp
