import Axios from 'axios'
import { useSafeState } from 'ahooks'
import { useSelector, useDispatch } from 'react-redux'
import { Row, Button, Form, Input, Col, message, Collapse, Card, Switch, Space, Tooltip } from 'antd'
import { CaretLeftOutlined, CheckOutlined, CloseOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons'

import keys from 'config/keys'
import endpoints from 'config/endpoints'
import { companyFields } from './SignUp'
import handleError from 'helpers/handleError'
import { Page } from 'components/micro/Common'
import InputURL from 'components/micro/fields/InputURL'
import ChangeAvatar from 'components/micro/fields/ChangeAvatar'
import { logoutUser, setCurrentUser } from 'redux/slices/authSlice'
import { basePasswordRule, getCssVar, validateUrl } from 'helpers/utility'
import AsyncSelect, { genericSearchOptionsFunc } from 'components/micro/fields/AsyncSelect'

const cPanelStyles = { border: 'none', borderRadius: 6 }
const getCPanelClass = last => `bg-[--body-bg-color] mb-${last ? 0 : 2}`

const Profile = () => {
  const dispatch = useDispatch()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [updating, setUpdating] = useSafeState(false)
  const [changing, setChanging] = useSafeState(false)
  const [confirmed, setConfirmed] = useSafeState(false)
  const [deleting, setDeleting] = useSafeState(false)
  const { user } = useSelector(state => state.auth)

  const handleProfileUpdate = async values => {
    try {
      setUpdating(true)
      await Axios.patch(endpoints.client(user.id), values)
      const { data } = await Axios.get(endpoints.client(user.id))
      message.success('Update successful.')
      dispatch(setCurrentUser(data))
    } catch (error) {
      handleError(error, true)
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = async values => {
    try {
      setChanging(true)
      const { data } = await Axios.patch(endpoints.changeClientPassword(user.id), values)
      window.log(`Change password response -> `, data)
      message.success('Password change successful.')
      passwordForm.resetFields()
    } catch (error) {
      handleError(error, true)
    } finally {
      setChanging(false)
    }
  }

  const deleteAccount = async () => {
    try {
      setDeleting(true)
      const req = await Axios.delete(endpoints.client(user.id))
      const res = req.data
      window.log(`Delete response -> `, res)
      message.info('Account is deleted.')
      dispatch(logoutUser())
    } catch (error) {
      handleError(error, true)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Page>
        <Row justify="center" className="mt-4">
          <Col span={24} md={16} lg={12} xl={10}>
            <ChangeAvatar
              user={user}
              getEndpoint={id => endpoints.client(id)}
              onFinish={image => dispatch(setCurrentUser({ ...user, image }))}
            />
          </Col>
        </Row>

        <Row justify="center" className="mt-5">
          <Col span={24} md={16} lg={14} xl={10}>
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={{ ...user, budget: user.budget?.id, industries: user.industries?.map(x => x.id) }}
              onFinish={handleProfileUpdate}
            >
              <Row gutter={[10, 0]}>
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    name="first_name"
                    rules={[{ whitespace: true, required: true, message: 'Provide first name!' }]}
                  >
                    <Input allowClear placeholder="First Name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    name="last_name"
                    rules={[{ whitespace: true, required: true, message: 'Provide last name!' }]}
                  >
                    <Input allowClear placeholder="Last Name" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="LinkedIn"
                name="linkedin"
                rules={[{ whitespace: true, message: 'Please provide LinkedIn!' }]}
              >
                <Input allowClear placeholder="LinkedIn" />
              </Form.Item>

              <Tooltip
                key="url-tooltip"
                color={getCssVar('primary-color')}
                trigger={['focus']}
                title={
                  "The URL must include either 'http://' or 'https://' as a prefix. For example: 'https://example.com'."
                }
                placement="topLeft"
              >
                <Form.Item label="Website" name="website" rules={[{ required: false, validator: validateUrl }]}>
                  <InputURL allowClear placeholder="Website" />
                </Form.Item>
              </Tooltip>

              <Form.Item
                label="Address"
                name="address"
                rules={[{ whitespace: true, message: 'Please provide address!' }]}
              >
                <Input.TextArea rows={2} allowClear placeholder="Your Business Address" />
              </Form.Item>

              <Form.Item name="budget" label="Select Budget">
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

              <Form.Item name="industries" label="Select Industries">
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

              <div className="rounded-md bg-white p-2">
                <Collapse
                  bordered={false}
                  destroyInactivePanel
                  expandIconPosition="end"
                  expandIcon={({ isActive }) => <CaretLeftOutlined rotate={isActive ? -90 : 0} />}
                >
                  <Collapse.Panel header="Update Company" key="0" style={cPanelStyles} className={getCPanelClass(true)}>
                    {companyFields}
                  </Collapse.Panel>
                </Collapse>
              </div>

              <Row justify="end" className="mt-4">
                <Form.Item noStyle>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updating}>
                    Save
                  </Button>
                </Form.Item>
              </Row>
            </Form>
          </Col>
        </Row>

        <Row justify="center" className="mt-4">
          <Col span={24} md={16} lg={14} xl={10}>
            <Form form={passwordForm} onFinish={handleChangePassword} layout="vertical">
              <Form.Item
                label="Current Password"
                name="current_password"
                rules={[{ required: true, message: 'Provide current password!' }]}
              >
                <Input.Password prefix={<LockOutlined />} allowClear placeholder="Current Password" />
              </Form.Item>

              <Form.Item label="New Password" name="new_password" rules={[basePasswordRule]}>
                <Input.Password prefix={<LockOutlined />} allowClear placeholder="New Password" />
              </Form.Item>

              <Row justify="end" className="mb-4 mt-3">
                <Form.Item noStyle>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={changing}>
                    Change Password
                  </Button>
                </Form.Item>
              </Row>
            </Form>
          </Col>
        </Row>

        <Row justify="center" className="mb-4 mt-4">
          <Col span={24} md={16} lg={14} xl={10}>
            <Card size="small" title="Delete Account">
              <p>Once you delete your account, there is no going back. Please be certain.</p>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space size="middle">
                    <Switch
                      size="large"
                      checked={confirmed}
                      onChange={checked => setConfirmed(checked)}
                      checkedChildren={<CheckOutlined />}
                      unCheckedChildren={<CloseOutlined />}
                    />
                    <Space direction="vertical" size="small">
                      <b>Confirm</b>
                      <p className="m-0">I want to delete my account.</p>
                    </Space>
                  </Space>
                </Col>
                <Col>
                  <Button type="primary" danger disabled={!confirmed} loading={deleting} onClick={deleteAccount}>
                    DELETE ACCOUNT
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Page>
    </>
  )
}

export default Profile
