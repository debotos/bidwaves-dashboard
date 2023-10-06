import React from 'react'
import Axios from 'axios'
import { useRef, useEffect } from 'react'
import { Row, Col, Input, Table, Dropdown, Tooltip, Button, Modal } from 'antd'
import { useDebounceFn, useSetState, useLockFn, useMount, useUnmount } from 'ahooks'
import {
  CaretDownFilled,
  ClearOutlined,
  PlusCircleOutlined,
  QuestionCircleFilled,
  SearchOutlined
} from '@ant-design/icons'

import { message } from 'App'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { DeleteIcon, RefreshButton } from 'components/micro/Common'
import { defaultPaginationConfig, truncate } from 'helpers/utility'

const searchableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' }
]
const defaultSearchField = searchableColumns[0].key

function ListComponent({ orderId, suggestionUI = false, getCurrentProductIds, setProducts }) {
  const _isMounted = useRef(false)
  const [state, setState] = useSetState({
    searchText: '',
    searchField: defaultSearchField,
    fetching: true,
    exporting: false,
    dataResponse: {},
    idDeleting: null,
    idUpdating: null,
    editingItem: null,
    paginationCurrentPage: 1,
    paginationPageSize: defaultPaginationConfig.pageSizeOptions[0],
    sortByQuery: '',
    idAdding: null,
    viewingProduct: null
  })

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
      let _ep = endpoints.order(orderId) + '/product-suggestion'
      // For pagination | After this portion '?' is always present
      const page = currentPage || state.paginationCurrentPage
      const paginationQuery = `size=${state.paginationPageSize}&page=${page}`
      const paginationQueryPrefix = _ep.includes('?') ? '&' : '?'
      _ep += paginationQueryPrefix + paginationQuery

      // For filters
      if (state.searchText) {
        _ep += `&${state.searchField}=${encodeURIComponent(state.searchText)}`
      }

      // For sorting
      if (state.sortByQuery) {
        const [order, sort] = state.sortByQuery.split('@')
        _ep += `&order=${order}&sort=${sort}`
      }

      const req = await Axios.get(_ep)
      const res = req.data
      window.log(`Products suggestion response -> `, res)
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
  }, [state.searchText, state.sortByQuery])

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

  const handleAddProduct = async productInfo => {
    try {
      const { id: productId } = productInfo
      _isMounted.current && setState({ idAdding: productId })
      const postData = { productId }
      const { data } = await Axios.post(endpoints.orderBase + `/${orderId}/product`, postData)
      window.log(`Product add response -> `, data)
      setProducts(prevItems => [data, ...prevItems])
      message.success('Successfully added to the campaign.')
      getMainData()
    } catch (error) {
      handleError(error, true)
    } finally {
      _isMounted.current && setState({ idAdding: null })
    }
  }

  const deleteListItem = async id => {
    try {
      _isMounted.current && setState({ idDeleting: id })
      const req = await Axios.delete(endpoints.order(orderId) + `/product-suggestion/${id}`)
      const res = req.data
      window.log(`Product suggestion remove response -> `, res)
      message.success('Action successful.')
      getMainData()
    } catch (error) {
      handleError(error, true)
    } finally {
      _isMounted.current && setState({ idDeleting: null })
    }
  }

  const columns = [
    { title: 'Name', dataIndex: 'name', sorter: true },
    {
      title: 'Description',
      dataIndex: 'description',
      render: text => truncate(text, 'Description', suggestionUI ? 100 : 50)
    },
    {
      width: 80,
      fixed: 'right',
      title: 'Action',
      align: 'center',
      dataIndex: 'action',
      render: (_, record) => {
        const { id } = record
        return (
          <Row justify="space-around" gutter={[8, 0]} wrap={false}>
            {suggestionUI && (
              <Col>
                <Tooltip title={`Add To This Campaign`} placement="topRight">
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    loading={state.idAdding === id}
                    onClick={() => {
                      if (getCurrentProductIds().includes(id)) {
                        Modal.confirm({
                          title: 'Please confirm before proceeding?',
                          icon: <QuestionCircleFilled />,
                          okText: 'Yes, Add Again',
                          cancelText: 'No',
                          content: (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: `The product with the name "<b>${record.name}</b>" already exist in this campaign. You want to add again?<br/>Please carefully review and verify the changes before proceeding to ensure accuracy and prevent potential errors.`
                              }}
                            />
                          ),
                          onOk: () => handleAddProduct(record)
                        })
                      } else {
                        handleAddProduct(record)
                      }
                    }}
                  >
                    Add This Product
                  </Button>
                </Tooltip>
              </Col>
            )}
            {state.dataResponse.suggested && (
              <>
                <Col>
                  <DeleteIcon
                    tooltip="Remove this recommendation"
                    icon={<ClearOutlined />}
                    loading={state.idDeleting === id}
                    title={`Sure to remove this product recommendation?`}
                    onClick={() => deleteListItem(id)}
                  />
                </Col>
              </>
            )}
          </Row>
        )
      }
    }
  ]

  const list = state.dataResponse?.list ?? []

  return (
    <>
      {!suggestionUI && <h2 className={'mb-4'}>Here are the available products</h2>}
      <Row gutter={[10, 10]} justify="space-between" align="middle" className="mb-4">
        <Col>
          <RefreshButton disabled={state.exporting} loading={state.fetching} onClick={() => getMainData()} />
        </Col>
        <Col span={24} md={12} xl={8}>
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
        </Col>
        <Col />
      </Row>

      <Table
        rowKey="id"
        size="small"
        className="mb-4"
        onChange={onTableChange}
        pagination={{
          ...defaultPaginationConfig,
          ...(suggestionUI ? { hideOnSinglePage: true } : {}),
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
    </>
  )
}

export default ListComponent
