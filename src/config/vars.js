import { MdCampaign } from 'react-icons/md'
import { BsCalculator } from 'react-icons/bs'
import { FaUserCircle, FaRegCalendarAlt, FaCheckCircle } from 'react-icons/fa'
import { LoginOutlined, UserAddOutlined, LockOutlined, PlusOutlined, LineChartOutlined } from '@ant-design/icons'

export const commonRoutes = {
  calculator: { to: '/', label: 'Calculator', icon: BsCalculator, iconSize: 22 },
  calendar: { to: '/calendar', label: 'Calendar', icon: FaRegCalendarAlt, iconSize: 22 }
}
export const privateRoutes = {
  orders: { to: '/campaigns', label: 'Campaigns', icon: MdCampaign, iconSize: 22 },
  stats: {
    to: '/stats',
    label: 'Statistics & Reports',
    icon: LineChartOutlined,
    iconSize: 22,
    sidenav: user => !!user?.stats_iframe_url
  },
  private_calculator: {
    ...commonRoutes.calculator,
    label: 'New Campaign',
    to: '/calculator',
    icon: PlusOutlined,
    iconSize: 20
  },
  profile: { to: '/profile', label: 'My Profile', icon: FaUserCircle, iconSize: 22, sidenav: false },
  paymentSuccess: {
    to: '/payment-success',
    label: 'Payment Success',
    icon: FaCheckCircle,
    iconSize: 22,
    sidenav: false
  }
}
export const publicRoutes = {
  login: { to: '/sign-in', label: 'Login', icon: LoginOutlined },
  register: { to: '/sign-up', label: 'Sign Up', icon: UserAddOutlined },
  forgotPassword: { to: '/forgot-password', label: 'Forgot Password', icon: LockOutlined },
  resetPassword: { to: '/reset-password', label: 'Reset Password', icon: LockOutlined }
}

export const links = {
  ...privateRoutes,
  ...publicRoutes,
  ...commonRoutes
}

export const LOCAL_CHANNELS = {
  RELOAD: 'RELOAD'
}

const vars = {
  links
}

export default vars
