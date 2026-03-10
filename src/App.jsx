import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authAPI } from '@/services/api'

// Layouts
import { DashboardLayout, AuthLayout, PublicLayout } from '@/components/layout'

// Public Pages
import LandingPage from '@/pages/LandingPage'
import { ContactPage } from '@/pages/support'

// Auth Pages
import { LoginPage, SignupPage, ForgotPasswordPage } from '@/pages/auth'

// Dashboard Pages
import DashboardPage from '@/pages/DashboardPage'

// Cause Lists Pages
import { CauseListsPage } from '@/pages/cause-lists'

// CSI Pages
import {
  CSILandingPage,
  FederalCourtsPage,
  // Federal — CA
  CADivisionsPage,
  CAPanelsPage,
  // Federal — FHC
  FHCDivisionsPage,
  FHCJudgesPage,
  // Federal — NICN
  NICDivisionsPage,
  NICJudgesPage,
  // Shared terminal
  CauseListStatusPage,
  // State courts
  StateCourtLandingPage,
  StateHighCourtListPage,
  StateDivisionsPage,
  StateJudgesPage,
  MagistrateListPage,
  MagistrateDivisionsPage,
  MagistrateJudgesPage,
} from '@/pages/csi'

// Notifications Pages
import { NotificationsPage } from '@/pages/notifications'

// Admin Pages
import { 
  AdminDashboardPage, 
  AdminCasesPage, 
  AdminCourtsPage, 
  AdminJudgesPage,
  AdminUsersPage,
  AdminCauseListsPage,
  AdminSystemPage 
} from '@/pages/admin'

// Settings Pages
import { SettingsPage, SubscriptionPage, FollowingsPage } from '@/pages/settings'

// Loading component
import { PageLoader } from '@/components/common/LoadingSpinner'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Admin Route wrapper
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore()

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Public Route wrapper (redirects to dashboard if authenticated)
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading, accessToken } = useAuthStore()

  if (isLoading) {
    return <PageLoader />
  }

  if (isAuthenticated && accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  const { setLoading } = useAuthStore()

  // Set loading to false on app load
  useEffect(() => {
    setLoading(false)
  }, [setLoading])

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* ── CSI — Court Sitting Information ───────────────── */}
        <Route path="/csi" element={<CSILandingPage />} />

        {/* Federal Courts entry */}
        <Route path="/csi/federal" element={<FederalCourtsPage />} />

        {/* Court of Appeal (CA) */}
        <Route path="/csi/federal/CA" element={<CADivisionsPage />} />
        <Route path="/csi/federal/CA/:courtId" element={<CAPanelsPage />} />
        <Route path="/csi/federal/CA/:courtId/:panelId" element={<CauseListStatusPage />} />

        {/* Federal High Court (FHC) */}
        <Route path="/csi/federal/FHC" element={<FHCDivisionsPage />} />
        <Route path="/csi/federal/FHC/:courtId" element={<FHCJudgesPage />} />
        <Route path="/csi/federal/FHC/:courtId/:judgeId" element={<CauseListStatusPage />} />

        {/* National Industrial Court (NICN) */}
        <Route path="/csi/federal/NIC" element={<NICDivisionsPage />} />
        <Route path="/csi/federal/NIC/:courtId" element={<NICJudgesPage />} />
        <Route path="/csi/federal/NIC/:courtId/:judgeId" element={<CauseListStatusPage />} />

        {/* State Courts */}
        <Route path="/csi/state" element={<StateCourtLandingPage />} />

        {/* State High Courts */}
        <Route path="/csi/state/high-court" element={<StateHighCourtListPage />} />
        <Route path="/csi/state/high-court/:courtId" element={<StateDivisionsPage />} />
        <Route path="/csi/state/high-court/:courtId/:divisionId" element={<StateJudgesPage />} />
        <Route path="/csi/state/high-court/:courtId/:divisionId/:judgeId" element={<CauseListStatusPage />} />

        {/* Magistrate Courts */}
        <Route path="/csi/state/magistrate" element={<MagistrateListPage />} />
        <Route path="/csi/state/magistrate/:courtId" element={<MagistrateDivisionsPage />} />
        <Route path="/csi/state/magistrate/:courtId/:divisionId" element={<MagistrateJudgesPage />} />
        <Route path="/csi/state/magistrate/:courtId/:divisionId/:judgeId" element={<CauseListStatusPage />} />

        {/* Cause Lists (direct access) */}
        <Route path="/cause-lists" element={<CauseListsPage />} />
        
        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<SettingsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/followings" element={<FollowingsPage />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/cases"
          element={
            <AdminRoute>
              <AdminCasesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/courts"
          element={
            <AdminRoute>
              <AdminCourtsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/judges"
          element={
            <AdminRoute>
              <AdminJudgesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/cause-lists"
          element={
            <AdminRoute>
              <AdminCauseListsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/system"
          element={
            <AdminRoute>
              <AdminSystemPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* Catch all - redirect to dashboard or landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
