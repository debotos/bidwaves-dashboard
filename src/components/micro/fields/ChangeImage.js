import ImgCrop from 'antd-img-crop'
import { useSafeState } from 'ahooks'
import { Image, Upload, Button, Row } from 'antd'

import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { getBase64, getFileObjForAjax } from 'helpers/utility'

export const ChangeImageInput = props => {
  const [imageUrl, setImageUrl] = useSafeState(props.value?.secure_url)
  const [loading, setLoading] = useSafeState(false)

  const onChange = async file => {
    setLoading(true)
    const base64 = await getBase64(file)
    setImageUrl(base64)
    const result = getFileObjForAjax(file, base64)
    props.onChange(result)
    setLoading(false)
  }

  const handleReset = e => {
    e.preventDefault()
    e.stopPropagation()
    props.onChange(undefined)
    setImageUrl(null)
  }

  return (
    <>
      {imageUrl ? (
        <div className="relative">
          <Image className="w-100 rounded-lg" src={imageUrl} />
          <Button
            size="small"
            shape="circle"
            danger
            className="absolute right-2 top-2"
            onClick={handleReset}
            icon={<CloseOutlined />}
          />
        </div>
      ) : (
        <Row className="w-100 custom-dragger">
          <ImgCrop
            cropShape="rect"
            rotationSlider
            showGrid
            showReset
            aspect={2 / 1}
            modalOk={`Crop`}
            modalCancel={`Cancel`}
            modalTitle={`Crop Image`}
          >
            <Upload.Dragger
              disabled={loading}
              accept=".jpg, .jpeg, .png"
              showUploadList={false}
              beforeUpload={file => {
                onChange(file)
                return false
              }} /* (false) To stop the default upload behavior */
            >
              <div>
                <PlusOutlined />
                <div className="mt-2 px-10">Drag and drop the image here.</div>
              </div>
            </Upload.Dragger>
          </ImgCrop>
        </Row>
      )}
    </>
  )
}
