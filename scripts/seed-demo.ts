/*
  Seed demo contacts and messages for a given trainer.
  Usage:
    pnpm ts-node scripts/seed-demo.ts --trainer-id <uuid>
  Env (optional, recommended when running locally with auth):
    SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_ACCESS_TOKEN
*/

import { createClient } from '@supabase/supabase-js'

type SeedOptions = {
  trainerId?: string
}

function getArgValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag)
  if (idx !== -1 && idx + 1 < process.argv.length) return process.argv[idx + 1]
  return undefined
}

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
    process.exit(1)
  }

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  const trainerIdArg = getArgValue('--trainer-id')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  })

  let trainerId = trainerIdArg
  if (!trainerId && accessToken) {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      console.error('Failed to resolve user from access token. Provide --trainer-id explicitly.')
      process.exit(1)
    }
    trainerId = data.user.id
  }

  if (!trainerId) {
    console.error('Missing trainer id. Pass --trainer-id <uuid> or set SUPABASE_ACCESS_TOKEN.')
    process.exit(1)
  }

  // Create contacts
  const contacts = [
    { first_name: 'Mike', last_name: 'Rodriguez', email: 'mike@example.com', phone: '+15550000001' },
    { first_name: 'Emily', last_name: 'Davis', email: 'emily@example.com', phone: '+15550000002' },
    { first_name: 'James', last_name: 'Wilson', email: 'james@example.com', phone: '+15550000003' },
    { first_name: 'Sarah', last_name: 'Chen', email: 'sarah@example.com', phone: '+15550000004' },
    { first_name: 'Alex', last_name: 'Johnson', email: 'alex@example.com', phone: '+15550000005' },
  ]

  const { data: insertedContacts, error: contactsError } = await supabase
    .from('contacts')
    .insert(
      contacts.map((c) => ({
        ...c,
        trainer_id: trainerId!,
        messages_sent_today: 0,
        messages_sent_this_week: 0,
        consent_status: 'subscribed',
      }))
    )
    .select('id, first_name, last_name')

  if (contactsError) {
    console.error('Failed to insert contacts:', contactsError)
    process.exit(1)
  }

  const contactIds = (insertedContacts || []).map((c) => c.id)
  if (contactIds.length === 0) {
    console.log('No contacts inserted (possibly already exist). Fetching existing...')
    const { data: existing } = await supabase
      .from('contacts')
      .select('id, first_name, last_name')
      .eq('trainer_id', trainerId)
      .limit(5)
    if (!existing || existing.length === 0) {
      console.error('No contacts available to seed messages.')
      process.exit(1)
    }
  }

  const allContacts = insertedContacts || []
  const reasons = [
    'Upcoming session reminder',
    'Streak protection',
    'Nutrition tip',
    'Form feedback',
    'Accountability check-in',
  ]

  const now = new Date()
  const messages = (allContacts.length ? allContacts : []).slice(0, 5).map((c, idx) => ({
    trainer_id: trainerId!,
    contact_id: c.id,
    content:
      idx % 2 === 0
        ? `Hey ${c.first_name}, great work this week! Ready to book your next session?`
        : `Quick check-in ${c.first_name} — how did today’s workout feel?` ,
    status: 'draft',
    confidence: [0.92, 0.85, 0.78, 0.64, 0.95][idx % 5],
    why_reasons: [reasons[idx % reasons.length]],
    scheduled_for: new Date(now.getTime() + (idx + 1) * 60 * 60 * 1000).toISOString(),
    channel: 'sms',
  }))

  if (messages.length > 0) {
    const { error: msgErr } = await supabase.from('messages').insert(messages)
    if (msgErr) {
      console.error('Failed to insert messages:', msgErr)
      process.exit(1)
    }
  }

  console.log('Seed complete:', {
    trainerId,
    contactsInserted: insertedContacts?.length || 0,
    messagesInserted: messages.length,
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


