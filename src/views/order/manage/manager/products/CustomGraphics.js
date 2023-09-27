import Axios from 'axios'
import React from 'react'
import Fade from 'react-reveal/Fade'
import { useSafeState } from 'ahooks'
import { Alert, Button, Checkbox, Modal, Row, Upload, message } from 'antd'
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
    isFeature: !!photo.isFeature,
    public_id: photo.public_id
  }))
}

function CustomGraphics(props) {
  const { orderEp, order, product, asyncUpdateProduct } = props
  const { data_obj } = product || {}
  const [saving, setSaving] = useSafeState(false)
  const [preview, setPreview] = useSafeState(null)
  const [uploading, setUploading] = useSafeState(false)
  const [deletingId, setDeletingId] = useSafeState(null)
  const [fileList, setFileList] = useSafeState(getPhotosSkeletonObject(order.assets ?? []).reverse())
  const totalPhotos = fileList.length

  const handleSave = async values => {
    try {
      setSaving(true)
      await asyncUpdateProduct(product.id, { submitted: true, data_obj: { ...data_obj, ...values } })
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
        }
      })

      if (error) return message.error(error, 6)

      formData.append('assets', images)
      const { data } = await Axios.post(orderEp + '/assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      window.log(`Upload response -> `, data)
      setFileList(prevList => {
        return [...prevList.filter(x => x.status !== 'uploading'), ...getPhotosSkeletonObject(data)]
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
      message.loading('Deleting file...', 0)
      const { data } = await Axios.delete(orderEp + `/asset/${public_id}`)
      window.log(`Delete response -> `, data)
      setFileList(prevList => prevList.filter(x => x.uid !== deletingId))
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
    if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj)
    setPreview({ name: file.url || file.preview, url: file.name || file.url.substring(file.url.lastIndexOf('/') + 1) })
  }

  const handleRemove = file => {
    if (!file?.uid) return
    deleteImage(file.uid)
  }

  const showConfirm = file => {
    confirm({
      title: 'Are you sure?',
      icon: <QuestionCircleOutlined style={{ color: 'red' }} />,
      onOk: () => handleRemove(file),
      okType: 'danger',
      okText: 'Yes, Delete',
      cancelText: 'No'
    })
  }

  return (
    <>
      {data_obj.instruction_text && <p dangerouslySetInnerHTML={{ __html: data_obj.instruction_text }} />}

      {data_obj.cms_comment && <Alert className="mb-3" message={data_obj.cms_comment} type="info" showIcon />}

      {totalPhotos ? <h3 className="mb-3 text-lg font-bold">Total ({totalPhotos})</h3> : null}

      <Upload
        disabled={uploading}
        accept=".jpg, .jpeg, .png"
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={showConfirm}
        progress={{ status: 'active', showInfo: false, strokeWidth: 6 }}
        beforeUpload={() => false} /* To stop the default upload behavior */
        itemRender={(originNode, file) => {
          return (
            <div>
              <div style={{ width: 104, height: 104 }}>{originNode}</div>
              {file.status !== 'uploading' && (
                <Row justify="center" className="mt-2">
                  <Checkbox disabled={deletingId === file.uid} />
                </Row>
              )}
            </div>
          )
        }}
      >
        <div>
          <CloudUploadOutlined style={{ fontSize: 30 }} />
          <div className="mt-2 font-bold">Upload</div>
        </div>
      </Upload>

      <Row justify={`center mb-2`}>
        <Button
          shape="round"
          type="primary"
          htmlType="button"
          size="large"
          className="cta-btn"
          disabled={product.common_disable}
          loading={saving}
          onClick={handleSave}
        >
          I&apos;ve Done It
        </Button>
      </Row>

      {data_obj.help_text && (
        <p className="text-center text-lg font-medium" dangerouslySetInnerHTML={{ __html: data_obj.help_text }} />
      )}

      <Modal width="80%" open={!isEmpty(preview)} title="Image Preview" footer={null} onCancel={() => setPreview(null)}>
        {!isEmpty(preview) && (
          <Fade>
            <Row justify="center" align="middle">
              <img alt={preview.name} style={{ maxWidth: '100%', height: 'auto' }} src={preview.url} />
            </Row>
          </Fade>
        )}
      </Modal>
    </>
  )
}

export default CustomGraphics
