import Axios from 'axios'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { FaPencilAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useSafeState, useSetState } from 'ahooks'
import { EditOutlined } from '@ant-design/icons'
import { Col, Row, Space, Grid, Tooltip, Avatar, Slider, Button, notification, Modal, InputNumber } from 'antd'

import keys from 'config/keys'
import { links } from 'config/vars'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import PublicHeader from 'components/micro/PublicHeader'
import { CalenderLink, Page } from 'components/micro/Common'
import AsyncSelect, { genericSearchOptionsFunc } from 'components/micro/fields/AsyncSelect'
import { getCssVar, getPlaceholderInput, getReadableCurrency, isEmpty } from 'helpers/utility'

export const enterpriseCalenderLink = `https://calendly.com/bidwaves/bidwaves-enterprise?hide_gdpr_banner=1`

export const generateBudgetOptionLabel = item => {
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
export const commonBudgetSelectProps = {
  optionPropsOverrideCb: generateBudgetOptionLabel
}

const { useBreakpoint } = Grid
const valClass = 'm-0 whitespace-nowrap font-bold text-[--primary-color] lg:text-2xl'
const initialState = {
  advertisement: null,
  advertisementId: '',
  budget: null,
  budgetId: '',
  budget_amount: null,
  industry: null,
  industryId: ''
}

const Calculator = ({ embed }) => {
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const [loading, setLoading] = useSafeState(false)
  const [state, setState] = useSetState({ ...initialState })

  const { isAuthenticated, user } = useSelector(state => state.auth)

  const handleStart = async () => {
    try {
      setLoading(true)

      const postData = {
        clientId: user?.id,
        advertisementId: state.advertisementId,
        budgetId: state.budgetId,
        budget_amount: state.budget_amount,
        industries: [state.industryId]
      }

      if (!isAuthenticated) {
        // Save it locally
        localStorage.setItem(
          keys.PENDING_CREATE_CAMPAIGN_DATA,
          JSON.stringify({ ...state, postData, timestamp: Date.now() })
        )
        navigate(links.register.to, { state: postData })
        return
      }

      const { data: order } = await Axios.post(endpoints.orderBase, postData)
      window.log(`Order response -> `, order)
      notification.success({
        message: 'Campaign created successfully!',
        description: `"${order.name}" created successfully!`
      })
      navigate(links.orders.to)
    } catch (error) {
      handleError(error, true)
    } finally {
      setLoading(false)
    }
  }

  const inputMinWidth = screens.lg ? 366 : 300

  const _getPlaceholderInput = (placeholder = '') => {
    return getPlaceholderInput({
      placeholder,
      size: 'large',
      style: { minWidth: inputMinWidth, backgroundColor: '#dcdcdc' }
    })
  }

  const enterpriseSelected = !isEmpty(state.budget) && isEmpty(state.budget?.max)

  let cta_el = null
  let visitors_count = 0
  let leads_count = 0
  if (state.budget_amount && !isEmpty(state.industry)) {
    let amount =
      Number(state.budget_amount) - (Number(state.budget?.labor_cost || 0) + Number(state.budget?.fixed_fee || 0))
    const holdout_cost = (amount * Number(state.budget?.holdout_percentage)) / 100
    amount -= holdout_cost
    visitors_count = Math.round(amount / Number(state.industry.cpc))
    leads_count = Math.round((visitors_count * Number(state.industry.rate_pct)) / 100)

    cta_el = (
      <Button size="large" shape="round" className="cta-btn" loading={loading} onClick={handleStart}>
        <span className="font-bold">Start Your Campaign</span>
      </Button>
    )
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

  return (
    <>
      {!embed && (
        <div className="w-100 fixed top-0 z-10">
          <PublicHeader />
        </div>
      )}
      <Page>
        <Row className={`${embed ? 'mt-3' : ''}`}>
          <Col span={24} lg={embed ? 11 : 12}>
            <div
              className={`flex items-center justify-center bg-[--primary-color] ${
                embed ? 'rounded-lg' : 'lg:min-h-screen'
              }`}
            >
              <div className={`${embed ? 'mt-4' : 'pt-10 lg:pt-0'}`}>
                <div className={`px-4 py-5 pt-11 lg:pt-14 ${embed ? 'pb-11 lg:pb-14' : ''}`}>
                  <h1 className="text-center text-white lg:text-5xl">BidWaves</h1>
                  <h1 className="text-center text-white lg:text-5xl">PPC Calculator</h1>
                  <div className="mt-9 lg:mt-10">
                    <Space direction="vertical" size={24} align="center" className="w-100">
                      <AsyncSelect
                        size="large"
                        allowClear={true}
                        showSearch={true}
                        filterOption={true}
                        onlyInitialSearch={true}
                        defaultSelectFirstOption={true}
                        style={{ minWidth: inputMinWidth }}
                        optionFilterProp="tag_label"
                        placeholder="Select Your Media Channel"
                        handleGetOptions={val =>
                          genericSearchOptionsFunc(endpoints.advertisementBase, val, {
                            optionPropsOverrideCb: item => {
                              return {
                                label: (
                                  <Space>
                                    {item.image?.secure_url && (
                                      <Tooltip title={item?.name}>
                                        <Avatar size="small" src={item.image?.secure_url} />
                                      </Tooltip>
                                    )}
                                    {item.name}
                                  </Space>
                                ),
                                tag_label: item.name || ''
                              }
                            }
                          })
                        }
                        onChange={(value, option) => {
                          setState({ ...initialState, advertisementId: value, advertisement: option })
                        }}
                      />

                      {state.advertisementId ? (
                        <AsyncSelect
                          size="large"
                          key={state.advertisementId}
                          allowClear={true}
                          showSearch={true}
                          filterOption={true}
                          onlyInitialSearch={true}
                          optionFilterProp="tag_label"
                          style={{ minWidth: inputMinWidth }}
                          placeholder="Select Your Budget"
                          handleGetOptions={val => {
                            return genericSearchOptionsFunc(
                              endpoints.budgetBase +
                                `?${keys.EQUAL_TO_COL_PREFIX}advertisementId=${state.advertisementId}`,
                              val,
                              commonBudgetSelectProps
                            )
                          }}
                          onChange={(value, option) => {
                            setState({
                              industryId: '',
                              industry: null,
                              budgetId: value,
                              budget: option,
                              budget_amount: option ? Number(option.min) : null
                            })
                          }}
                        />
                      ) : (
                        _getPlaceholderInput('Select Advertisement')
                      )}

                      {!enterpriseSelected && (
                        <>
                          {state.budgetId ? (
                            <AsyncSelect
                              size="large"
                              key={state.budgetId}
                              allowClear={true}
                              showSearch={true}
                              filterOption={true}
                              onlyInitialSearch={true}
                              optionFilterProp="label"
                              style={{ minWidth: inputMinWidth }}
                              placeholder="Select Your Industry"
                              handleGetOptions={val => {
                                return genericSearchOptionsFunc(
                                  endpoints.industryBase + `?${keys.EQUAL_TO_COL_PREFIX}budgetId=${state.budgetId}`,
                                  val
                                )
                              }}
                              onChange={(value, option) => {
                                setState({ industryId: value, industry: option })
                              }}
                            />
                          ) : (
                            _getPlaceholderInput('Select Budget')
                          )}

                          {state.budget && (
                            <Space direction="vertical" align="center">
                              <p className="mb-0 text-white">How much do you want to spend per month?</p>
                              <h1 className="m-0 text-center font-bold text-white lg:text-4xl">
                                {getReadableCurrency(state.budget_amount).replace('.00', '')}&nbsp;&nbsp;
                                <FaPencilAlt className="cursor-pointer" size={22} onClick={handleBudgetAmountEdit} />
                              </h1>
                              <Slider
                                style={{ minWidth: inputMinWidth - 5 }}
                                min={Number(state.budget.min)}
                                max={Number(state.budget.max)}
                                className="app-custom-slider"
                                value={state.budget_amount}
                                onChange={budget_amount => setState({ budget_amount })}
                                tooltip={{ formatter: value => getReadableCurrency(value).replace('.00', '') }}
                                styles={{
                                  rail: { backgroundColor: '#fff', padding: 5, borderRadius: 5 },
                                  track: { backgroundColor: getCssVar('secondary-color'), padding: 5, borderRadius: 5 },
                                  handle: {
                                    backgroundColor: getCssVar('secondary-color'),
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    zIndex: 9,
                                    top: -2
                                  }
                                }}
                              />
                            </Space>
                          )}

                          {cta_el}
                        </>
                      )}

                      <div className="text-center">
                        <p className="mb-1 px-5 text-white">
                          Are you spending more than $20,000 a month?{' '}
                          <CalenderLink qs={`?src=${encodeURIComponent(enterpriseCalenderLink)}`} />
                        </p>
                        <p className="px-5 text-white">
                          If you are an agency,{' '}
                          <CalenderLink label="click here!" qs={`?src=${encodeURIComponent(enterpriseCalenderLink)}`} />
                        </p>
                      </div>
                    </Space>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col span={24} lg={embed ? 13 : 12} className={`${embed ? '' : ''}`}>
            <div className={`flex h-full items-center justify-center ${embed ? '' : 'pt-6 lg:pt-16'}`}>
              <div className={`px-2 py-5 pb-16 md:px-4 lg:pt-14 ${embed ? 'lg:mt-5' : ''}`}>
                {enterpriseSelected ? (
                  <>
                    <h2 className="text-center">
                      You are spending more than $20,000 a month?{' '}
                      <CalenderLink qs={`?src=${encodeURIComponent(enterpriseCalenderLink)}`} anchorClassName="" />
                    </h2>
                  </>
                ) : (
                  <>
                    <h1 className="mb-3 text-center text-3xl lg:text-4xl">Find Out What Results Our</h1>
                    <h1 className="text-center text-3xl lg:text-4xl">System Can Generate For You</h1>
                    {cta_el ? (
                      <>
                        <Row justify="center" className="my-6 lg:my-14">
                          <Col span={24} lg={22} xl={24}>
                            <Space direction="vertical" className="w-100">
                              <Row align="middle" gutter={[10, 10]} wrap={false}>
                                <ValCol className="flex justify-end">
                                  <h3 className={valClass}>
                                    {getReadableCurrency(state.budget_amount).replace('.00', '')}
                                  </h3>
                                </ValCol>
                                <Col>
                                  <p className="m-0">The amount use spending on {state.advertisement?.name}.</p>
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
                        <Row justify="center">{cta_el}</Row>
                      </>
                    ) : (
                      <>
                        <p className="mb-4 max-w-xl text-center text-yellow-600 lg:mb-5">
                          Please select the media channel, budget plan, your industry and your monthly budget to see
                          potential campaign results.
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Page>
    </>
  )
}

export default Calculator

const ValCol = styled(Col)`
  min-width: 103px;
`
