// eslint-disable-next-line no-undef
export const API_ENDPOINT_BASE = process.env.REACT_APP_API_ENDPOINT_BASE
export const API_ENDPOINT_PREFIX = `${API_ENDPOINT_BASE}/api`

const CLIENT_TYPE = `client`
export default {
  login: `${API_ENDPOINT_PREFIX}/auth/${CLIENT_TYPE}/login`,
  signup: `${API_ENDPOINT_PREFIX}/auth/${CLIENT_TYPE}/register`,
  passwordForgot: `${API_ENDPOINT_PREFIX}/auth/${CLIENT_TYPE}/password/forgot`,
  clientBase: `${API_ENDPOINT_PREFIX}/${CLIENT_TYPE}`,
  // Info
  info: `${API_ENDPOINT_PREFIX}/info`,
  // Client
  client: function (id) {
    return `${this.clientBase}/${id}`
  },
  changeClientPassword: function (id) {
    return `${this.client(id)}/password/change`
  },
  registerClient: `${API_ENDPOINT_PREFIX}/auth/${CLIENT_TYPE}/register`,
  // Advertisement
  advertisementBase: `${API_ENDPOINT_PREFIX}/advertisement`,
  advertisement: function (id) {
    return `${this.advertisementBase}/${id}`
  },
  // Industry
  industryBase: `${API_ENDPOINT_PREFIX}/industry`,
  industry: function (id) {
    return `${this.industryBase}/${id}`
  },
  // Budget
  budgetBase: `${API_ENDPOINT_PREFIX}/budget`,
  budget: function (id) {
    return `${this.budgetBase}/${id}`
  },
  // Product
  productBase: `${API_ENDPOINT_PREFIX}/product`,
  product: function (id) {
    return `${this.productBase}/${id}`
  },
  // Order
  orderBase: `${API_ENDPOINT_PREFIX}/order`,
  order: function (id) {
    return `${this.orderBase}/${id}`
  },
  // Order Note
  orderNoteBase: function (orderId) {
    return `${this.order(orderId)}/note`
  },
  orderNote: function (orderId, id) {
    return `${this.orderNoteBase(orderId)}/${id}`
  },
  // Order Payment
  orderPaymentBase: function (orderId) {
    return `${this.order(orderId)}/payment`
  },
  // Coupon
  couponBase: `${API_ENDPOINT_PREFIX}/coupon`,
  coupon: function (id) {
    return `${this.couponBase}/${id}`
  }
}
