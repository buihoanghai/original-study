'use client'

import { useState } from 'react'
import type { LearningSession } from '@mindmap/domain'
import { CalendarView } from '@/components/CalendarView'
import { MasteryDashboard } from '@/components/MasteryDashboard'
import { StreakTracker } from '@/components/StreakTracker'
import { SessionExecutor } from '@/components/SessionExecutor'
import { LearningNotifications } from '@/components/LearningNotifications'
import { ScheduleSettings } from '@/components/ScheduleSettings'
import { SessionHistory } from '@/components/SessionHistory'
import { ProtectedRoute } from '@/components/ProtectedRoute'

/**
 * Learning Page
 *
 * Main page for the Adaptive Learning Calendar system.
 * Integrates all learning components:
 * - Calendar view of scheduled sessions
 * - Mastery dashboard
 * - Streak tracker
 * - Session executor
 *
 * This page implements AC2, AC3, AC4, AC5 from Task 007.
 */
function LearningPageContent() {
  const [selectedSession, setSelectedSession] = useState<LearningSession | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<'calendar' | 'history' | 'settings'>('calendar')

  const handleSessionClick = (session: LearningSession) => {
    // Only allow executing scheduled sessions
    if (session.status === 'scheduled') {
      setSelectedSession(session)
    }
  }

  const handleSessionComplete = () => {
    // Refresh all components by changing the key
    setRefreshKey((prev) => prev + 1)
  }

  const handleCloseExecutor = () => {
    setSelectedSession(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Adaptive Learning Calendar
          </h1>
          <p className="text-gray-600">
            Track your learning progress and complete scheduled sessions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Calendar (2/3 width on large screens) */}
              <div className="lg:col-span-2">
                <CalendarView
                  key={`calendar-${refreshKey}`}
                  onSessionClick={handleSessionClick}
                />
              </div>

              {/* Right Column - Streak Tracker (1/3 width on large screens) */}
              <div>
                <StreakTracker key={`streak-${refreshKey}`} />
              </div>
            </div>

            {/* Mastery Dashboard - Full Width */}
            <div className="mt-6">
              <MasteryDashboard key={`mastery-${refreshKey}`} />
            </div>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 gap-6">
            <SessionHistory key={`history-${refreshKey}`} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 gap-6">
            <ScheduleSettings />
          </div>
        )}

        {/* Session Executor Modal */}
        {selectedSession && (
          <SessionExecutor
            session={selectedSession}
            onComplete={handleSessionComplete}
            onClose={handleCloseExecutor}
          />
        )}

        {/* Learning Notifications */}
        <LearningNotifications key={`notifications-${refreshKey}`} />
      </div>
    </div>
  )
}

/**
 * Learning Page (Protected)
 *
 * Wraps the learning page content with authentication protection.
 */
export default function LearningPage() {
  return (
    <ProtectedRoute>
      <LearningPageContent />
    </ProtectedRoute>
  )
}

