import { FaUserCircle, FaCubes, FaRegCalendarAlt } from 'react-icons/fa'
import { LoginOutlined, UserAddOutlined, LockOutlined } from '@ant-design/icons'
import { MdCampaign } from 'react-icons/md'
import { BsCalculator } from 'react-icons/bs'

export const commonRoutes = {
  calculator: { to: '/', label: 'Calculator', icon: BsCalculator, iconSize: 22 },
  calendar: { to: '/calendar', label: 'Calendar', icon: FaRegCalendarAlt, iconSize: 22 }
}
export const privateRoutes = {
  orders: { to: '/campaigns', label: 'Campaigns', icon: MdCampaign, iconSize: 22 },
  products: { to: '/products', label: 'Products', icon: FaCubes, iconSize: 22 },
  profile: { to: '/profile', label: 'My Profile', icon: FaUserCircle, iconSize: 22, sidenav: false },
  private_calculator: { ...commonRoutes.calculator, label: 'PPC Calculator', to: '/calculator' }
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
