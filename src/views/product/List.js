import React from 'react'
import Axios from 'axios'
// import { FaLink } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { useRef, useEffect } from 'react'
import { Row, Col, Input, Table, Dropdown, Image, Button, Modal, Space } from 'antd'
import { useDebounceFn, useSetState, useLockFn, useMount, useUnmount } from 'ahooks'
import {
  CaretDownFilled,
  ClearOutlined,
  EyeOutlined,
  FileImageOutlined,
  SearchOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons'

import { message } from 'App'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import CheckoutForm from 'components/micro/CheckoutForm'
import { DeleteIcon, RefreshButton } from 'components/micro/Common'
import {
  defaultPaginationConfig,
  // readableTime,
  // truncate,
  getReadableCurrency,
  isEmpty,
  showResultModal,
  antdPreviewCommonProps,
  renderBoolTag,
  getCssVar
} from 'helpers/utility'
import keys from 'config/keys'

const searchableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' }
]
const defaultSearchField = searchableColumns[0].key

function ListComponent() {
  const _isMounted = useRef(false)
  const { user } = useSelector(state => state.auth)
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
    checkoutProduct: null,
    idOrdering: null,
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
      let _ep = endpoints.client(user.id) + '/product-suggestion'
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

  const handleCreateOrder = async (payment, productInfo) => {
    try {
      const { id: productId } = productInfo
      _isMounted.current && setState({ checkoutProduct: null, idOrdering: productId })
      const postData = { clientId: user.id, productId, paymentId: payment.id }
      const { data } = await Axios.post(endpoints.orderBase, postData)
      window.log(`Order response -> `, data)
      localStorage.removeItem(keys.PENDING_CREATE_CAMPAIGN_DATA)
      _isMounted.current && setState({ viewingProduct: null })
      showResultModal({ subTitle: 'Please check Orders page.' })
      getMainData()
    } catch (error) {
      handleError(error, true)
    } finally {
      _isMounted.current && setState({ idOrdering: null })
    }
  }

  const deleteListItem = async id => {
    try {
      _isMounted.current && setState({ idDeleting: id })
      const req = await Axios.delete(endpoints.client(user.id) + `/product-suggestion/${id}`)
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

  const updateProductView = async id => {
    try {
      if (!id) return
      await Axios.patch(endpoints.product(id) + '/views')
    } catch (error) {
      console.log(error)
    }
  }

  const columns = [
    {
      title: <FileImageOutlined />,
      dataIndex: 'image',
      fixed: 'left',
      render: value => {
        const url = value?.secure_url
        if (!url) return null
        return <Image src={url} className="rounded" width={50} height={30} preview={antdPreviewCommonProps} />
      },
      align: 'center',
      width: 60
    },
    { title: 'Name', dataIndex: 'name', sorter: true },
    { title: 'Price', dataIndex: 'price', sorter: true, render: text => getReadableCurrency(Number(text)) },
    { title: 'DA', dataIndex: 'da', sorter: true },
    { title: 'Indexed', dataIndex: 'indexed', sorter: true },
    { title: 'DoFollow', dataIndex: 'do_follow', sorter: true },
    { title: 'Publishing Time', dataIndex: 'publishing_time', sorter: false },
    { title: 'Sponsored', dataIndex: 'sponsored', sorter: true },
    { title: 'Image', dataIndex: 'image_text', sorter: true },
    { title: 'Genre', dataIndex: 'genre', sorter: true },
    { title: 'Region/Location', dataIndex: 'location', sorter: true },
    // { title: 'Description', dataIndex: 'description', render: text => truncate(text, 'Description', 80) },
    // { title: 'Added', dataIndex: 'createdAt', width: 140, render: value => readableTime(value), sorter: true },
    // { title: 'Last Updated', dataIndex: 'updatedAt', width: 140, render: value => readableTime(value), sorter: true },
    // {
    //   title: 'DocuSign Link',
    //   dataIndex: 'docusign_link',
    //   width: 120,
    //   align: 'center',
    //   render: value =>
    //     value ? <Button size="small" icon={<FaLink />} onClick={() => window.open(value, '_blank')} /> : null,
    //   sorter: false
    // },
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
            <Col>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => {
                  updateProductView(id)
                  setState({ viewingProduct: record })
                }}
              >
                View
              </Button>
            </Col>

            {state.dataResponse.suggested && (
              <Col>
                <DeleteIcon
                  tooltip="Remove Recommendation"
                  icon={<ClearOutlined />}
                  loading={state.idDeleting === id}
                  title={`Sure to remove this product recommendation?`}
                  onClick={() => deleteListItem(id)}
                />
              </Col>
            )}
          </Row>
        )
      }
    }
  ]

  const renderProductInfo = product => {
    if (!product) return null
    // const cSpace = {
    //   align: 'start',
    //   direction: 'horizontal',
    //   size: 'large',
    //   split: <Divider type="vertical" />,
    //   wrap: true
    // }
    const items = [
      // {
      //   inner: true,
      //   space: cSpace,
      //   children: [
      //     { title: 'Indexed', key: 'indexed', bool: true },
      //     { title: 'Sponsored', key: 'sponsored', bool: true },
      //     { title: 'DoFollow', key: 'do_follow', bool: true }
      //   ]
      // },
      { title: 'Description', key: 'description' },
      {
        title: 'Example Link',
        key: 'example_link',
        render: value => (
          <a href={value} target="_blank" rel="noreferrer">
            {value}
          </a>
        )
      },
      { title: 'DA', key: 'da' },
      { title: 'Genre', key: 'genre' },
      { title: 'Publishing Time', key: 'publishing_time' },
      { title: 'Image', key: 'image_text' },
      { title: 'Indexed', key: 'indexed' },
      { title: 'Sponsored', key: 'sponsored' },
      { title: 'DoFollow', key: 'do_follow' },
      { title: 'Region/Location', key: 'location' },
      { title: 'Price', key: 'price', render: value => getReadableCurrency(Number(value)) }
    ]

    const renderItem = item => {
      const value = product[item.key]
      if (isEmpty(value)) return null
      return (
        <Space direction="vertical" size={2}>
          <h4 className="m-0 font-semibold">{item.title}</h4>
          {item.bool ? (
            renderBoolTag(value, getCssVar('success-color'))
          ) : item.render ? (
            item.render(value)
          ) : (
            <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: value ?? '' }} />
          )}
        </Space>
      )
    }

    return (
      <Space direction="vertical" size="large">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {item.inner ? (
              <Space {...item.space}>
                {item.children.map((item, i) => (
                  <React.Fragment key={i}>{renderItem(item)}</React.Fragment>
                ))}
              </Space>
            ) : (
              renderItem(item)
            )}
          </React.Fragment>
        ))}
      </Space>
    )
  }

  const list = state.dataResponse?.list ?? []
  const buying = state.idOrdering === state.viewingProduct?.id

  return (
    <>
      <h2 className={state.dataResponse.suggested ? 'mb-1' : 'mb-4'}>Here Are The Available Options You Can Buy</h2>
      {state.dataResponse.suggested && (
        <p className="mb-4">Your CSM has curated a list of press that you are eligible for:</p>
      )}
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
        size="middle"
        className="mb-4"
        onChange={onTableChange}
        pagination={{
          ...defaultPaginationConfig,
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

      <Modal
        destroyOnClose
        title="Buy"
        maskClosable={false}
        open={!isEmpty(state.checkoutProduct)}
        footer={null}
        onCancel={() => setState({ checkoutProduct: null })}
      >
        <CheckoutForm
          product={state.checkoutProduct}
          onComplete={paymentInfo => handleCreateOrder(paymentInfo, state.checkoutProduct)}
        />
      </Modal>

      <Modal
        destroyOnClose
        title={null}
        open={!isEmpty(state.viewingProduct)}
        okText={state.viewingProduct ? `Pay ${getReadableCurrency(Number(state.viewingProduct.price))}` : 'Buy'}
        width={`90%`}
        closable={!buying}
        maskClosable={!buying}
        onCancel={() => setState({ viewingProduct: null })}
        onOk={() => setState({ checkoutProduct: state.viewingProduct })}
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ icon: <ShoppingCartOutlined />, loading: buying }}
        bodyStyle={{ paddingTop: 6 }}
      >
        {state.viewingProduct && (
          <Row gutter={[20, 16]}>
            <Col span={24} lg={6}>
              <Image
                src={state.viewingProduct.image?.secure_url}
                className="rounded"
                width={`100%`}
                preview={antdPreviewCommonProps}
              />
              {/* <Space direction="vertical" size={0} className="mt-3">
                <h4 className="m-0 font-semibold">Price</h4>
                <p className="m-0 font-bold">{getReadableCurrency(state.viewingProduct.price)}</p>
              </Space> */}
            </Col>
            <Col span={24} lg={18}>
              <h1 style={{ color: getCssVar('primary-color') }}>{state.viewingProduct?.name}</h1>
              {renderProductInfo(state.viewingProduct)}
            </Col>
          </Row>
        )}
      </Modal>
    </>
  )
}

export default ListComponent
