import { supabase } from '@/integrations/supabase/client'

export type GhlIntentType = 'conversations' | 'calendar' | 'settings'

export interface GhlIntent {
  type: GhlIntentType
  ids?: {
    locationId?: string
    contactId?: string
    bookingWidgetId?: string
  }
}

type GhlTemplates = {
  conversations?: string
  calendar?: string
  settings?: string
}

async function getTrainerTemplates(): Promise<{ locationId?: string, bookingWidgetId?: string, templates: GhlTemplates }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { templates: {} }
  const { data } = await supabase
    .from('ghl_config')
    .select('location_id, booking_widget_id, templates')
    .eq('trainer_id', user.id)
    .single()
  return {
    locationId: data?.location_id ?? undefined,
    bookingWidgetId: data?.booking_widget_id ?? undefined,
    templates: (data?.templates as GhlTemplates) || {},
  }
}

const defaultTemplates: Required<GhlTemplates> = {
  conversations: 'https://app.gohighlevel.com/v2/location/{locationId}/conversations/{contactId}',
  calendar: 'https://app.gohighlevel.com/v2/location/{locationId}/calendar',
  settings: 'https://app.gohighlevel.com/v2/location/{locationId}/settings',
}

export async function resolveGhlLink(intent: GhlIntent): Promise<{ url?: string, disabled: boolean, reason?: string }> {
  const { templates, locationId: cfgLocationId, bookingWidgetId: cfgBookingWidgetId } = await getTrainerTemplates()
  const tpl = templates[intent.type as keyof GhlTemplates] || defaultTemplates[intent.type]

  const locationId = intent.ids?.locationId || cfgLocationId
  const bookingWidgetId = intent.ids?.bookingWidgetId || cfgBookingWidgetId
  const contactId = intent.ids?.contactId

  // Required placeholders per type
  if (intent.type === 'conversations') {
    if (!locationId || !contactId) return { disabled: true, reason: 'Missing location/contact for GHL' }
  } else if (intent.type === 'calendar' || intent.type === 'settings') {
    if (!locationId) return { disabled: true, reason: 'Missing location for GHL' }
  }

  const url = tpl
    .replace('{locationId}', locationId ?? '')
    .replace('{contactId}', contactId ?? '')
    .replace('{bookingWidgetId}', bookingWidgetId ?? '')

  // Minimal sanity validation
  if (!url.startsWith('http')) return { disabled: true, reason: 'Invalid GHL URL template' }

  return { url, disabled: false }
}


