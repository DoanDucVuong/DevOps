export const sampleOrders = [
  {
    id: 'DH240001',
    date: '2026-08-12',
    items: [
      { productId: 'p01', name: 'Áo khoác dạ dáng dài', quantity: 1, price: 1290000, size: 'M', color: 'den' },
      { productId: 'p03', name: 'Áo thun cotton basic', quantity: 2, price: 259000, size: 'L', color: 'trang' },
    ],
    total: 1808000,
    status: 'delivered',
  },
  {
    id: 'DH240002',
    date: '2026-09-01',
    items: [
      { productId: 'p05', name: 'Đầm hoa nhí midi', quantity: 1, price: 750000, size: 'S', color: 'trang' },
    ],
    total: 750000,
    status: 'shipping',
  },
  {
    id: 'DH240003',
    date: '2026-09-10',
    items: [
      { productId: 'p12', name: 'Quần jean skinny', quantity: 1, price: 550000, size: 'M', color: 'xanh' },
      { productId: 'p07', name: 'Túi xách da tối giản', quantity: 1, price: 890000, size: 'One Size', color: 'nau' },
    ],
    total: 1440000,
    status: 'pending',
  },
]

export const statusLabels = {
  pending: 'Chờ xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
}
