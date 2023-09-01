import Axios from 'axios'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import React, { useRef, useEffect } from 'react'
import { useSafeState, useSetState } from 'ahooks'
import { Row, Button, Form, Input, Typography, Col, Steps, Space, message } from 'antd'
import { LockOutlined, SendOutlined, MailOutlined, UserOutlined, LinkedinOutlined } from '@ant-design/icons'

import keys from 'config/keys'
import { links } from 'config/vars'
import endpoints from 'config/endpoints'
import { APP_ID, reloadChannel } from 'App'
import handleError from 'helpers/handleError'
import { Page, Logo } from 'components/micro/Common'
import { setCurrentUser } from 'redux/slices/authSlice'
import { setAxiosAuthHeaderToken } from 'helpers/axiosHelper'
import { basePasswordRule, validateUrl } from 'helpers/utility'
import AsyncSelect, { genericSearchOptionsFunc } from 'components/micro/fields/AsyncSelect'

function SignUp() {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const _isMounted = useRef(false)

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
            name="linkedin"
            rules={[{ whitespace: true, required: true, message: 'Please provide LinkedIn!' }]}
          >
            <Input allowClear prefix={<LinkedinOutlined />} placeholder="LinkedIn" />
          </Form.Item>
          <Form.Item label="Website" name="website" rules={[{ required: false, validator: validateUrl }]}>
            <Input allowClear placeholder="Website" />
          </Form.Item>
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

          <Form.Item name="address" rules={[{ required: true, whitespace: true, message: 'Provide address!' }]}>
            <Input.TextArea rows={2} allowClear placeholder="Business Address" />
          </Form.Item>
        </>
      )
    },
    {
      ...getStepProps(1),
      title: 'Your Budget',
      content: (
        <>
          <Form.Item name="budget" rules={[{ required: true, message: 'Select budget!' }]}>
            <AsyncSelect
              filterOption={false}
              handleGetOptions={val => genericSearchOptionsFunc(endpoints.budgetBase, val)}
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
          <Form.Item name="industries" rules={[{ required: true, message: 'Select at least one industry!' }]}>
            <AsyncSelect
              mode="multiple"
              showSearch={true}
              filterOption={true}
              onlyInitialSearch={true}
              optionFilterProp="label"
              placeholder="Select your industries"
              handleGetOptions={val => genericSearchOptionsFunc(endpoints.industryBase, val)}
              className="w-100"
            />
          </Form.Item>
        </>
      )
    }
  ]
  const items = steps.map(item => ({ ...item, key: item.title, title: item.title }))

  return (
    <Page>
      <div className="flex h-screen items-center justify-center">
        <div className="w-full max-w-4xl p-4">
          <Row justify="center" className="mt-4 py-4">
            <Logo />
          </Row>

          <Typography.Title level={1}>Sign Up</Typography.Title>

          <Form
            form={form}
            size="large"
            className="mt-4"
            name="signup-form"
            onFinish={onFinish}
            onValuesChange={(_, _values) => {
              setValues(_values)
            }}
          >
            <Steps current={current} items={items} />
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
                  <Button block type="primary" htmlType="submit" icon={<SendOutlined rotate={-40} />} loading={loading}>
                    Submit
                  </Button>
                )}
              </Space>
            </Row>
          </Form>

          <Row justify="center" className="mt-3">
            <Col>
              <Link to={links.login.to}>
                <Button type="link" className="pl-0">
                  Already have an account?
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </div>
    </Page>
  )
}

export default SignUp
