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

    // Handle POST requests with action-based routing
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

      // Handle progress request
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

      // Handle achievements request
      if (action === 'achievements') {
        const { data: profile } = await supabase
          .from('trainer_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const { data: unlockedAchievements } = await supabase
          .from('trainer_achievements')
          .select('achievement_id')
          .eq('trainer_id', user.id);

        const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);
        const achievements = ACHIEVEMENTS.map(achievement => ({
          ...achievement,
          unlocked: unlockedIds.has(achievement.id),
          progress: achievement.condition(profile) ? 100 : 0,
        }));

        return new Response(JSON.stringify({ achievements }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Handle award XP request
      if (action === 'award_xp') {
        const { amount, reason } = body;
        console.log('Award XP - amount:', amount, 'type:', typeof amount);
        console.log('Award XP - reason:', reason, 'type:', typeof reason);

        // Validate required fields
        if (typeof amount !== 'number' || isNaN(amount)) {
          console.error('Invalid amount:', amount, 'Full body:', JSON.stringify(body));
          return new Response(JSON.stringify({ error: 'Amount must be a valid number' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (typeof reason !== 'string' || !reason.trim()) {
          console.error('Invalid reason:', reason);
          return new Response(JSON.stringify({ error: 'Reason must be a non-empty string' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get current profile
        const { data: profile } = await supabase
          .from('trainer_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const currentXP = profile?.xp || 0;
        const newXP = currentXP + amount;
        const oldLevel = profile?.level || 1;
        const newLevel = calculateLevel(newXP);

        // Update profile
        await supabase
          .from('trainer_profiles')
          .update({ xp: newXP, level: newLevel })
          .eq('id', user.id);

        // Record XP history
        await supabase
          .from('xp_history')
          .insert({ trainer_id: user.id, amount, reason });

        // Check for new achievements
        const { data: unlockedAchievements } = await supabase
          .from('trainer_achievements')
          .select('achievement_id')
          .eq('trainer_id', user.id);

        const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);
        const newAchievements = [];

        for (const achievement of ACHIEVEMENTS) {
          if (!unlockedIds.has(achievement.id) && achievement.condition(profile)) {
            await supabase
              .from('trainer_achievements')
              .insert({
                trainer_id: user.id,
                achievement_id: achievement.id,
                achievement_name: achievement.name,
                achievement_description: achievement.description,
              });
            newAchievements.push(achievement);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          oldLevel,
          newLevel,
          leveledUp: newLevel > oldLevel,
          newAchievements,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
