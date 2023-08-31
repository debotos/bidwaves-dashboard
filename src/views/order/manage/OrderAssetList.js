import Axios from 'axios'
import { useRef } from 'react'
import Fade from 'react-reveal/Fade'
import { useLockFn, useMount, useSetState, useUnmount } from 'ahooks'
import { Button, Card, Col, Divider, List, Modal, Row, Table, Upload } from 'antd'
import { DeleteOutlined, LinkOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'

import { message } from 'App'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { DeleteIcon } from 'components/micro/Common'
import { getReadableFileSize, isEmpty } from 'helpers/utility'

export const getTableCols = config => {
  const { state, deleteListItem } = config || {}
  return [
    { title: 'Name', dataIndex: 'original_filename' },
    { title: 'Type', dataIndex: 'type' },
    {
      title: 'Size',
      dataIndex: 'bytes',
      sorter: (a, b) => a.bytes - b.bytes,
      render: val => getReadableFileSize(val ?? 0)
    },
    {
      width: 80,
      fixed: 'right',
      title: 'Action',
      align: 'center',
      dataIndex: 'action',
      render: (_, record) => {
        const { public_id } = record
        return (
          <Row justify="space-around">
            <Col>
              <Button size="small" icon={<LinkOutlined />} onClick={() => window.open(record.secure_url, '_blank')} />
            </Col>
            <Col>
              <DeleteIcon
                loading={state.idDeleting === public_id}
                title={`Sure to delete?`}
                onClick={() => deleteListItem(public_id)}
              />
            </Col>
          </Row>
        )
      }
    }
  ]
}

const maxCount = 10
function OrderAssetList({ order }) {
  const _isMounted = useRef(false)
  const [state, setState] = useSetState({
    assets: order.assets,
    uploading: false,
    idDeleting: null,
    addModal: false,
    dropzoneFiles: [],
    uploadingPercentage: 0
  })

  const orderEp = endpoints.order(order.id)

  useMount(() => {
    _isMounted.current = true
  })

  useUnmount(() => {
    _isMounted.current = false
  })

  const deleteListItem = async public_id => {
    try {
      _isMounted.current && setState({ idDeleting: public_id })
      const { data } = await Axios.delete(orderEp + `/asset/${public_id.replace(/\//g, '_SLASH_')}`)
      window.log(`Delete response -> `, data)
      message.success('Action successful.')
      setState(prevState => ({ ...prevState, assets: prevState.assets.filter(x => x.public_id !== public_id) }))
    } catch (error) {
      handleError(error, true)
    } finally {
      _isMounted.current && setState({ idDeleting: null })
    }
  }

  const handleUpload = async () => {
    try {
      _isMounted.current && setState({ uploading: true })
      const formData = new FormData()
      state.dropzoneFiles.forEach(file => formData.append('assets', file))
      const { data } = await Axios.post(orderEp + '/assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setState({ uploadingPercentage: percentCompleted })
        }
      })
      window.log('Assets upload response:', data)
      _isMounted.current &&
        setState(prevState => ({ ...prevState, assets: [...data.map(x => x.info), ...prevState.assets] }))
      _isMounted.current && setState({ uploadingPercentage: 0, dropzoneFiles: [], addModal: false })
      message.success('Upload successful!')
    } catch (error) {
      handleError(error, true)
    } finally {
      _isMounted.current && setState({ uploading: false })
    }
  }

  const columns = getTableCols({ state, setState, deleteListItem })
  const dropzoneEmpty = isEmpty(state.dropzoneFiles)
  const count = state.dropzoneFiles.length

  return (
    <>
      <Fade>
        <Card
          size="small"
          title="Assets (E.G. Photographs)"
          className="my-4"
          bodyStyle={{ padding: 0 }}
          extra={<Button size="small" icon={<PlusOutlined />} onClick={() => setState({ addModal: true })} />}
        >
          <Table
            rowKey="public_id"
            size="small"
            pagination={false}
            scroll={{ x: 'max-content' }}
            columns={columns}
            dataSource={state.assets}
          />
        </Card>
      </Fade>

      <Modal
        destroyOnClose
        title="Add Assets"
        open={state.addModal}
        footer={null}
        closable={!state.uploading}
        maskClosable={!state.uploading}
        onCancel={() => setState({ addModal: false })}
      >
        <div className="custom-dragger large mb-3 mt-4">
          <Upload.Dragger
            multiple
            fileList={[]}
            disabled={state.uploading || count === maxCount}
            itemRender={() => null}
            showUploadList={false}
            beforeUpload={() => false} /* To stop the default upload behavior */
            onChange={useLockFn(({ fileList }) => {
              if (count + fileList.length > maxCount) return message.warning(`Max ${maxCount} files can be selected!`)
              if (_isMounted.current) {
                setState(prevState => ({
                  ...prevState,
                  dropzoneFiles: [...fileList.map(x => x.originFileObj), ...prevState.dropzoneFiles]
                }))
              }
            })}
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt"
          >
            <div>
              <PlusOutlined />
              <div className="mt-2 px-10">Click or drag up to {maxCount} files to this area to upload.</div>
            </div>
          </Upload.Dragger>

          {!dropzoneEmpty && (
            <div className="mt-3">
              <Divider orientation="left">Selected {count} Files</Divider>
              <List
                size="small"
                bordered
                dataSource={state.dropzoneFiles}
                renderItem={(item, i) => (
                  <List.Item style={{ paddingRight: 0 }}>
                    <Row gutter={[10, 0]} style={{ width: '100%' }} align="middle" wrap={false}>
                      <Col flex={1} className="text-sm font-semibold">
                        {i + 1}. {item.name}
                      </Col>
                      <Col>
                        <Button
                          danger
                          size="small"
                          className="ml-auto"
                          icon={<DeleteOutlined />}
                          disabled={state.uploading}
                          onClick={() =>
                            setState(prevState => ({
                              ...prevState,
                              dropzoneFiles: prevState.dropzoneFiles.filter(x => x.uid !== item.uid)
                            }))
                          }
                        />
                      </Col>
                    </Row>
                  </List.Item>
                )}
              />
            </div>
          )}

          <Row justify="center" className="mt-4">
            <Button
              block
              type="primary"
              disabled={dropzoneEmpty}
              loading={state.uploading}
              icon={<UploadOutlined />}
              onClick={() => handleUpload()}
            >
              {state.uploading && state.uploadingPercentage
                ? `Uploading (${state.uploadingPercentage}%)`
                : 'Upload Files'}
            </Button>
          </Row>
        </div>
      </Modal>
    </>
  )
}

export default OrderAssetList
