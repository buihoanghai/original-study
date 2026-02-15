'use client'

import { useState } from 'react'

/**
 * ScheduleSettings Component
 *
 * Allows users to customize their learning schedule preferences.
 * Settings are stored in localStorage and used by the scheduling system.
 *
 * Features:
 * - Set preferred learning times
 * - Configure daily session target
 * - Set session duration preferences
 * - Enable/disable notifications
 * - Configure review intervals (future enhancement)
 */

interface SchedulePreferences {
  preferredStartTime: string // HH:MM format
  preferredEndTime: string // HH:MM format
  dailySessionTarget: number
  defaultSessionDuration: number // minutes
  notificationsEnabled: boolean
  weekendLearning: boolean
}

const DEFAULT_PREFERENCES: SchedulePreferences = {
  preferredStartTime: '09:00',
  preferredEndTime: '21:00',
  dailySessionTarget: 3,
  defaultSessionDuration: 15,
  notificationsEnabled: true,
  weekendLearning: true,
}

export function ScheduleSettings() {
  const [preferences, setPreferences] = useState<SchedulePreferences>(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('learning-schedule-preferences')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return DEFAULT_PREFERENCES
        }
      }
    }
    return DEFAULT_PREFERENCES
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleSave = () => {
    setIsSaving(true)

    // Save to localStorage
    localStorage.setItem('learning-schedule-preferences', JSON.stringify(preferences))

    // Show success message
    setSaveMessage('Settings saved successfully!')
    setIsSaving(false)

    // Clear message after 3 seconds
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES)
    setSaveMessage('Settings reset to defaults')
    setTimeout(() => setSaveMessage(null), 3000)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Schedule Settings</h2>

      <div className="space-y-6">
        {/* Preferred Learning Time */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Preferred Learning Time</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={preferences.preferredStartTime}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    preferredStartTime: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                value={preferences.preferredEndTime}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    preferredEndTime: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sessions will be scheduled within this time window
          </p>
        </div>

        {/* Daily Session Target */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Daily Session Target
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={preferences.dailySessionTarget}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                dailySessionTarget: Number(e.target.value),
              })
            }
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            How many sessions you want to complete each day
          </p>
        </div>

        {/* Default Session Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Default Session Duration (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="120"
            step="5"
            value={preferences.defaultSessionDuration}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                defaultSessionDuration: Number(e.target.value),
              })
            }
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Typical duration for each learning session
          </p>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.notificationsEnabled}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  notificationsEnabled: e.target.checked,
                })
              }
              className="w-5 h-5"
            />
            <span className="text-sm font-medium">Enable Notifications</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.weekendLearning}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  weekendLearning: e.target.checked,
                })
              }
              className="w-5 h-5"
            />
            <span className="text-sm font-medium">
              Schedule Sessions on Weekends
            </span>
          </label>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {saveMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}

