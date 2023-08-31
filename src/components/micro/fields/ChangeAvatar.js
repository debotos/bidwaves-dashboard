import Axios from 'axios'
import ImgCrop from 'antd-img-crop'
import { useSafeState } from 'ahooks'
import { Upload, Button, Row, Avatar } from 'antd'
import { CloudUploadOutlined, UserOutlined } from '@ant-design/icons'

import { message } from 'App'
import handleError from 'helpers/handleError'

const ChangeAvatar = props => {
  const { user, getEndpoint, onFinish } = props
  const [imageUrl, setImageUrl] = useSafeState(user.image?.secure_url || null)
  const [uploading, setLoading] = useSafeState(false)

  const onChange = async image => {
    try {
      const isLt = image.size / 1024 / 1024 <= 1
      if (!isLt) {
        message.error(`${image.name}`)
        message.warning('Image size must be smaller than 1 MB', 6)
        return
      }
      setLoading(true)
      const formData = new FormData()
      formData.append('image', image)
      const { data } = await Axios.patch(getEndpoint(user.id) + '/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImageUrl(data.secure_url)
      window.log(`Update response -> `, data)
      message.success('Action successful.')
      onFinish?.(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Row justify="center" key={imageUrl || 'image-container'} className="mb-3">
        <Avatar
          size={134}
          alt={`Profile Avatar`}
          icon={<UserOutlined />}
          style={{ backgroundColor: '#C1C7D0' }}
          src={imageUrl}
        />
      </Row>

      <Row justify="center">
        <ImgCrop
          cropShape="round"
          rotationSlider
          showGrid
          showReset
          aspect={1 / 1}
          modalOk={`Crop`}
          modalCancel={`Cancel`}
          modalTitle={`Crop Image`}
        >
          <Upload
            disabled={uploading}
            accept=".jpg, .jpeg, .png"
            showUploadList={false}
            beforeUpload={file => {
              onChange(file)
              return false
            }} /* (false) To stop the default upload behavior */
          >
            <Button disabled={uploading} type="primary" icon={<CloudUploadOutlined />} loading={uploading}>
              {uploading ? 'Uploading...' : `Select image to ${imageUrl ? 'change' : 'upload'}`}
            </Button>
          </Upload>
        </ImgCrop>
      </Row>
    </>
  )
}

export default ChangeAvatar
