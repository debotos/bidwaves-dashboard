import Axios from 'axios'
import React from 'react'
import { useSafeState, useSet, useUnmount } from 'ahooks'
import { Alert, Button, Checkbox, Col, Modal, Row, Upload, message } from 'antd'
import { CloudUploadOutlined, QuestionCircleOutlined } from '@ant-design/icons'

import handleError from 'helpers/handleError'
import { getBase64, isEmpty } from 'helpers/utility'

const getPhotosSkeletonObject = photos => {
  if (isEmpty(photos)) return []
  return photos.map((photo, index) => ({
    uid: photo.public_id || index,
    name: ``,
    status: 'done',
    url: photo.secure_url,
    public_id: photo.public_id
  }))
}

function CustomGraphics(props) {
  const { orderEp, order, product, asyncUpdateProduct } = props
  const { data_obj } = product || {}
  const { templates = [] } = data_obj || {}
  const [saving, setSaving] = useSafeState(false)
  const [preview, setPreview] = useSafeState(null)
  const [uploading, setUploading] = useSafeState(false)
  const [deletingId, setDeletingId] = useSafeState(null)
  const [set, { add, remove, reset }] = useSet([])
  const [selectedTemplate, { add: addTemplate, remove: removeTemplate, reset: resetTemplate }] = useSet([])
  const [fileList, setFileList] = useSafeState(getPhotosSkeletonObject(order.assets ?? []).reverse())
  const totalPhotos = fileList.length

  useUnmount(() => {
    resetTemplate()
    reset()
  })

  const handleSave = async () => {
    try {
      setSaving(true)
      let cms_graphics = []
      selectedTemplate.forEach(index => cms_graphics.push(templates[index]))
      const selectedCustomUploadsKeyArr = Array.from(set)
      const client_graphics = fileList.filter(x => selectedCustomUploadsKeyArr.includes(x.public_id))

      await asyncUpdateProduct(product.id, {
        submitted: true,
        data_obj: { ...(data_obj ?? {}), final_graphics: { cms_graphics, client_graphics } }
      })
    } finally {
      setSaving(false)
    }
  }

  const uploadImages = async images => {
    try {
      window.log('Uploading ->', images)
      setUploading(true)

      let error
      const formData = new FormData()

      images.forEach(image => {
        const isLt = image.size / 1024 / 1024 <= 10
        if (!isLt) {
          error = `Image "${image.name}" size must be smaller than 10 MB.`
        } else {
          formData.append('assets', image)
        }
      })

      if (error) return message.error(error, 6)

      const { data } = await Axios.post(orderEp + '/assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      window.log(`Upload response -> `, data)
      setFileList(prevList => {
        return [
          ...prevList.filter(x => x.status !== 'uploading'),
          ...getPhotosSkeletonObject(data.filter(x => x.success).map(y => y.info))
        ]
      })
      message.success('Upload successful.')
    } catch (error) {
      handleError(error, true)
    } finally {
      setUploading(false)
    }
  }

  const deleteImage = async public_id => {
    try {
      setDeletingId(public_id)
      const { data } = await Axios.delete(orderEp + `/asset/${encodeURIComponent(public_id)}`)
      window.log(`Delete response -> `, data)
      setFileList(prevList => prevList.filter(x => x.uid !== public_id))
      remove(public_id)
      message.success('Delete successful.')
    } catch (error) {
      handleError(error, true)
    } finally {
      setDeletingId(null)
    }
  }

  const handleChange = ({ fileList }) => {
    const newImages = fileList.filter(x => !x.status).map(y => y.originFileObj)
    let isSizeOk = true
    newImages.forEach(x => {
      const isLt10M = x.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error(`${x.name} size is grater than 10MB!`)
        isSizeOk = false
      }
    })
    if (!isSizeOk) return message.warn(`Image size must be smaller than 2MB!`, 6)
    setFileList(prevList => [...prevList, ...newImages.map(x => ({ ...x, status: 'uploading', percent: 100 }))])
    if (newImages.length > 0) uploadImages(newImages)
  }

  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreview({ url: file.url || file.preview, name: file.name || file.url.substring(file.url.lastIndexOf('/') + 1) })
  }

  const handleRemove = async file => {
    if (!file?.uid) return
    await deleteImage(file.uid)
  }

  const showConfirm = file => {
    return Modal.confirm({
      title: `Are you sure it's not associated?`,
      content: `Inside this campaign if this file is used in other places or associated with other products then those will be affect.`,
      icon: <QuestionCircleOutlined style={{ color: 'red' }} />,
      onOk: () => handleRemove(file),
      okType: 'danger',
      okText: 'Yes, Delete',
      cancelText: 'No'
    })
  }

  const totalSelected = set.size + selectedTemplate.size

  return (
    <>
      {data_obj.instruction_text && <p dangerouslySetInnerHTML={{ __html: data_obj.instruction_text }} />}

      {data_obj.cms_comment && <Alert className="mb-3" message={data_obj.cms_comment} type="info" showIcon />}

      {!isEmpty(templates) && (
        <>
          <h3 className="mb-3 text-lg font-bold">Selectable Templates From CMS</h3>
          <Row gutter={[16, 16]} className="mb-4">
            {templates.map((template, index) => {
              return (
                <Col key={index}>
                  <div>
                    <a href={template.url} target="_blank" rel="noreferrer">
                      <div className="relative h-28 w-28 cursor-pointer rounded-lg bg-gray-200">
                        <img src={template.url} className="absolute h-full w-full rounded-lg object-cover" />
                      </div>
                    </a>
                    <div className="mt-2 flex justify-center">
                      <Checkbox
                        disabled={product.common_disable}
                        defaultChecked={selectedTemplate.has(index)}
                        onChange={e => {
                          e.stopPropagation()
                          if (e.target.checked) {
                            addTemplate(index)
                          } else {
                            removeTemplate(index)
                          }
                        }}
                      />
                    </div>
                  </div>
                </Col>
              )
            })}
          </Row>
        </>
      )}

      <h3 className="mb-3 text-lg font-bold">Your Uploads{totalPhotos ? <> ({totalPhotos})</> : null}</h3>
      <Upload
        disabled={product.common_disable || uploading}
        accept=".jpg, .jpeg, .png"
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={showConfirm}
        progress={{ status: 'active', showInfo: false, strokeWidth: 6 }}
        beforeUpload={() => false} /* To stop the default upload behavior */
        itemRender={(originNode, file) => {
          const deleting = deletingId === file.uid
          return (
            <div>
              <div className={`h-28`}>{originNode}</div>
              {file.status !== 'uploading' && (
                <div className="mt-2 flex justify-center">
                  <Checkbox
                    disabled={deleting || product.common_disable}
                    defaultChecked={set.has(file.uid)}
                    onChange={e => {
                      e.stopPropagation()
                      if (e.target.checked) {
                        add(file.uid)
                      } else {
                        remove(file.uid)
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )
        }}
      >
        {fileList.length >= 30 ? null : (
          <div>
            <CloudUploadOutlined style={{ fontSize: 30 }} />
            <div className="mt-2 font-bold">Upload</div>
          </div>
        )}
      </Upload>

      <Row justify={`center mt-5 mb-2`}>
        <Button
          shape="round"
          type="primary"
          htmlType="button"
          size="large"
          className="cta-btn"
          disabled={product.common_disable || uploading || !totalSelected}
          loading={saving}
          onClick={handleSave}
        >
          I&apos;ve Selected {totalSelected ? totalSelected : ''}
        </Button>
      </Row>

      {data_obj.help_text && (
        <p className="text-center text-lg font-medium" dangerouslySetInnerHTML={{ __html: data_obj.help_text }} />
      )}

      <Modal
        style={{ top: 20 }}
        width="80%"
        open={!isEmpty(preview?.url)}
        title="Image Preview"
        footer={null}
        destroyOnClose
        onCancel={() => setPreview(null)}
      >
        {!isEmpty(preview?.url) && (
          <>
            <Row justify="center" align="middle">
              <img alt={preview.name} style={{ maxWidth: '100%', height: 'auto' }} src={preview.url} />
            </Row>
          </>
        )}
      </Modal>
    </>
  )
}

export default CustomGraphics
