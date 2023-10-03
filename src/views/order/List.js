import Axios from 'axios'
import { useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CaretDownFilled, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Row, Col, Input, Table, Dropdown, Space, Select, Drawer, Button } from 'antd'
import { useDebounceFn, useSetState, useLockFn, useMount, useUnmount, useUpdateEffect } from 'ahooks'

import Manage from './manage'
import keys from 'config/keys'
import { message } from 'App'
import { links } from 'config/vars'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
// import generateExcel from 'helpers/generateExcel'
// import AsyncSwitch from 'components/micro/fields/AsyncSwitch'
import {
  DeleteIcon,
  ConfigButton,
  // ExportButton,
  RefreshButton
} from 'components/micro/Common'
import {
  isEmpty,
  defaultPaginationConfig,
  readableTime,
  // commonBoolColProps,
  getOrderStatusColProps,
  sleep
} from 'helpers/utility'

const PAID_STATUS = { PAID: 'Paid', NOT_PAID: 'Not Paid' }
const FULLFIL_STATUS = { COMPLETE: 'Complete', NOT_COMPLETE: 'Not Complete' }
const searchableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' }
]
const defaultSearchField = searchableColumns[0].key
// const exportColumns = [...searchableColumns.map(x => x.key), 'status', 'assets', 'complete', 'paid']

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

  const deleteListItem = async id => {
    try {
      _isMounted.current && setState({ idDeleting: id })
      const req = await Axios.delete(endpoints.order(id))
      const res = req.data
      window.log(`Delete response -> `, res)
      message.success('Action successful.')
      getMainData()
    } catch (error) {
      handleError(error, true)
    } finally {
      _isMounted.current && setState({ idDeleting: null })
    }
  }

  // const handleExport = () => {
  //   try {
  //     _isMounted.current && setState({ exporting: true })
  //     const list = state.dataResponse.list
  //     if (isEmpty(list)) return message.info('Sorry, Data is empty.')
  //     generateExcel(list, `Bidwaves Campaigns (Page ${state.paginationCurrentPage})`, exportColumns)
  //     message.success('Data exported successfully!')
  //   } catch (error) {
  //     handleError(error, true)
  //   } finally {
  //     _isMounted.current && setState({ exporting: false })
  //   }
  // }

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

  const closeManageUI = () => {
    setState({ editingItem: null })
    navigate(links.orders.to)
    getMainData()
  }

  const showOnlyCompleted = isShowOnlyCompleted()

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      render: val => <span className="font-bold text-[--primary-color]">{val}</span>
    },
    { title: 'Status', sorter: true, ...getOrderStatusColProps('status'), width: 300, align: undefined },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      width: 210,
      render: value => readableTime(value, true),
      sorter: true
    },
    { title: 'Added', dataIndex: 'createdAt', width: 140, render: value => readableTime(value), sorter: true },
    {
      width: showOnlyCompleted ? 70 : 90,
      fixed: 'right',
      title: 'Action',
      align: 'center',
      dataIndex: 'action',
      render: (_, record) => {
        const { id } = record
        return (
          <Row justify="space-around">
            <Col>
              <DeleteIcon
                loading={state.idDeleting === id}
                title={`Sure to delete?`}
                onClick={() => deleteListItem(id)}
              />
            </Col>
            {!showOnlyCompleted && (
              <Col>
                <ConfigButton id={`order-${id}-config-btn`} onClick={() => setState({ editingItem: record })} />
              </Col>
            )}
          </Row>
        )
      }
    }
  ]

  const list = state.dataResponse?.list ?? []
  // const noData = isEmpty(list)

  return (
    <>
      <h2 className="mb-1">Here Are Your Open Campaigns</h2>
      <p className="mb-4">Manage all your campaigns from here.</p>
      <Row gutter={[10, 10]} justify="space-between" align="middle" className="mb-4">
        <Col>
          <Space>
            <RefreshButton disabled={state.exporting} loading={state.fetching} onClick={reRender} />
            {/* <ExportButton
              title="Export Page Data"
              disabled={noData || state.fetching}
              loading={state.exporting}
              onClick={handleExport}
            /> */}
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
              {/* <Select
              allowClear
              placeholder="Payment"
              style={{ width: 110 }}
              disabled={showOnlyCompleted}
              value={state.paidStatus || undefined}
              options={Object.values(PAID_STATUS).map(x => ({ value: x, label: x }))}
              onChange={val => setState({ dataResponse: null, paginationCurrentPage: 1, paidStatus: val ?? '' })}
            /> */}
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
          }
        }}
        scroll={{ x: 'max-content' }}
        columns={columns}
        loading={state.fetching}
        dataSource={list}
      />

      <Drawer
        title={'Manage ' + state.editingItem?.name || 'Campaign'}
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
