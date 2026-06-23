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
  StateJudgesPage,
  MagistrateListPage,
  MagistrateJudgesPage,
} from '@/pages/csi'

// Brief Connect Pages
import {
  BriefConnectPage,
  PostBriefPage,
  BriefRequestDetailPage,
  MyBriefsPage,
} from '@/pages/brief-connect'

// Notifications Pages
import { NotificationsPage } from '@/pages/notifications'

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

        {/* State High Courts — judges listed directly under each court (no divisions) */}
        <Route path="/csi/state/high-court" element={<StateHighCourtListPage />} />
        <Route path="/csi/state/high-court/:courtId" element={<StateJudgesPage />} />
        <Route path="/csi/state/high-court/:courtId/:judgeId" element={<CauseListStatusPage />} />

        {/* Magistrate Courts — judges listed directly under each court (no divisions) */}
        <Route path="/csi/state/magistrate" element={<MagistrateListPage />} />
        <Route path="/csi/state/magistrate/:courtId" element={<MagistrateJudgesPage />} />
        <Route path="/csi/state/magistrate/:courtId/:judgeId" element={<CauseListStatusPage />} />

        {/* ── Brief Connect ──────────────────────────────────── */}
        <Route path="/brief-connect" element={<BriefConnectPage />} />
        <Route path="/brief-connect/post" element={<PostBriefPage />} />
        <Route path="/brief-connect/my-briefs" element={<MyBriefsPage />} />
        <Route path="/brief-connect/requests/:id" element={<BriefRequestDetailPage />} />

        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<SettingsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/followings" element={<FollowingsPage />} />
      </Route>

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
