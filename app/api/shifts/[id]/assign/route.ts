import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const shift_id = params.id
  const body = await req.json()
  const { user_id, source = 'self_claimed' } = body

  const { data, error } = await supabase
    .from('shift_assignments')
    .insert({
      shift_id,
      user_id,
      status: 'assigned',
      source
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ assignment: data }, { status: 201 })
}
