import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const location_id = searchParams.get('location_id')
  const job_type_id = searchParams.get('job_type_id')
  const status = searchParams.get('status')

  let query = supabase.from('shifts').select('*')

  if (location_id) query = query.eq('location_id', location_id)
  if (job_type_id) query = query.eq('job_type_id', job_type_id)
  if (status) query = query.eq('status', status)

  const { data, error } = await query.order('start_time', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ shifts: data })
}

export async function POST(req: Request) {
  const body = await req.json()

  const { location_id, job_type_id, start_time, end_time, max_assignees } = body

  const { data, error } = await supabase
    .from('shifts')
    .insert({
      location_id,
      job_type_id,
      start_time,
      end_time,
      max_assignees,
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ shift: data }, { status: 201 })
}
