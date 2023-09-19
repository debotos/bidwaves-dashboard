import Axios from 'axios'
import { useRef, useEffect } from 'react'
import { CaretDownFilled, SearchOutlined } from '@ant-design/icons'
import { useDebounceFn, useSetState, useLockFn, useMount, useUnmount } from 'ahooks'
import { Row, Col, Input, Table, Dropdown, Space, Select, Drawer, Button } from 'antd'

import Manage from './manage'
import keys from 'config/keys'
import { message } from 'App'
import endpoints from 'config/endpoints'
import OrderPayment from './OrderPayment'
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
  getOrderStatusColProps
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
      const paginationQuery = `size=${state.paginationPageSize}&page=${page}`
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

  const updateLocalStateDataList = (updates = {}) => {
    setState(prevState => ({
      ...prevState,
      dataResponse: {
        ...prevState.dataResponse,
        list: prevState.dataResponse.list.map(x => {
          if (x.id === updates.id) return { ...x, ...updates }
          return x
        })
      }
    }))
  }

  const closeManageUI = () => {
    setState({ editingItem: null })
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
    { title: 'Status', sorter: true, ...getOrderStatusColProps('status'), width: undefined },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      width: 280,
      render: value => readableTime(value, true),
      sorter: true
    },
    { title: 'Added', dataIndex: 'createdAt', width: 140, render: value => readableTime(value), sorter: true },
    {
      width: showOnlyCompleted ? 80 : 100,
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
            <Col>
              <OrderPayment order={record} onOrderUpdate={updateLocalStateDataList} />
            </Col>
            {!showOnlyCompleted && (
              <Col>
                <ConfigButton onClick={() => setState({ editingItem: record })} />
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
      <p className="mb-4">Manage all your campaigns from here</p>
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
          <div className="flex justify-center">
            <Input
              allowClear
              placeholder="Search"
              prefix={<SearchOutlined />}
              onChange={handleSearchInputChange}
              style={{ width: 'clamp(350px, 60%, 400px)' }}
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
          </div>
        </Col>

        <Col>
          <Space className="w-100" wrap={true}>
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
              style={{ width: 170 }}
              disabled={showOnlyCompleted}
              value={state.activeStatus || undefined}
              options={Object.values(keys.ORDER_STATUS).map(x => ({ value: x, label: x }))}
              onChange={val => setState({ dataResponse: null, paginationCurrentPage: 1, activeStatus: val ?? '' })}
            />
          </Space>
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
        title="Manage Campaign"
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
            <Button onClick={closeManageUI}>Done</Button>
          </Space>
        }
      >
        {state.editingItem && <Manage order={state.editingItem} closeUI={closeManageUI} />}
      </Drawer>
    </>
  )
}

export default ListComponent
