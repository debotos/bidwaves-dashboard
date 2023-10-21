import he from 'he'
import moment from 'moment'
import { htmlToText } from 'html-to-text'
import { Alert, Button, Input, Modal, Popover, Result, Row, Select, Spin, Tag } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleTwoTone,
  ReloadOutlined,
  SyncOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons'

import keys from 'config/keys'

// Check empty
export const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0)

export const getCssVar = (name, dom = document.documentElement) => {
  return getComputedStyle(dom).getPropertyValue(`--${name}`).trim()
}

export const getAllCssVars = () => ({
  primaryColor: getCssVar('primary-color'),
  secondaryColor: getCssVar('secondary-color'),
  infoColor: getCssVar('info-color'),
  successColor: getCssVar('success-color'),
  warnColor: getCssVar('warning-color'),
  dangerColor: getCssVar('danger-color'),
  textColor: getCssVar('main-text-color'),
  bodyBgColor: getCssVar('body-bg-color'),
  mainFontFamily: getCssVar('main-font'),
  baseFontSize: +(getCssVar('base-font-size')?.replace('px', '') ?? 14),
  baseBorderRadius: +(getCssVar('base-border-radius')?.replace('px', '') ?? 5)
})

export const breakpoints = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px'
}

export const isMobile = () => window.matchMedia(`(max-width: ${breakpoints.md})`).matches

export const isObject = val => typeof val === 'object' && !Array.isArray(val) && val !== null

export const renderLoading = ({ size = '', tip = '', className = '' } = {}) => {
  return (
    <Row justify="center" className={className}>
      <Spin size={size} tip={tip || undefined} />
    </Row>
  )
}

export const showConfirm = (callback, title = 'Are you sure about this action?', desc = '', okType = 'danger') => {
  confirm({
    title,
    icon: <QuestionCircleTwoTone />,
    content: desc,
    onOk: () => callback(),
    okText: 'Yes',
    okType
  })
}

export const getErrorAlert = ({ msg, className = 'mt-3', onRetry, fullScreen = false }) => {
  const alert = (
    <Alert
      className={fullScreen ? '' : className}
      message={msg || 'Something went wrong. Try again!'}
      showIcon
      type="error"
      action={
        onRetry ? (
          <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
            Try Again
          </Button>
        ) : undefined
      }
    />
  )

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="mx-3 mb-5 w-full max-w-xl">{alert}</div>
      </div>
    )
  }

  return alert
}

export const isScript = input =>
  input.includes('&lt;script&gt;') ||
  input.includes('&lt;/script&gt;') ||
  input.includes('<script>') ||
  input.includes('</script>')

export const truncate = (_input = '', title, length = 5, tooltip = true) => {
  const input = _input ?? ''
  const val = he.decode(htmlToText(input.substring(0, length), { wordwrap: 130 }))
  return input.length > length ? (
    tooltip ? (
      <Popover
        title={title}
        content={
          isScript(input) ? (
            <strong style={{ color: 'tomato' }}>Quick view is unavailable as it&apos;s contain JavaScript.</strong>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: input }} />
          )
        }
        overlayInnerStyle={{ maxWidth: 450, maxHeight: 400, overflowY: 'scroll' }}
      >
        {val}...
      </Popover>
    ) : (
      `${val}...`
    )
  ) : (
    input
  )
}

export const readableTime = (value, full = false) =>
  moment(value).format(full ? 'MMM DD, YYYY ddd h:mm A' : 'ddd, MMM Do YY')
export const readableDate = value => moment(value).format('MMM Do YY')

export const basePasswordRule = {
  required: true,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/,
  message: 'Password minimum length is 10. Including one uppercase, lowercase, number and special character.'
}

const pageSizeOptions = [5, 10, 50, 100, 250]
export const defaultPaginationConfig = {
  showSizeChanger: true,
  defaultPageSize: pageSizeOptions[0],
  hideOnSinglePage: false,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  pageSizeOptions
}

