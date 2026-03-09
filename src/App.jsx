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

// Cases Pages
import { CasesListPage, CaseDetailPage } from '@/pages/cases'

// Courts Pages
import { CourtsListPage } from '@/pages/courts'

// Judges Pages
import { JudgesListPage } from '@/pages/judges'

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

// Repository Pages
import { RepositoryPage } from '@/pages/repository'

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
        
        {/* Cases */}
        <Route path="/cases" element={<CasesListPage />} />
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        
        {/* Courts */}
        <Route path="/courts" element={<CourtsListPage />} />
        
        {/* Judges */}
        <Route path="/judges" element={<JudgesListPage />} />
        
        {/* ── CSI — Court Sitting Information ───────────────── */}
        <Route path="/csi" element={<CSILandingPage />} />

        {/* Federal Courts entry */}
        <Route path="/csi/federal" element={<FederalCourtsPage />} />

        {/* Court of Appeal (CA) */}
        <Route path="/csi/federal/CA" element={<CADivisionsPage />} />
        <Route path="/csi/federal/CA/:divisionId" element={<CAPanelsPage />} />
        <Route path="/csi/federal/CA/:divisionId/:panelId" element={<CauseListStatusPage />} />

        {/* Federal High Court (FHC) */}
        <Route path="/csi/federal/FHC" element={<FHCDivisionsPage />} />
        <Route path="/csi/federal/FHC/:divisionId" element={<FHCJudgesPage />} />
        <Route path="/csi/federal/FHC/:divisionId/:judgeId" element={<CauseListStatusPage />} />

        {/* National Industrial Court (NICN) */}
        <Route path="/csi/federal/NIC" element={<NICDivisionsPage />} />
        <Route path="/csi/federal/NIC/:divisionId" element={<NICJudgesPage />} />
        <Route path="/csi/federal/NIC/:divisionId/:judgeId" element={<CauseListStatusPage />} />

        {/* State Courts */}
        <Route path="/csi/state" element={<StateCourtLandingPage />} />

        {/* State High Courts */}
        <Route path="/csi/state/high-court" element={<StateHighCourtListPage />} />
        <Route path="/csi/state/high-court/:stateId" element={<StateDivisionsPage />} />
        <Route path="/csi/state/high-court/:stateId/:divisionId" element={<StateJudgesPage />} />
        <Route path="/csi/state/high-court/:stateId/:divisionId/:judgeId" element={<CauseListStatusPage />} />

        {/* Magistrate Courts */}
        <Route path="/csi/state/magistrate" element={<MagistrateListPage />} />
        <Route path="/csi/state/magistrate/:stateId" element={<MagistrateDivisionsPage />} />
        <Route path="/csi/state/magistrate/:stateId/:divisionId" element={<MagistrateJudgesPage />} />
        <Route path="/csi/state/magistrate/:stateId/:divisionId/:judgeId" element={<CauseListStatusPage />} />

        {/* Cause Lists (direct access) */}
        <Route path="/cause-lists" element={<CauseListsPage />} />
        
        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<SettingsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/followings" element={<FollowingsPage />} />
        
        {/* Repository */}
        <Route path="/repository" element={<RepositoryPage />} />
        
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
