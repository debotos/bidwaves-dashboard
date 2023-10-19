import Axios from 'axios'
import Fade from 'react-reveal/Fade'
import { useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CaretDownFilled, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useDebounceFn, useSetState, useLockFn, useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { Row, Col, Input, Dropdown, Space, Select, Drawer, Button, Empty, Card, Skeleton, Pagination } from 'antd'

import Manage from './manage'
import keys from 'config/keys'
import { links } from 'config/vars'
import endpoints from 'config/endpoints'
import CampaignItem from './CampaignItem'
import handleError from 'helpers/handleError'
import emptyImage from 'assets/images/empty.svg'
import { RefreshButton } from 'components/micro/Common'
import { isEmpty, defaultPaginationConfig, sleep } from 'helpers/utility'

const PAID_STATUS = { PAID: 'Paid', NOT_PAID: 'Not Paid' }
const FULLFIL_STATUS = { COMPLETE: 'Complete', NOT_COMPLETE: 'Not Complete' }
const searchableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' }
]
const defaultSearchField = searchableColumns[0].key

function ListComponent({ reRender }) {
  const _isMounted = useRef(false)
  const navigate = useNavigate()
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const openOrderId = searchParams.get('open')
  const [state, setState] = useSetState({
    searchText: '',
    activeStatus: '',
    paidStatus: '',
    fullfilStatus: FULLFIL_STATUS.NOT_COMPLETE,
    searchField: defaultSearchField,
    fetching: true,
    exporting: false,
    dataResponse: {},
    idDeleting: null,
    editingItem: null,
    paginationCurrentPage: 1,
    paginationPageSize: defaultPaginationConfig.pageSizeOptions[0],
    sortByQuery: ''
  })

  const isShowOnlyCompleted = () => state.fullfilStatus === FULLFIL_STATUS.COMPLETE

  const { run: debounceSetState, cancel: cancelDebounceSetState } = useDebounceFn(
    obj => _isMounted.current && setState({ ...(obj || {}) }),
    { wait: 500 }
  )

  useMount(() => {
    _isMounted.current = true
    getMainData()
  })

  useUnmount(() => {
    _isMounted.current = false
    cancelDebounceSetState()
  })

  const getMainData = useLockFn(async config => {
    try {
      const { currentPage } = config || {}
      _isMounted.current && setState({ fetching: true })
      let _ep = endpoints.orderBase
      // For pagination | After this portion '?' is always present
      const page = currentPage || state.paginationCurrentPage
      const paginationQuery = `size=${state.paginationPageSize}&page=${page}&${keys.BOOL_COL_PREFIX}active=true`
      const paginationQueryPrefix = _ep.includes('?') ? '&' : '?'
      _ep += paginationQueryPrefix + paginationQuery

      // For filters
      if (state.searchText) {
        _ep += `&${state.searchField}=${encodeURIComponent(state.searchText)}`
      }

      if (isShowOnlyCompleted()) {
        _ep += `&${keys.BOOL_COL_PREFIX}complete=true`
      } else {
        _ep += `&${keys.BOOL_COL_PREFIX}complete=false`

        if (state.activeStatus) {
          _ep += `&${keys.ENUM_COL_PREFIX}status=${encodeURIComponent(state.activeStatus)}`
        }

        if (state.paidStatus) {
          _ep += `&${keys.BOOL_COL_PREFIX}paid=${state.paidStatus === PAID_STATUS.PAID ? 'true' : 'false'}`
        }
      }

      // For sorting
      if (state.sortByQuery) {
        const [order, sort] = state.sortByQuery.split('@')
        _ep += `&order=${order}&sort=${sort}`
      }

      const req = await Axios.get(_ep)
      const res = req.data
      window.log(`Data response -> `, res)
      setState({ dataResponse: res, paginationCurrentPage: page })
    } catch (error) {
      handleError(error, true)
    } finally {
      _isMounted.current && setState({ fetching: false })
    }
  })

  useUpdateEffect(() => {
    ;(async () => {
      if (!state.fetching && openOrderId) {
        // After fetching finish
        await sleep(500)
        const el = document.getElementById(`order-${openOrderId}-config-btn`)
        if (el) el.click()
      }
    })()
  }, [state.fetching])

  useEffect(() => {
    if (_isMounted.current) getMainData()
  }, [state.paginationCurrentPage, state.paginationPageSize])

  useEffect(() => {
    if (_isMounted.current) getMainData({ currentPage: 1 })
  }, [state.searchText, state.activeStatus, state.paidStatus, state.fullfilStatus, state.sortByQuery])

  useEffect(() => {
    if (_isMounted.current && state.searchText) getMainData({ currentPage: 1 })
  }, [state.searchField])

  useEffect(() => {
    if (_isMounted.current && isShowOnlyCompleted()) setState({ paidStatus: '', activeStatus: '' })
  }, [state.fullfilStatus])

  const handleSearchInputChange = e => {
    e.persist()
    const value = e.target.value
    const update = { searchText: value }
    debounceSetState(update)
  }

  const closeManageUI = () => {
    setState({ editingItem: null })
    navigate(links.orders.to)
    getMainData()
  }

  const showOnlyCompleted = isShowOnlyCompleted()
  const filterExist = state.activeStatus || state.searchText

  const list = state.dataResponse?.list ?? []
  // const noData = isEmpty(list)

  const addBtnEl = (
    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(links.private_calculator.to)}>
      Add A New Campaign
    </Button>
  )

  return (
    <>
      <Row gutter={[10, 10]} justify="space-between" align="middle" className="mb-4 mt-3">
        <Col>
          <Space>
            <RefreshButton disabled={state.exporting} loading={state.fetching} onClick={reRender} />
          </Space>
        </Col>
        <Col flex={1}>
          <Row justify="center">
            <Space align="middle" wrap={true}>
              <Input
                allowClear
                placeholder="Search"
                prefix={<SearchOutlined />}
                onChange={handleSearchInputChange}
                suffix={
                  <Dropdown
                    placement="bottomRight"
                    menu={{
                      items: searchableColumns.map(x => {
                        return {
                          key: x.key,
                          label: x.label,
                          className: `font-semibold`,
                          onClick: () => setState({ searchField: x.key })
                        }
                      }),
                      selectable: true,
                      defaultSelectedKeys: [defaultSearchField]
                    }}
                    trigger={['click']}
                  >
                    <CaretDownFilled className="caret-icon" />
                  </Dropdown>
                }
              />
              <Select
                placeholder="Complete"
                style={{ width: 140 }}
                value={state.fullfilStatus || undefined}
                options={Object.values(FULLFIL_STATUS).map(x => ({ value: x, label: x }))}
                onChange={val => setState({ dataResponse: null, paginationCurrentPage: 1, fullfilStatus: val ?? '' })}
              />
              <Select
                allowClear
                placeholder="Status"
                style={{ width: 185 }}
                disabled={showOnlyCompleted}
                value={state.activeStatus || undefined}
                options={Object.values(keys.ORDER_STATUS).map(x => ({ value: x, label: x }))}
                onChange={val => setState({ dataResponse: null, paginationCurrentPage: 1, activeStatus: val ?? '' })}
              />
            </Space>
          </Row>
        </Col>

        <Col>{addBtnEl}</Col>
      </Row>

      {state.fetching && (
        <>
          {Array(3)
            .fill()
            .map((_, i) => {
              return (
                <div key={i} className={`mb-5 ${i === 0 ? 'mt-4' : ''}`}>
                  <Space className="mb-3">
                    <Skeleton.Avatar active size="large" shape={`circle`} />
                    <Skeleton.Input active size="large" />
                  </Space>
                  <Row gutter={[40, 0]}>
                    <Col span={12}>
                      <Fade>
                        <Card size="small" bodyStyle={{ padding: 0 }}>
                          <Skeleton.Button active={true} size="large" block={true} style={{ height: 260 }} />
                        </Card>
                      </Fade>
                    </Col>
                    <Col span={12}>
                      {Array(3)
                        .fill()
                        .map((_, i) => {
                          return (
                            <Fade key={i}>
                              <Card size="small" bodyStyle={{ padding: 0 }} className="mb-2">
                                <Skeleton.Button active={true} size="large" block={true} style={{ height: 80 }} />
                              </Card>
                            </Fade>
                          )
                        })}
                    </Col>
                  </Row>
                </div>
              )
            })}
        </>
      )}

      {isEmpty(list) && !state.fetching && (
        <Empty
          image={emptyImage}
          className="mb-5 mt-20"
          imageStyle={{ height: 150, pointerEvents: 'none', userSelect: 'none' }}
          description={
            showOnlyCompleted ? (
              <b>No campaigns have been marked as completed at this time.</b>
            ) : (
              <>
                {filterExist ? (
                  <b>No match found.</b>
                ) : (
                  <b className="text-yellow-600">
                    You haven&apos;t added any campaigns yet. Please add a new campaign to get started!
                  </b>
                )}
              </>
            )
          }
        >
          {showOnlyCompleted || filterExist ? null : addBtnEl}
        </Empty>
      )}

      {list.map(item => {
        return <CampaignItem key={item.id} item={item} />
      })}

      <Pagination
        {...defaultPaginationConfig}
        hideOnSinglePage={true}
        total={state.dataResponse?.total ?? 0}
        current={state.paginationCurrentPage}
        pageSize={state.paginationPageSize}
        onChange={(page, pageSize) => {
          setState({ paginationCurrentPage: page, paginationPageSize: pageSize })
        }}
      />

      <Drawer
        title={'Manage ' + (state.editingItem?.name || 'Campaign')}
        placement="right"
        size="large"
        width="100%"
        onClose={closeManageUI}
        open={!isEmpty(state.editingItem)}
        closable={false}
        bodyStyle={{ paddingTop: 10 }}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={closeManageUI}>Close</Button>
          </Space>
        }
      >
        {state.editingItem && <Manage order={state.editingItem} closeUI={closeManageUI} />}
      </Drawer>
    </>
  )
}

export default ListComponent