export const renderBoolTag = (value, successColor = getCssVar('primary-color')) => {
  if (value) {
    return (
      <Tag className="m-0" color={successColor} style={{ minWidth: 30 }}>
        Yes
      </Tag>
    )
  }
  return (
    <Tag className="m-0" color="red" style={{ minWidth: 35 }}>
      No
    </Tag>
  )
}

export const commonBoolColProps = dataIndex => ({
  dataIndex,
  align: 'center',
  width: 60,
  render: val => renderBoolTag(val)
})

export const getOrderStatusTag = (status, record, className = '') => {
  if (record.complete) {
    return (
      <Tag className={className} color={getCssVar('success-color')} icon={<CheckCircleOutlined />}>
        Complete
      </Tag>
    )
  }

  if (!status) return null

  switch (status) {
    case keys.ORDER_STATUS.CANCELLED:
      return (
        <Tag className={className} icon={<CloseCircleOutlined />} color="error">
          {status}
        </Tag>
      )

    case keys.ORDER_STATUS.PROGRESS:
      return (
        <Tag className={className} icon={<SyncOutlined spin />} color="processing">
          {status}
        </Tag>
      )

    case keys.ORDER_STATUS.WAITING:
      return (
        <Tag className={className} icon={<ClockCircleOutlined />} color="cyan">
          {status}
        </Tag>
      )

    case keys.ORDER_STATUS.REFUNDING:
      return (
        <Tag className={className} icon={<ExclamationCircleOutlined />} color="warning">
          {status}
        </Tag>
      )

    case keys.ORDER_STATUS.AWAITING_PAYMENT:
      return (
        <Tag className={className} icon={<ClockCircleOutlined />} color="warning">
          {status}
        </Tag>
      )

    case keys.ORDER_STATUS.ALL_GOOD:
    case keys.ORDER_STATUS.RUNNING:
      return (
        <Tag className={className} icon={<CheckCircleOutlined />} color="success">
          {status}
        </Tag>
      )

    default:
      return (
        <Tag className={className} color="default">
          {status}
        </Tag>
      )
  }
}

export const getOrderStatusColProps = dataIndex => {
  return {
    dataIndex,
    align: 'center',
    width: 60,
    render: (val, record) => getOrderStatusTag(val, record)
  }
}

export const getActiveColumn = (props = {}) => {
  return { title: 'Active', fixed: 'left', ...commonBoolColProps('active'), ...props }
}

export const removeLocalValues = (_values = {}) => {
  const values = { ..._values }
  if (isEmpty(values)) return values

  Object.keys(values).forEach(key => {
    if (key.startsWith(keys.LOCAL_PREFIX)) delete values[key]
  })

  return values
}

// Artificially wait
export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Get base64 of a file
export const getBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

export const getReadableSize = size => {
  let _size = size
  const fSExt = ['Bytes', 'KB', 'MB', 'GB']
  let i = 0

  while (_size > 900) {
    _size /= 1024
    i++
  }

  const exactSize = Math.round(_size * 100) / 100 + ' ' + fSExt[i]
  return exactSize
}
export const isNewFileSelected = file => file && typeof file === 'object' && !file.secure_url

export const getSizeFromBase64 = base64String => {
  // Without 'data:image/png;base64,' part
  const stringLength = base64String.length
  const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812
  return sizeInBytes
}

const getBase64Prefix = type => `data:${type};base64,`
const commonImageTypes = ['png', 'jpeg', 'gif', 'apng', 'avif', 'webp', 'svg+xml']
export const cleanBase64ForAjax = (data, type, fileType = 'image/') => {
  let _data = data
  commonImageTypes.forEach(__type => {
    _data = _data.replace(getBase64Prefix(`${fileType}${__type}`), '')
  })
  if (type) {
    _data = _data.replace(getBase64Prefix(type), '')
  }
  // For unknown type
  _data = _data.replace(getBase64Prefix(`application/octet-stream`), '')
  return _data
}
export const getUploadedFileObjForAjax = (file, data) => {
  const type = file.type
  const _data = cleanBase64ForAjax(data, type)

  return {
    name: file.filename,
    size: getSizeFromBase64(_data),
    type,
    data: _data
  }
}
const plainTxtType = 'text/plain'
const txtExtension = '.txt'
export const getFileObjForAjax = (file, data, needClean = true) => {
  const type = file.type || plainTxtType
  const suffix = type === plainTxtType && !file.name?.endsWith?.(txtExtension) ? txtExtension : ''
  return {
    name: (file.name || file.filename) + suffix,
    size: file.size,
    type,
    data: needClean ? cleanBase64ForAjax(data, type) : data
  }
}

