import Axios from 'axios'
import { useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CaretDownFilled, PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { useDebounceFn, useSetState, useLockFn, useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { Row, Col, Input, Dropdown, Space, Button, Table, Flex, Select, Drawer } from 'antd'

import keys from 'config/keys'
import { links } from 'config/vars'
import endpoints from 'config/endpoints'
import CampaignStats from './CampaignStats'
import handleError from 'helpers/handleError'
import StatsIframe from 'components/micro/StatsIframe'
import { RefreshButton } from 'components/micro/Common'
import { defaultPaginationConfig, isEmpty } from 'helpers/utility'

const FULLFIL_STATUS = { COMPLETE: 'Completed', NOT_COMPLETE: 'Running' }
const searchableColumns = [{ key: 'name', label: 'Name' }]
const defaultSearchField = searchableColumns[0].key

function ListComponent({ reRender }) {
  const _isMounted = useRef(false)
  const navigate = useNavigate()
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const openOrderId = searchParams.get('open')
  const [state, setState] = useSetState({
    searchText: '',
    fullfilStatus: FULLFIL_STATUS.NOT_COMPLETE,
    searchField: defaultSearchField,
    fetching: true,
    exporting: false,
    dataResponse: {},
    idDeleting: null,
    editingItem: null,
    paginationCurrentPage: 1,
    paginationPageSize: defaultPaginationConfig.pageSizeOptions[1],
    sortByQuery: '',
    iFrameModal: null
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
      const paginationQuery = `size=${state.paginationPageSize}&page=${page}&${
        keys.BOOL_COL_PREFIX
      }active=true&simple=true&attributes=${encodeURIComponent('id, name, stats_iframe_url')}`
      const paginationQueryPrefix = _ep.includes('?') ? '&' : '?'
      _ep += paginationQueryPrefix + paginationQuery

      // For filters
      _ep += `&${keys.NOT_NULL_COL_PREFIX}last_payment_date=` // Only paid items always

      if (state.searchText) {
        _ep += `&${state.searchField}=${encodeURIComponent(state.searchText)}`
      }

      if (isShowOnlyCompleted()) {
        _ep += `&${keys.BOOL_COL_PREFIX}complete=true`
      } else {
        _ep += `&${keys.BOOL_COL_PREFIX}complete=false`
        _ep += `&${keys.ENUM_COL_PREFIX}status=${encodeURIComponent(keys.ORDER_STATUS.RUNNING)}`
      }

      // For sorting
      if (state.sortByQuery) {
        const [order, sort] = state.sortByQuery.split('@')
        _ep += `&order=${order}&sort=${sort}`
      }

      const { data: res } = await Axios.get(_ep)
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
        // Do anything if needed
      }
    })()
  }, [state.fetching])

  useEffect(() => {
    if (_isMounted.current) getMainData()
  }, [state.paginationCurrentPage, state.paginationPageSize])

  useEffect(() => {
    if (_isMounted.current) getMainData({ currentPage: 1 })
  }, [state.searchText, state.fullfilStatus, state.sortByQuery])

  useEffect(() => {
    if (_isMounted.current && state.searchText) getMainData({ currentPage: 1 })
  }, [state.searchField])

  const handleSearchInputChange = e => {
    e.persist()
    const value = e.target.value
    const update = { searchText: value }
    debounceSetState(update)
  }

  const onTableChange = (pagination, filters, sorter) => {
    const { field, order } = sorter
    if (order) {
      setState({ sortByQuery: `${field}@${order.replace('end', '')}` })
    } else {
      setState({ sortByQuery: '' })
    }
  }

  // const showOnlyCompleted = isShowOnlyCompleted()

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      render: val => <span className="font-bold text-[--primary-color]">{val}</span>
    },
    {
      width: 200,
      fixed: 'right',
      title: 'Action',
      align: 'center',
      dataIndex: 'action',
      render: (_, record) => {
        return (
          <Space>
            <Button
              type="default"
              size="small"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                setState({ iFrameModal: record })
              }}
              disabled={!record.stats_iframe_url}
              icon={<EyeOutlined />}
            >
              View Full Report
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              Manage Campaign
            </Button>
          </Space>
        )
      }
    }
  ]

  const list = state.dataResponse?.list ?? []

  return (
    <>
      <Row gutter={[10, 10]} justify="space-between" align="middle" className="mb-4 mt-3">
        <Col>
          <RefreshButton disabled={state.exporting} loading={state.fetching} onClick={reRender} label="Refresh" />
        </Col>
        <Col span={18} md={16} lg={14}>
          <Flex wrap={true} gap={14} justify="center">
            <Input
              allowClear
              placeholder="Search"
              prefix={<SearchOutlined />}
              style={{ maxWidth: 250 }}
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
          </Flex>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(links.private_calculator.to)}>
            Add A New Campaign
          </Button>
        </Col>
      </Row>

      <Table
        rowKey="id"
        size="small"
        className="mb-4"
        onChange={onTableChange}
        pagination={{
          ...defaultPaginationConfig,
          hideOnSinglePage: true,
          total: state.dataResponse?.total ?? 0,
          current: state.paginationCurrentPage,
          pageSize: state.paginationPageSize,
          onChange: (page, pageSize) => {
            setState({ paginationCurrentPage: page, paginationPageSize: pageSize })
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
        scroll={{ x: 'max-content' }}
        columns={columns}
        loading={state.fetching}
        dataSource={list}
        expandable={{
          expandRowByClick: true,
          expandedRowRender: record => <CampaignStats campaign={record} key={record.id} />
        }}
      />

      <Drawer
        destroyOnClose
        width={`100%`}
        closable={false}
        open={!isEmpty(state.iFrameModal)}
        styles={{ body: { padding: 0 }, header: { paddingTop: 8, paddingBottom: 8 } }}
        title={
          <Row wrap={false} justify={`space-between`} align={`middle`}>
            <Col>{state.iFrameModal?.name}</Col>
            <Col>
              <Button danger onClick={() => setState({ iFrameModal: '' })}>
                Close
              </Button>
            </Col>
          </Row>
        }
      >
        <StatsIframe url={state.iFrameModal?.stats_iframe_url} className={`h-full`} />
      </Drawer>
    </>
  )
}

export default ListComponent
