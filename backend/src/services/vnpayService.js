const crypto = require('crypto')
const querystring = require('qs')

/**
 * Định dạng ngày theo chuẩn VNPay: YYYYMMDDHHmmss (GMT+7)
 */
function formatVNPayDate(date = new Date()) {
  const d = new Date(date.getTime() + (7 * 60 + date.getTimezoneOffset()) * 60000)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

/**
 * Sắp xếp các tham số theo thứ tự alphabet theo chuẩn VNPay v2.1.0
 */
function sortObject(obj) {
  let sorted = {}
  let str = []
  let key
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
        str.push(encodeURIComponent(key))
      }
    }
  }
  str.sort()
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
  }
  return sorted
}

/**
 * Tạo URL chuyển hướng thanh toán sang VNPay
 */
function createPaymentUrl({
  orderId,
  amount,
  orderInfo,
  ipAddr = '127.0.0.1',
  bankCode = '',
  locale = 'vn',
  returnUrl,
}) {
  const tmnCode = (process.env.VNP_TMNCODE || '2QXUI4J4').trim()
  const secretKey = (process.env.VNP_HASHSECRET || 'RAHMDARFGNIRXGQAUZAZVWGBBBGHIFZA').trim()
  const vnpUrl = (process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html').trim()

  const date = new Date()
  const createDate = formatVNPayDate(date)
  const expireDate = formatVNPayDate(new Date(date.getTime() + 15 * 60 * 1000))

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: String(orderId),
    vnp_OrderInfo: 'ThanhToanDonHang_' + String(orderId),
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(Number(amount) * 100), // VNPay quy định nhân 100
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr === '::1' ? '127.0.0.1' : ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  }

  if (bankCode) {
    vnp_Params['vnp_BankCode'] = bankCode
  }

  // 1. Sắp xếp object tham số theo chuẩn alphabet
  vnp_Params = sortObject(vnp_Params)

  // 2. Tạo chuỗi signData với qs ({ encode: false } do sortObject đã encode values)
  const signData = querystring.stringify(vnp_Params, { encode: false })
  const hmac = crypto.createHmac('sha512', secretKey)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
  vnp_Params['vnp_SecureHash'] = signed

  // 3. Tạo query string cuối cùng để chuyển hướng sang VNPay
  const redirectUrl = `${vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`

  console.log('=== DEBUG VNPAY ===')
  console.log('1. vnp_Params (Đã sort):', vnp_Params)
  console.log('2. signData (Chuỗi trước khi băm):', signData)
  console.log('3. SecureHash sinh ra:', signed)

  return redirectUrl
}

/**
 * Xác thực Checksum (Hash Signature) khi VNPay redirect callback trả về
 */
function verifyReturnUrl(query) {
  const secretKey = (process.env.VNP_HASHSECRET || 'RAHMDARFGNIRXGQAUZAZVWGBBBGHIFZA').trim()

  let vnp_Params = { ...query }
  const secureHash = vnp_Params['vnp_SecureHash']

  delete vnp_Params['vnp_SecureHash']
  delete vnp_Params['vnp_SecureHashType']

  vnp_Params = sortObject(vnp_Params)

  const signData = querystring.stringify(vnp_Params, { encode: false })
  const hmac = crypto.createHmac('sha512', secretKey)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  const isValid = Boolean(secureHash && secureHash.toLowerCase() === signed.toLowerCase())
  const isSuccess = isValid && vnp_Params['vnp_ResponseCode'] === '00'

  return {
    isValid,
    isSuccess,
    orderId: vnp_Params['vnp_TxnRef'],
    responseCode: vnp_Params['vnp_ResponseCode'],
    amount: vnp_Params['vnp_Amount'] ? Number(vnp_Params['vnp_Amount']) / 100 : 0,
    transactionNo: vnp_Params['vnp_TransactionNo'] || '',
    bankCode: vnp_Params['vnp_BankCode'] || '',
    payDate: vnp_Params['vnp_PayDate'] || '',
    orderInfo: vnp_Params['vnp_OrderInfo'] || '',
  }
}

module.exports = {
  createPaymentUrl,
  verifyReturnUrl,
  formatVNPayDate,
  sortObject,
}
