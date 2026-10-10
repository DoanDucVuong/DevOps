import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// role (tuỳ chọn): yêu cầu quyền cụ thể, ví dụ role="admin"
export default function ProtectedRoute({ children, role }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }
  return children
}