export const getReadableCurrency = (value, config) => {
  const { showUnlimited } = config || {}
  if (isEmpty(value) && showUnlimited) return `Unlimited`
  return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const getReadableFileSize = size => {
  let _size = size
  const fSExt = ['Bytes', 'KB', 'MB', 'GB']
  let i = 0

  while (_size > 900) {
    _size /= 1024
    i++
  }

  const exactSize = Math.round(_size * 100) / 100 + ' ' + fSExt[i]
  return exactSize
}

export const getLastAntdDrawerBody = () => {
  const arr = document.querySelectorAll('.ant-drawer-body')
  if (isEmpty(arr)) return null
  return arr[arr.length - 1]
}

export const checkHasError = form => !!form.getFieldsError().filter(({ errors }) => errors.length).length

function isValidUrl(url) {
  try {
    const _url = new URL(url)
    return [true, _url]
  } catch (error) {
    return [false, {}]
  }
}

const urlRegex =
  /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/

export const validateUrl = (rule, value) => {
  return new Promise((resolve, reject) => {
    if (!value) {
      resolve()
    } else {
      const [valid, url] = isValidUrl(value)
      if (valid && urlRegex.test(value) && (url.protocol === 'http:' || url.protocol === 'https:')) {
        resolve()
      } else {
        reject('Must be a valid URL with a scheme matching the http or https pattern')
      }
    }
  })
}

export const showResultModal = ({ status = 'success', title = 'Successful!', subTitle } = {}) => {
  Modal.success({
    className: 'full-width',
    centered: true,
    closable: true,
    footer: null,
    icon: null,
    maskClosable: true,
    content: <Result status={status} title={title} subTitle={subTitle} />
  })
}

export const antdPreviewCommonProps = {
  icons: {
    left: null,
    right: null,
    flipX: null,
    flipY: null,
    rotateLeft: null,
    rotateRight: null,
    zoomIn: <ZoomInOutlined />,
    zoomOut: <ZoomOutOutlined />,
    close: <CloseCircleOutlined />
  }
}

export const getPlaceholderInput = (props = {}) => {
  return <Input disabled={true} {...props} />
}

export const UrlInputAddonBefore = (
  <Select defaultValue="http://">
    <Select.Option value="http://">http://</Select.Option>
    <Select.Option value="https://">https://</Select.Option>
  </Select>
)

/**
 * Get all the URL parameters
 * @param  {String} search  window.location.search
 * @return {Object}         The URL parameters
 */
export const getAllQueryVariables = function (search, log = false) {
  const params = new URLSearchParams(search)
  let paramObj = {}
  for (var value of params.keys()) {
    paramObj[value] = params.get(value)
  }
  delete paramObj.refresh // It's for app refresh only
  if (log) console.log('Query variables: ', paramObj)

  return paramObj
}

// Function to reload the page when it becomes visible
export function reloadOnVisibility() {
  if (document.hidden) {
    // Page is not visible, schedule another check
    requestAnimationFrame(reloadOnVisibility)
  } else {
    setTimeout(() => {
      const timestamp = Date.now()
      let newUrl = window.location.origin + window.location.pathname
      const queryVars = getAllQueryVariables(window.location.search)
      for (let [index, key] of Object.keys(queryVars).entries()) {
        const val = queryVars[key]
        if (index === 0) {
          newUrl += `?${key}=${val}`
        } else {
          newUrl += `&${key}=${val}`
        }
      }
      const and = newUrl.includes('?') ? '&' : '?'
      window.location.replace(`${newUrl}${and}refresh=${timestamp}`)
    }, 200)
  }
}
