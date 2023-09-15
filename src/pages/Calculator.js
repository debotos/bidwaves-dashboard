import { useSetState } from 'ahooks'
import { Col, Row, Space, Grid, Tooltip, Avatar } from 'antd'

import { Page } from 'components/micro/Common'
import PublicHeader from 'components/micro/PublicHeader'
import AsyncSelect, { genericSearchOptionsFunc } from 'components/micro/fields/AsyncSelect'
import endpoints from 'config/endpoints'
import keys from 'config/keys'
import { getPlaceholderInput } from 'helpers/utility'

const { useBreakpoint } = Grid
const wrapperClass = 'pt-14 lg:pt-16'

const Calculator = () => {
  const screens = useBreakpoint()
  const [state, setState] = useSetState({ advertisementId: '', budgetId: '' })

  console.log(state)
  const inputMinWidth = screens.lg ? 350 : 300

  const _getPlaceholderInput = (placeholder = '') => {
    return getPlaceholderInput({
      placeholder,
      size: 'large',
      style: { minWidth: inputMinWidth, backgroundColor: '#dcdcdc' }
    })
  }

  return (
    <>
      <div className="w-100 fixed top-0 z-10">
        <PublicHeader />
      </div>
      <Page>
        <Row>
          <Col span={24} lg={12}>
            <div className="min-h-screen bg-[--primary-color]">
              <div className={wrapperClass}>
                <div className="px-4 py-5 pt-11">
                  <h1 className="text-center text-white lg:text-5xl">BidWaves PPC Calculator</h1>
                  <div className="mt-9">
                    <Space direction="vertical" size={24} align="center" className="w-100">
                      <AsyncSelect
                        size="large"
                        allowClear={true}
                        showSearch={true}
                        filterOption={true}
                        onlyInitialSearch={true}
                        style={{ minWidth: inputMinWidth }}
                        optionFilterProp="tag_label"
                        placeholder="Select Your Advertisement Type"
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
                        onChange={value => setState({ budgetId: '', advertisementId: value })}
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
                                        {item.tag?.label}
                                      </Space>
                                    ),
                                    tag_label: item.tag?.label || ''
                                  }
                                }
                              }
                            )
                          }}
                          onChange={value => setState({ budgetId: value })}
                        />
                      ) : (
                        _getPlaceholderInput('Select Advertisement')
                      )}
                    </Space>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col span={24} lg={12}>
            <div className={wrapperClass}></div>
          </Col>
        </Row>
      </Page>
    </>
  )
}

export default Calculator
