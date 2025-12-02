/**
 * Mindbody Sync Function
 * Syncs clients, attendance, memberships from Mindbody API
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/responses.ts";
import { createLogger } from "../_shared/logger.ts";
import { getServiceRoleClient, getIntegrationConfig, updateIntegrationStatus } from "../_shared/integration-adapter.ts";
import { ensureValidToken, refreshMindbodyToken, isTokenExpired } from "../_shared/oauth-helpers.ts";
import { createSyncLogger } from "../_shared/sync-logger.ts";

interface MindbodyClient {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  MobilePhone?: string;
  HomePhone?: string;
  Status: string;
  MembershipId?: string;
  MembershipName?: string;
  LastModifiedDateTime?: string;
}

interface MindbodyAppointment {
  Id: string;
  ClientId: string;
  StartDateTime: string;
  EndDateTime: string;
  Status: string;
  ServiceId: string;
  ServiceName: string;
}

interface MindbodyMembership {
  Id: string;
  ClientId: string;
  Name: string;
  Status: string;
  PaymentDate?: string;
  ExpirationDate?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger('mindbody-sync');

  // Validate internal service call - require service role key header
  const authHeader = req.headers.get('x-service-key');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  if (!authHeader || authHeader !== serviceRoleKey) {
    logger.error('Unauthorized: Invalid or missing service key');
    return errorResponse('Unauthorized', 401);
  }

  try {
    const { trainerId } = await req.json().catch(() => {
      // Try to get from query params if body parsing fails
      const url = new URL(req.url);
      return { trainerId: url.searchParams.get('trainerId') };
    });

    if (!trainerId) {
      return errorResponse('Missing trainerId', 400);
    }

    const supabase = getServiceRoleClient();
    const syncLogger = createSyncLogger(supabase, trainerId, 'mindbody');

    syncLogger.logStart();
    const startTime = Date.now();

    // Get Mindbody config
    const config = await getIntegrationConfig(supabase, trainerId, 'mindbody');
    if (!config || !config.access_token) {
      syncLogger.logError('Mindbody not connected');
      return errorResponse('Mindbody not connected', 400);
    }

    // Ensure token is valid (refresh if needed)
    let validConfig = config;
    if (isTokenExpired(config)) {
      try {
        validConfig = await ensureValidToken(supabase, config, refreshMindbodyToken);
        syncLogger.logProgress('Token refreshed successfully');
      } catch (error) {
        syncLogger.logError(error instanceof Error ? error : String(error));
        return errorResponse('Token refresh failed', 401);
      }
    }

    // Update status to syncing
    await updateIntegrationStatus(supabase, trainerId, 'mindbody', {
      connection_status: 'syncing',
    });

    let recordsSynced = 0;
    let recordsUpdated = 0;
    const errors: string[] = [];

    // Fetch clients from Mindbody
    try {
      const clients = await fetchMindbodyClients(
        validConfig.access_token,
        validConfig.external_location_id || ''
      );

      syncLogger.logProgress(`Fetched ${clients.length} clients from Mindbody`);

      // Normalize and store clients
      for (const mbClient of clients) {
        try {
          // Upsert into contacts table
          const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .upsert({
              trainer_id: trainerId,
              mindbody_id: mbClient.Id,
              first_name: mbClient.FirstName,
              last_name: mbClient.LastName,
              email: mbClient.Email || null,
              phone: mbClient.MobilePhone || mbClient.HomePhone || null,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'trainer_id,mindbody_id',
            })
            .select()
            .single();

          if (contactError) {
            errors.push(`Failed to upsert client ${mbClient.Id}: ${contactError.message}`);
            continue;
          }

          if (!contact) continue;

          // Upsert into contact_sources
          const { error: sourceError } = await supabase
            .from('contact_sources')
            .upsert({
              contact_id: contact.id,
              source: 'mindbody',
              external_id: mbClient.Id,
              source_data: {
                status: mbClient.Status,
                membershipId: mbClient.MembershipId,
                membershipName: mbClient.MembershipName,
                lastModified: mbClient.LastModifiedDateTime,
              },
              synced_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'contact_id,source',
            });

          if (sourceError) {
            errors.push(`Failed to upsert contact source for ${mbClient.Id}: ${sourceError.message}`);
          } else {
            recordsSynced++;
            recordsUpdated++;
          }
        } catch (error) {
          errors.push(`Error processing client ${mbClient.Id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } catch (error) {
      syncLogger.logError(error instanceof Error ? error : String(error), { step: 'fetch_clients' });
      errors.push(`Failed to fetch clients: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Fetch appointments/attendance (last 30 days)
    try {
      const appointments = await fetchMindbodyAppointments(
        validConfig.access_token,
        validConfig.external_location_id || '',
        30 // days
      );

      syncLogger.logProgress(`Fetched ${appointments.length} appointments from Mindbody`);

      // Update last_activity for contacts based on appointments
      const clientActivityMap = new Map<string, Date>();
      for (const appointment of appointments) {
        if (appointment.Status === 'Completed' || appointment.Status === 'CheckedIn') {
          const appointmentDate = new Date(appointment.StartDateTime);
          const existingDate = clientActivityMap.get(appointment.ClientId);
          if (!existingDate || appointmentDate > existingDate) {
            clientActivityMap.set(appointment.ClientId, appointmentDate);
          }
        }
      }

      // Update contacts with last activity
      for (const [clientId, lastActivity] of clientActivityMap.entries()) {
        await supabase
          .from('contacts')
          .update({ last_activity: lastActivity.toISOString() })
          .eq('trainer_id', trainerId)
          .eq('mindbody_id', clientId);
      }
    } catch (error) {
      syncLogger.logError(error instanceof Error ? error : String(error), { step: 'fetch_appointments' });
      errors.push(`Failed to fetch appointments: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Fetch memberships to update payment status
    try {
      const memberships = await fetchMindbodyMemberships(
        validConfig.access_token,
        validConfig.external_location_id || ''
      );

      syncLogger.logProgress(`Fetched ${memberships.length} memberships from Mindbody`);

      // Update payment status based on memberships
      for (const membership of memberships) {
        const paymentStatus = determinePaymentStatus(membership);
        
        await supabase
          .from('contacts')
          .update({
            payment_status: paymentStatus,
            membership_status: membership.Status.toLowerCase(),
          })
          .eq('trainer_id', trainerId)
          .eq('mindbody_id', membership.ClientId);
      }
    } catch (error) {
      syncLogger.logError(error instanceof Error ? error : String(error), { step: 'fetch_memberships' });
      errors.push(`Failed to fetch memberships: ${error instanceof Error ? error.message : String(error)}`);
    }

    const durationMs = Date.now() - startTime;

    // Update integration status
    await updateIntegrationStatus(supabase, trainerId, 'mindbody', {
      connection_status: errors.length > 0 ? 'warning' : 'connected',
      last_sync_at: new Date().toISOString(),
      sync_error_message: errors.length > 0 ? errors.join('; ') : undefined,
      records_synced: recordsSynced,
      records_updated: recordsUpdated,
      sync_duration_ms: durationMs,
      error_count: errors.length,
      last_error: errors.length > 0 ? errors[0] : undefined,
      last_error_at: errors.length > 0 ? new Date().toISOString() : undefined,
    });

    // Update config last_sync_at
    await supabase
      .from('integration_configs')
      .update({
        last_sync_at: new Date().toISOString(),
        sync_status: errors.length > 0 ? 'warning' : 'idle',
        sync_error_message: errors.length > 0 ? errors.join('; ') : null,
      })
      .eq('id', config.id);

    syncLogger.logSuccess(recordsSynced, recordsUpdated, durationMs);

    return jsonResponse({
      success: true,
      recordsSynced,
      recordsUpdated,
      durationMs,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    logger.error('Sync error', { error: error instanceof Error ? error.message : String(error) });
    return errorResponse(
      `Sync failed: ${error instanceof Error ? error.message : String(error)}`,
      500
    );
  }
});

// Fetch clients from Mindbody API
async function fetchMindbodyClients(
  accessToken: string,
  locationId: string
): Promise<MindbodyClient[]> {
  const response = await fetch(
    `https://api.mindbodyonline.com/v6/client/clients?limit=200&locationId=${locationId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'siteId': locationId,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch Mindbody clients: ${errorData.Message || response.statusText}`);
  }

  const data = await response.json();
  return data.Clients || [];
}

// Fetch appointments from Mindbody API (last N days)
async function fetchMindbodyAppointments(
  accessToken: string,
  locationId: string,
  days: number = 30
): Promise<MindbodyAppointment[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateTime = startDate.toISOString();

  const response = await fetch(
    `https://api.mindbodyonline.com/v6/appointment/appointments?limit=500&locationId=${locationId}&startDateTime=${startDateTime}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'siteId': locationId,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch Mindbody appointments: ${errorData.Message || response.statusText}`);
  }

  const data = await response.json();
  return data.Appointments || [];
}

// Fetch memberships from Mindbody API
async function fetchMindbodyMemberships(
  accessToken: string,
  locationId: string
): Promise<MindbodyMembership[]> {
  const response = await fetch(
    `https://api.mindbodyonline.com/v6/sale/memberships?limit=200&locationId=${locationId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'siteId': locationId,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch Mindbody memberships: ${errorData.Message || response.statusText}`);
  }

  const data = await response.json();
  return data.Memberships || [];
}

// Determine payment status from membership
function determinePaymentStatus(membership: MindbodyMembership): 'current' | 'late' | 'overdue' {
  if (membership.Status === 'Active') {
    if (membership.ExpirationDate) {
      const expirationDate = new Date(membership.ExpirationDate);
      const now = new Date();
      const daysUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiration < 0) {
        return 'overdue';
      } else if (daysUntilExpiration < 7) {
        return 'late';
      }
    }
    return 'current';
  }
  
  return 'overdue';
}

