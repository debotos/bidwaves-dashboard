import Fade from 'react-reveal/Fade'
import { Button, Empty, Popconfirm, Row, Spin, Tooltip } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  FileExcelFilled,
  QuestionCircleOutlined,
  SettingOutlined,
  SyncOutlined
} from '@ant-design/icons'

export const Page = ({ children, ...rest }) => {
  return <Fade {...rest}>{children}</Fade>
}

export const DeleteIcon = props => {
  const {
    title = 'Are you sure?',
    onClick,
    loading = false,
    icon,
    placement = 'left',
    tooltip,
    disabled = false
  } = props
  const btn = <Button loading={loading} disabled={disabled} danger size="small" icon={icon ?? <DeleteOutlined />} />
  return (
    <Popconfirm
      icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
      title={title}
      placement={placement}
      okText="Yes"
      cancelText="No"
      onConfirm={onClick}
      disabled={loading || disabled}
    >
      {tooltip ? (
        <Tooltip placement={placement} title={tooltip}>
          {btn}
        </Tooltip>
      ) : (
        btn
      )}
    </Popconfirm>
  )
}

export const ConfigButton = ({ title = 'Manage', ...restProps }) => {
  return (
    <Tooltip title={title}>
      <Button size="small" icon={<SettingOutlined />} {...restProps} />
    </Tooltip>
  )
}

export const EditButton = ({ title = 'Edit', ...restProps }) => {
  return (
    <Tooltip title={restProps.disabled ? '' : title}>
      <Button size="small" icon={<EditOutlined />} {...restProps} />
    </Tooltip>
  )
}

export const ExportButton = ({ title = 'Export', ...restProps }) => {
  return (
    <Tooltip title={title}>
      <Button type="dashed" icon={<FileExcelFilled />} {...restProps} />
    </Tooltip>
  )
}

export const RefreshButton = ({ title = 'Refresh', ...restProps }) => {
  return (
    <Tooltip title={title}>
      <Button type="dashed" icon={<SyncOutlined />} {...restProps} />
    </Tooltip>
  )
}

export const NoResultUI = ({ msg = 'No result found!' }) => (
  <Empty className="mt-5" image={Empty.PRESENTED_IMAGE_SIMPLE} description={msg} />
)

export const loadableOptions = {
  fallback: (
    <Row justify="center" className="w-100 my-5">
      <Spin tip="Loading Component..." />
    </Row>
  )
}

export const Logo = ({ light = false, width = 320, rowProps = {} }) => {
  return (
    <Row justify="center" className="my-4" {...rowProps}>
      <img src={light ? '/bidwaves-logo-light.png' : '/bidwaves-logo-dark.png'} alt="Bidwaves" width={width} />
    </Row>
  )
}
