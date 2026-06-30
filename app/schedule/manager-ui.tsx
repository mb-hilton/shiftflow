'use client'

import DragBuilder from './drag-builder'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ManagerSchedulePage() {
  const [shifts, setShifts] = useState([])
  const [locations, setLocations] = useState([])
  const [jobTypes, setJobTypes] = useState([])

  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedJobType, setSelectedJobType] = useState('')

  // Load locations + job types
  useEffect(() => {
    const loadMeta = async () => {
      const { data: locs } = await supabase.from('locations').select('*')
      const { data: jobs } = await supabase.from('job_types').select('*')

      setLocations(locs || [])
      setJobTypes(jobs || [])
    }

    loadMeta()
  }, [])

  // Load shifts
  useEffect(() => {
    const loadShifts = async () => {
      let url = `/api/shifts`

      const params = new URLSearchParams()
      if (selectedLocation) params.append('location_id', selectedLocation)
      if (selectedJobType) params.append('job_type_id', selectedJobType)

      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url)
      const json = await res.json()
      setShifts(json.shifts || [])
    }

    loadShifts()
  }, [selectedLocation, selectedJobType])

  // Cancel shift
  const cancelShift = async (id: string) => {
    await fetch(`/api/shifts/${id}`, { method: 'DELETE' })
    setShifts(shifts.filter((s) => s.id !== id))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manager Schedule</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          className="border p-2 rounded"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={selectedJobType}
          onChange={(e) => setSelectedJobType(e.target.value)}
        >
          <option value="">All Job Types</option>
          {jobTypes.map((jt) => (
            <option key={jt.id} value={jt.id}>
              {jt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">
                {new Date(shift.start_time).toLocaleString()} →{' '}
                {new Date(shift.end_time).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Location: {locations.find((l) => l.id === shift.location_id)?.name}
              </div>
              <div className="text-sm text-gray-600">
                Job Type: {jobTypes.find((j) => j.id === shift.job_type_id)?.name}
              </div>
              <div className="text-sm mt-1">
                Status: <span className="font-medium">{shift.status}</span>
              </div>
            </div>

            <button
              onClick={() => cancelShift(shift.id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
