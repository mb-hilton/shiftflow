'use client'

import { useState } from 'react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const JOB_TYPE = 'JOB_TYPE'

export default function DragBuilder({ jobTypes, locationId }) {
  const [shifts, setShifts] = useState([])

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8am–8pm

  // Draggable job type card
  const JobTypeCard = ({ jobType }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: JOB_TYPE,
      item: { jobType },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    }))

    return (
      <div
        ref={drag}
        className="p-2 mb-2 bg-blue-500 text-white rounded cursor-pointer"
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        {jobType.name}
      </div>
    )
  }

  // Drop zone for each hour block
  const HourCell = ({ day, hour }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: JOB_TYPE,
      drop: (item) => handleCreateShift(item.jobType, day, hour),
      collect: (monitor) => ({
        isOver: monitor.isOver()
      })
    }))

    return (
      <div
        ref={drop}
        className="border h-16 flex items-center justify-center text-sm"
        style={{
          backgroundColor: isOver ? '#d1fae5' : 'white'
        }}
      >
        {hour}:00
      </div>
    )
  }

  // Create shift when dropped
  const handleCreateShift = async (jobType, day, hour) => {
    const start = new Date()
    const end = new Date()

    const dayIndex = days.indexOf(day)
    const today = new Date()
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1))

    start.setDate(monday.getDate() + dayIndex)
    start.setHours(hour, 0, 0)

    end.setDate(monday.getDate() + dayIndex)
    end.setHours(hour + 1, 0, 0)

    const newShift = {
      location_id: locationId,
      job_type_id: jobType.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      max_assignees: 1
    }

    // Save to API
    const res = await fetch('/api/shifts', {
      method: 'POST',
      body: JSON.stringify(newShift)
    })

    const json = await res.json()

    if (json.shift) {
      setShifts((prev) => [...prev, json.shift])
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Drag & Drop Shift Builder</h2>

        <div className="grid grid-cols-4 gap-6">
          {/* Job Types */}
          <div>
            <h3 className="font-semibold mb-2">Job Types</h3>
            {jobTypes.map((jt) => (
              <JobTypeCard key={jt.id} jobType={jt} />
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="col-span-3">
            <h3 className="font-semibold mb-2">Weekly Grid</h3>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {days.map((d) => (
                <div key={d} className="text-center font-semibold">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => (
                <div key={day}>
                  {hours.map((hour) => (
                    <HourCell key={hour} day={day} hour={hour} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Render created shifts */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Created Shifts</h3>
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="border p-3 rounded mb-2 bg-gray-50"
            >
              <div>
                {new Date(shift.start_time).toLocaleString()} →{' '}
                {new Date(shift.end_time).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Job Type:{' '}
                {jobTypes.find((j) => j.id === shift.job_type_id)?.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  )
}
