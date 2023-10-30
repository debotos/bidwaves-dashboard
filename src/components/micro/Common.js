import Fade from 'react-reveal/Fade'
import { Link } from 'react-router-dom'
import { Button, Empty, Popconfirm, Row, Spin, Tooltip } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelFilled,
  QuestionCircleOutlined,
  SettingOutlined,
  SyncOutlined
} from '@ant-design/icons'

import { links } from 'config/vars'

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
    disabled = false,
    size = 'small'
  } = props
  const btn = <Button loading={loading} disabled={disabled} danger size={size} icon={icon ?? <DeleteOutlined />} />
  return (
    <div onClick={e => e.stopPropagation()}>
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
    </div>
  )
}

export const ConfigButton = ({ title = 'Manage', viewIcon = false, ...restProps }) => {
  return (
    <Tooltip title={title}>
      <Button size="small" icon={viewIcon ? <EyeOutlined /> : <SettingOutlined />} {...restProps} />
    </Tooltip>
  )
}

export const ViewButton = ({ title = 'View to manage this campaign', label = 'View', ...restProps }) => {
  return (
    <Tooltip title={title} placement="left">
      <Button size="small" icon={<EyeOutlined />} {...restProps}>
        {label}
      </Button>
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

export const RefreshButton = ({ title = 'Refresh', label, ...restProps }) => {
  return (
    <Tooltip title={title}>
      <Button type="dashed" icon={<SyncOutlined />} {...restProps}>
        {label}
      </Button>
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

export const Logo = ({ light = false, width = 320, rowProps = {}, onClick }) => {
  return (
    <Row justify="center" className="my-4" {...rowProps}>
      <img
        className={onClick ? 'cursor-pointer' : ''}
        onClick={onClick}
        src={light ? '/bidwaves-logo-light.png' : '/bidwaves-logo-dark.png'}
        alt="BidWaves"
        width={width}
      />
    </Row>
  )
}

export const CalenderLink = ({
  label,
  href = links.calendar.to,
  qs = '',
  asBtn,
  btnProps = {},
  anchorClassName = 'within text-[--secondary-color]'
}) => {
  const path = href + qs

  if (asBtn) {
    return (
      <Link to={path} target="_blank" rel="noopener noreferrer">
        <Button shape="round" type="primary" size="large" className="" {...btnProps}>
          {label || 'Need Help?'}
        </Button>
      </Link>
    )
  }

  return (
    <a href={path} target="_blank" rel="noreferrer" className={`font-semibold ${anchorClassName || ''}`}>
      {label || 'Click here!'}
    </a>
  )
}
