import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AwardXPRequest {
  amount: number;
  reason: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (stats: any) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_message', name: 'First Steps', description: 'Approve your first message', condition: (s) => s.total_messages_approved >= 1 },
  { id: 'ten_messages', name: 'Getting Started', description: 'Approve 10 messages', condition: (s) => s.total_messages_approved >= 10 },
  { id: 'fifty_messages', name: 'Productive', description: 'Approve 50 messages', condition: (s) => s.total_messages_approved >= 50 },
  { id: 'hundred_messages', name: 'Efficient', description: 'Approve 100 messages', condition: (s) => s.total_messages_approved >= 100 },
  { id: 'first_edit', name: 'Perfectionist', description: 'Edit your first message', condition: (s) => s.total_messages_edited >= 1 },
  { id: 'ten_edits', name: 'Detail Oriented', description: 'Edit 10 messages', condition: (s) => s.total_messages_edited >= 10 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', condition: (s) => s.level >= 5 },
  { id: 'level_10', name: 'Expert Trainer', description: 'Reach level 10', condition: (s) => s.level >= 10 },
  { id: 'streak_7', name: 'Consistency', description: 'Maintain a 7-day streak', condition: (s) => s.current_streak >= 7 },
  { id: 'streak_30', name: 'Dedication', description: 'Maintain a 30-day streak', condition: (s) => s.current_streak >= 30 },
];

function calculateLevel(xp: number): number {
  return Math.floor(Math.pow(xp / 100, 0.5)) + 1;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      let body: any;
      
      try {
        body = await req.json();
        console.log('Received body:', JSON.stringify(body));
      } catch (e) {
        console.error('Failed to parse request body:', e);
        return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const action = body.action;
      console.log('Action:', action);

      if (action === 'progress') {
        const { data: profile } = await supabase
          .from('trainer_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const level = profile?.level || 1;
        const xp = profile?.xp || 0;
        const nextLevelXp = Math.pow(level, 2) * 100;
        const progress = (xp % nextLevelXp) / nextLevelXp;

        return new Response(JSON.stringify({
          level,
          xp,
          nextLevelXp,
          progress,
          currentStreak: profile?.current_streak || 0,
          longestStreak: profile?.longest_streak || 0,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'achievements') {
        const { data: profile } = await supabase
          .from('trainer_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const { data: unlockedAchievements } = await supabase
          .from('trainer_achievements')
          .select('achievement_id, unlocked_at')
          .eq('trainer_id', user.id);

        const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);
        
        const achievements = ACHIEVEMENTS.map(achievement => ({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          unlocked: unlockedIds.has(achievement.id),
          unlockedAt: unlockedAchievements?.find(a => a.achievement_id === achievement.id)?.unlocked_at,
          progress: achievement.condition(profile || {}) ? 1 : 0,
        }));

        return new Response(JSON.stringify({ achievements }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'award_xp') {
        const { amount, reason } = body as AwardXPRequest;

        if (typeof amount !== 'number' || isNaN(amount)) {
          return new Response(JSON.stringify({ error: 'Invalid amount' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!reason || typeof reason !== 'string') {
          return new Response(JSON.stringify({ error: 'Invalid reason' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: profile } = await supabase
          .from('trainer_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const oldXp = profile?.xp || 0;
        const oldLevel = profile?.level || 1;
        const newXp = oldXp + amount;
        const newLevel = calculateLevel(newXp);
        const leveledUp = newLevel > oldLevel;

        await supabase
          .from('trainer_profiles')
          .upsert({
            id: user.id,
            xp: newXp,
            level: newLevel,
            updated_at: new Date().toISOString(),
          });

        await supabase
          .from('trainer_xp_history')
          .insert({
            trainer_id: user.id,
            amount,
            reason,
            created_at: new Date().toISOString(),
          });

        const { data: unlockedAchievements } = await supabase
          .from('trainer_achievements')
          .select('achievement_id')
          .eq('trainer_id', user.id);

        const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);
        const newAchievements: Achievement[] = [];

        const stats = {
          ...profile,
          level: newLevel,
          xp: newXp,
        };

        for (const achievement of ACHIEVEMENTS) {
          if (!unlockedIds.has(achievement.id) && achievement.condition(stats)) {
            await supabase
              .from('trainer_achievements')
              .insert({
                trainer_id: user.id,
                achievement_id: achievement.id,
                unlocked_at: new Date().toISOString(),
              });
            newAchievements.push(achievement);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          oldLevel,
          newLevel,
          leveledUp,
          newAchievements: newAchievements.map(a => ({
            id: a.id,
            name: a.name,
            description: a.description,
          })),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
