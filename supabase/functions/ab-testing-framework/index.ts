import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Statistical functions
function chiSquareTest(controlConversions: number, controlTotal: number, variantConversions: number, variantTotal: number) {
  const controlRate = controlConversions / controlTotal;
  const variantRate = variantConversions / variantTotal;
  
  const pooledRate = (controlConversions + variantConversions) / (controlTotal + variantTotal);
  
  const expectedControl = controlTotal * pooledRate;
  const expectedVariant = variantTotal * pooledRate;
  
  const chiSquare = 
    Math.pow(controlConversions - expectedControl, 2) / expectedControl +
    Math.pow(variantConversions - expectedVariant, 2) / expectedVariant;
  
  // Simplified p-value for chi-square (1 df)
  const pValue = chiSquare > 3.841 ? 0.05 : 0.1;
  
  return {
    chiSquare,
    pValue,
    isSignificant: chiSquare > 3.841,
    controlRate,
    variantRate,
    liftPercentage: ((variantRate - controlRate) / controlRate) * 100
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const { action, testId, clientId, variantId, testData } = await req.json().catch(() => ({}));

    // Create new A/B test
    if (action === 'create_test') {
      const { data: test, error: testError } = await supabase
        .from('ab_tests')
        .insert({
          trainer_id: user.id,
          test_name: testData.test_name,
          test_type: testData.test_type,
          hypothesis: testData.hypothesis,
          target_metrics: testData.target_metrics || [],
          test_duration_days: testData.test_duration_days,
          status: 'draft'
        })
        .select()
        .single();

      if (testError) throw testError;

      // Create variants
      if (testData.variants && testData.variants.length > 0) {
        const variants = testData.variants.map((v: any, idx: number) => ({
          test_id: test.id,
          variant_name: v.name,
          template_id: v.template_id,
          strategy_config: v.strategy_config || {},
          content_modifications: v.content_modifications || [],
          traffic_split: v.traffic_split,
          variant_index: idx,
          is_control: idx === 0
        }));

        await supabase.from('ab_test_variants').insert(variants);
      }

      return new Response(
        JSON.stringify({ success: true, test }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Assign client to test variant
    if (action === 'assign_variant') {
      // Get test variants
      const { data: variants } = await supabase
        .from('ab_test_variants')
        .select('*')
        .eq('test_id', testId);

      if (!variants || variants.length === 0) {
        throw new Error("No variants found for test");
      }

      // Check if already assigned
      const { data: existing } = await supabase
        .from('ab_test_assignments')
        .select('*')
        .eq('test_id', testId)
        .eq('client_id', clientId)
        .single();

      if (existing) {
        return new Response(
          JSON.stringify({ success: true, assignment: existing }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Weighted random assignment
      const totalWeight = variants.reduce((sum: number, v: any) => sum + v.traffic_split, 0);
      let random = Math.random() * totalWeight;
      
      let selectedVariant = variants[0];
      for (const variant of variants) {
        if (random < variant.traffic_split) {
          selectedVariant = variant;
          break;
        }
        random -= variant.traffic_split;
      }

      // Create assignment
      const { data: assignment, error: assignError } = await supabase
        .from('ab_test_assignments')
        .insert({
          test_id: testId,
          client_id: clientId,
          variant_id: selectedVariant.id
        })
        .select()
        .single();

      if (assignError) throw assignError;

      return new Response(
        JSON.stringify({ success: true, assignment, variant: selectedVariant }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record test performance
    if (action === 'record_performance') {
      const { data: assignment } = await supabase
        .from('ab_test_assignments')
        .select('*')
        .eq('test_id', testId)
        .eq('client_id', clientId)
        .single();

      if (!assignment) {
        throw new Error("No assignment found");
      }

      const { data: performance } = await supabase
        .from('ab_test_performance')
        .insert({
          test_id: testId,
          client_id: clientId,
          variant_id: assignment.variant_id,
          assignment_id: assignment.id,
          conversion_event: testData.conversion_event || false,
          click_event: testData.click_event || false,
          engagement_score: testData.engagement_score,
          response_time_minutes: testData.response_time_minutes
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({ success: true, performance }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze test results
    if (action === 'analyze_results') {
      const { data: test } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('id', testId)
        .single();

      const { data: variants } = await supabase
        .from('ab_test_variants')
        .select('*')
        .eq('test_id', testId);

      const results = await Promise.all(
        (variants || []).map(async (variant: any) => {
          const { data: performance } = await supabase
            .from('ab_test_performance')
            .select('*')
            .eq('variant_id', variant.id);

          const totalAssignments = performance?.length || 0;
          const conversions = performance?.filter((p: any) => p.conversion_event).length || 0;
          const clicks = performance?.filter((p: any) => p.click_event).length || 0;
          const avgEngagement = performance?.reduce((sum: number, p: any) => sum + (p.engagement_score || 0), 0) / totalAssignments || 0;

          return {
            variant_id: variant.id,
            variant_name: variant.variant_name,
            is_control: variant.is_control,
            total_assignments: totalAssignments,
            conversions,
            conversion_rate: totalAssignments > 0 ? (conversions / totalAssignments) * 100 : 0,
            clicks,
            click_rate: totalAssignments > 0 ? (clicks / totalAssignments) * 100 : 0,
            avg_engagement: avgEngagement
          };
        })
      );

      // Statistical analysis
      const control = results.find(r => r.is_control);
      const treatments = results.filter(r => !r.is_control);

      const analysis = treatments.map(treatment => {
        if (!control || control.total_assignments === 0 || treatment.total_assignments === 0) {
          return { variant_name: treatment.variant_name, insufficient_data: true };
        }

        const stats = chiSquareTest(
          control.conversions,
          control.total_assignments,
          treatment.conversions,
          treatment.total_assignments
        );

        return {
          variant_name: treatment.variant_name,
          ...stats
        };
      });

      // Determine winner if any variant is significant
      const significantWinner = analysis.find(a => 'isSignificant' in a && a.isSignificant && 'liftPercentage' in a && a.liftPercentage > 0);

      if (significantWinner && 'liftPercentage' in significantWinner && test.status === 'active') {
        const winnerVariant = (variants || []).find((v: any) => v.variant_name === significantWinner.variant_name);
        
        await supabase
          .from('ab_tests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            winner_variant_id: winnerVariant?.id,
            effect_size: significantWinner.liftPercentage / 100
          })
          .eq('id', testId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          test,
          results,
          analysis,
          winner: significantWinner
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get trainer's tests
    if (action === 'get_tests') {
      const { data: tests } = await supabase
        .from('ab_tests')
        .select(`
          *,
          variants:ab_test_variants(*)
        `)
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });

      return new Response(
        JSON.stringify({ success: true, tests }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ab-testing-framework:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
