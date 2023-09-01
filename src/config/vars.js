import { FaUserCircle, FaCubes, FaShoppingCart } from 'react-icons/fa'
import { LoginOutlined, UserAddOutlined, LockOutlined } from '@ant-design/icons'

export const privateRoutes = {
  orders: { to: '/', label: 'Orders', icon: FaShoppingCart, iconSize: 22 },
  products: { to: '/products', label: 'Products', icon: FaCubes, iconSize: 22 },
  profile: { to: '/profile', label: 'My Profile', icon: FaUserCircle, iconSize: 22, sidenav: false }
}
export const publicRoutes = {
  login: { to: '/sign-in', label: 'Login', icon: LoginOutlined },
  register: { to: '/sign-up', label: 'Sign Up', icon: UserAddOutlined },
  forgotPassword: { to: '/forgot-password', label: 'Forgot Password', icon: LockOutlined },
  resetPassword: { to: '/reset-password', label: 'Reset Password', icon: LockOutlined }
}

export const LOCAL_CHANNELS = {
  RELOAD: 'RELOAD'
}

export const links = {
  ...privateRoutes,
  ...publicRoutes,
  LOCAL_CHANNELS
}

const vars = {
  links
}

export default vars
