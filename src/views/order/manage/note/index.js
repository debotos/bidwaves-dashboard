import Axios from 'axios'
import Fade from 'react-reveal/Fade'
import { useRef, useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useLockFn, useMount, useSetState, useUnmount } from 'ahooks'
import { Affix, Card, Empty, Form, Modal, Pagination, Row, Space, Spin } from 'antd'

import { message } from 'App'
import endpoints from 'config/endpoints'
import Add, { getFormContent } from './Add'
import handleError from 'helpers/handleError'
import { ORDER_NOTE_FROM_TYPE } from 'config/keys'
import { DeleteIcon, EditButton, RefreshButton } from 'components/micro/Common'
import { defaultPaginationConfig, getLastAntdDrawerBody, isEmpty, readableTime } from 'helpers/utility'

function OrderNote({ order }) {
  const [form] = Form.useForm()
  const _isMounted = useRef(false)
  const [state, setState] = useSetState({
    idUpdating: null,
    editingItem: null,
    idDeleting: null,
    fetching: true,
    dataResponse: {},
    paginationCurrentPage: 1,
    paginationPageSize: defaultPaginationConfig.pageSizeOptions[0]
  })

  const noteBaseEp = endpoints.orderNoteBase(order.id)

  const getMainData = useLockFn(async config => {
    try {
      const { currentPage } = config || {}
      _isMounted.current && setState({ fetching: true })
      let _ep = noteBaseEp
      // For pagination | After this portion '?' is always present
      const page = currentPage || state.paginationCurrentPage
      const paginationQuery = `size=${state.paginationPageSize}&page=${page}`
      const paginationQueryPrefix = _ep.includes('?') ? '&' : '?'
      _ep += paginationQueryPrefix + paginationQuery

      const req = await Axios.get(_ep)
      const res = req.data
      window.log(`Notes response -> `, res)
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

  useMount(() => {
    _isMounted.current = true
    getMainData()
  })

  useUnmount(() => {
    _isMounted.current = false
  })

  const deleteListItem = async id => {
    try {
      _isMounted.current && setState({ idDeleting: id })
      const { data } = await Axios.delete(endpoints.orderNote(order.id, id))
      setState(prevState => ({
        ...prevState,
        dataResponse: { ...prevState.dataResponse, list: prevState.dataResponse.list.filter(x => x.id !== id) }
      }))
      window.log(`Delete response -> `, data)
      message.success('Action successful.')
    } catch (error) {
      handleError(error, true)
    } finally {
      _isMounted.current && setState({ idDeleting: null })
    }
  }

  const onEditFinish = async values => {
    try {
      const { id } = state.editingItem ?? {}
      if (!id) return
      _isMounted.current && setState({ idUpdating: id })
      const { data } = await Axios.patch(endpoints.orderNote(order.id, id), values)
      setState(prevState => ({
        ...prevState,
        dataResponse: {
          ...prevState.dataResponse,
          list: prevState.dataResponse.list.map(x => {
            if (x.id === id) return { ...x, ...data }
            return x
          })
        }
      }))
      window.log(`Update response -> `, data)
      message.success('Action successful.')
      setState({ editingItem: null })
    } catch (error) {
      handleError(error, true)
    } finally {
      _isMounted.current && setState({ idUpdating: null })
    }
  }

  const list = state.dataResponse?.list ?? []
  const noData = isEmpty(list)

  const paginationProps = {
    ...defaultPaginationConfig,
    total: state.dataResponse?.total ?? 0,
    current: state.paginationCurrentPage,
    pageSize: state.paginationPageSize,
    onChange: (page, pageSize) => {
      setState({ paginationCurrentPage: page, paginationPageSize: pageSize })
    }
  }

  const getMainContent = () => {
    if (state.fetching) {
      return (
        <Row justify="center" className="my-5">
          <Spin />
        </Row>
      )
    } else if (noData) {
      return <Empty className="mb-3" />
    } else {
      return (
        <Space direction="vertical" className="w-100">
          {list.map(item => {
            const csm = item.from === ORDER_NOTE_FROM_TYPE.CSM
            return (
              <Fade key={item.id}>
                <Card
                  size="small"
                  title={(csm ? item.from : 'You') + ' | ' + readableTime(item.createdAt, true)}
                  style={{ backgroundColor: csm ? 'beige' : '#edecff' }}
                  extra={
                    csm ? null : (
                      <Space>
                        <EditButton
                          onClick={() => {
                            form.setFieldsValue({ ...item })
                            setState({ editingItem: item })
                          }}
                        />
                        <DeleteIcon
                          loading={state.idDeleting === item.id}
                          title={`Sure to delete?`}
                          onClick={() => deleteListItem(item.id)}
                        />
                      </Space>
                    )
                  }
                >
                  <p className="mb-1 font-semibold">{item.title}</p>
                  <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: item.content }} />
                </Card>
              </Fade>
            )
          })}
        </Space>
      )
    }
  }

  return (
    <>
      <Affix target={() => getLastAntdDrawerBody()}>
        <Fade>
          <Card
            size="small"
            title="Notes"
            className="mt-2"
            extra={
              <Space>
                <RefreshButton size="small" loading={state.fetching} onClick={getMainData} />
                <Add
                  ep={noteBaseEp}
                  onFinish={data => {
                    setState(prevState => ({
                      ...prevState,
                      dataResponse: { ...prevState.dataResponse, list: [data, ...prevState.dataResponse.list] }
                    }))
                  }}
                />
              </Space>
            }
          >
            <PerfectScrollbar>
              <div className="flex flex-col" style={{ height: 'calc(100vh - 195px)' }}>
                <div className="flex-1 overflow-y-auto">{getMainContent()}</div>
              </div>
            </PerfectScrollbar>
            <Row justify="center" className="mt-3">
              <Pagination size="small" {...paginationProps} showSizeChanger={false} />
            </Row>
          </Card>
        </Fade>
      </Affix>

      <Modal
        destroyOnClose
        title="Update"
        open={!isEmpty(state.editingItem)}
        footer={null}
        onCancel={() => setState({ editingItem: null })}
        className="ant-modal-width-mid"
      >
        <Form form={form} layout="vertical" onFinish={onEditFinish}>
          {getFormContent({ loading: !!state.idUpdating })}
        </Form>
      </Modal>
    </>
  )
}

export default OrderNote
