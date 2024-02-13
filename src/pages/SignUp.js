import Axios from 'axios'
import ReactPlayer from 'react-player/lazy'
import { useDispatch } from 'react-redux'
import React, { useRef, useEffect } from 'react'
import { useSafeState, useSetState } from 'ahooks'
import { Link, useLocation } from 'react-router-dom'
import { LockOutlined, SendOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Row, Button, Form, Input, Col, Steps, Space, message, Tooltip, Alert } from 'antd'

import keys from 'config/keys'
import { links } from 'config/vars'
import endpoints from 'config/endpoints'
import { APP_ID, reloadChannel } from 'App'
import handleError from 'helpers/handleError'
import { Page, Logo } from 'components/micro/Common'
import InputURL from 'components/micro/fields/InputURL'
import { setCurrentUser } from 'redux/slices/authSlice'
import { setAxiosAuthHeaderToken } from 'helpers/axiosHelper'
import CustomSelect from 'components/micro/fields/CustomSelect'
import { basePasswordRule, getCssVar, isEmpty } from 'helpers/utility'

export const companyFields = [
  <Form.Item
    key="name"
    name={['company', 'name']}
    rules={[{ whitespace: true, required: true, message: 'Provide name!' }]}
  >
    <Input allowClear placeholder="Company Name" />
  </Form.Item>,
  <Tooltip
    key="url-tooltip"
    color={getCssVar('primary-color')}
    trigger={['focus']}
    title={"The URL must include either 'http://' or 'https://' as a prefix. For example: 'https://example.com'."}
    placement="topLeft"
  >
    <Form.Item
      key="url"
      name={['company', 'url']}
      rules={[{ required: true, whitespace: true, message: 'Provide website URL!' }]}
    >
      <InputURL allowClear placeholder="Company Website" />
    </Form.Item>
  </Tooltip>,
  <Tooltip
    key="phone"
    trigger={['focus']}
    title={`Please prefix the phone number with valid country code (eg. +1)`}
    placement="topLeft"
  >
    <Form.Item
      name={['company', 'phone']}
      initialValue={'+1'}
      rules={[{ required: true, whitespace: true, message: 'Provide contact number with country code!' }]}
    >
      <Input allowClear placeholder="Contact number with country code" />
    </Form.Item>
  </Tooltip>,
  <Form.Item
    key="address"
    name={['company', 'address']}
    rules={[{ required: true, whitespace: true, message: 'Provide address!' }]}
  >
    <Input.TextArea rows={1} allowClear placeholder="Business Address" />
  </Form.Item>,
  <Form.Item key="goal" name={['company', 'goal']} rules={[{ required: false, message: 'Provide campaign goal!' }]}>
    {/* <Input.TextArea
      rows={2}
      allowClear
      placeholder="Campaign Goal, e.g. Generate Site Visitors, Generate Leads, Generate Sales, etc."
      maxLength={500}
    /> */}
    <CustomSelect
      initialOptions={['Generate Revenue (Online Shops)', 'Generate Leads', 'Generate Site Visitors'].map(item => ({
        label: item,
        value: item
      }))}
    />
  </Form.Item>,
  <Form.Item
    key="note"
    name={['company', 'note']}
    rules={[{ required: false, whitespace: true, message: 'Provide additional information!' }]}
  >
    <Input.TextArea rows={3} allowClear placeholder="Additional Information" maxLength={500} />
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
      title: 'Your Personal Information',
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
          {/* <Row gutter={[10, 0]}>
            <Col span={24} md={12}>
              <Form.Item name="linkedin" rules={[{ whitespace: true, message: 'Please provide LinkedIn!' }]}>
                <Input allowClear prefix={<LinkedinOutlined />} placeholder="LinkedIn" />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Tooltip
                color={getCssVar('primary-color')}
                trigger={['focus']}
                title={
                  "The URL must include either 'http://' or 'https://' as a prefix. For example: 'https://example.com'."
                }
                placement="topLeft"
              >
                <Form.Item name="website" rules={[{ required: false, validator: validateUrl }]}>
                  <InputURL allowClear prefix={<GlobalOutlined />} placeholder="Website" />
                </Form.Item>
              </Tooltip>
            </Col>
          </Row>
          <Form.Item name="address" rules={[{ whitespace: true, message: 'Provide address!' }]}>
            <Input.TextArea rows={2} allowClear placeholder="Your Business Address" />
          </Form.Item> */}
        </>
      )
    },
    {
      ...getStepProps(1),
      title: 'Your Company Information',
      content: <>{companyFields}</>
    }
  ]
  const items = steps.map(item => ({ ...item, key: item.title, title: item.title }))
  // eslint-disable-next-line no-undef
  const signupVideo = process.env.REACT_APP_SIGNUP_VIDEO

  return (
    <div className="bg-secondary">
      <Page>
        <div className="flex min-h-screen items-center justify-center py-5">
          <div className="mx-5 flex w-full flex-col justify-center rounded-lg p-8 align-middle text-white lg:mb-10">
            <Row justify="center" className="my-0">
              <Logo light rowProps={{ className: 'my-0' }} />
            </Row>

            {!isEmpty(state) && (
              <div className="flex w-full justify-center">
                <Alert
                  showIcon
                  type="info"
                  className="my-3"
                  message={
                    <>
                      Please <b>Sign Up</b> or <b>Log In</b> to start a campaign with the information you just provided.
                    </>
                  }
                />
              </div>
            )}
            <h1 className="mb-4 text-center">Sign Up</h1>

            <div className="w-100 flex flex-col items-center">
              <div className="w-full max-w-3xl text-white">
                <div className="rounded-xl bg-white px-4 py-3 lg:px-14">
                  <Steps current={current} items={items} />
                </div>
              </div>

              <div className="w-full">
                <Form
                  form={form}
                  size="large"
                  className="mt-0"
                  name="signup-form"
                  onFinish={onFinish}
                  onValuesChange={(_, _values) => {
                    setValues(_values)
                  }}
                >
                  <div className="min-h-300 mb-4 mt-5">
                    {!current ? (
                      <Page>
                        <Row justify="center">
                          <div className="w-full max-w-3xl">{steps[current].content}</div>
                        </Row>
                      </Page>
                    ) : (
                      <Page>
                        <Row justify="center">
                          <div className="container">
                            <Row justify={`center`} gutter={[40, 30]} className="mb-4 lg:mb-0">
                              <Col span={24} lg={signupVideo ? 12 : 14}>
                                {steps[current].content}
                              </Col>
                              {signupVideo && (
                                <Col span={24} lg={12}>
                                  <h4 className="mb-3 text-center text-2xl font-semibold text-white">
                                    While we setup the account, watch what will happen next.
                                  </h4>
                                  <ReactPlayer url={signupVideo} width="100%" height="85%" />
                                </Col>
                              )}
                            </Row>
                          </div>
                        </Row>
                      </Page>
                    )}
                  </div>
                  <Row align="middle" justify="center">
                    <Space className={current ? 'mt-8 lg:mt-1' : 'mt-1'}>
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
                        Already have an account?&nbsp;<b>Login</b>
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </div>
  )
}

export default SignUp
