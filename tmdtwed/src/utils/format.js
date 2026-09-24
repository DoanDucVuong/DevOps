export const formatCurrency = (value) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

export const formatDate = (isoString) => {
  const d = new Date(isoString)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
