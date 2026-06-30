import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const shift_id = params.id

  const { error } = await supabase
    .from('shifts')
    .update({ status: 'cancelled' })
    .eq('id', shift_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: 'Shift cancelled' })
}
