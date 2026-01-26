import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Finding ideas without proper images...");

    // Find all AI-generated ideas without proper mockup images
    const { data: ideas, error: fetchError } = await supabase
      .from('solutions')
      .select('id, title, description, landing_page')
      .eq('ai_generated', true);

    if (fetchError) throw fetchError;

    // Filter to ideas without proper storage URLs
    const ideasNeedingImages = ideas?.filter(idea => {
      const mockupImage = idea.landing_page?.mockupImage;
      return !mockupImage || 
             mockupImage.startsWith('data:image') || 
             !mockupImage.includes('supabase.co/storage');
    }) || [];

    console.log(`Found ${ideasNeedingImages.length} ideas needing image regeneration`);

    // Parse request for limit
    let maxToProcess = 20;
    try {
      const body = await req.json();
      if (body.maxToProcess) maxToProcess = Math.min(body.maxToProcess, 50);
    } catch { /* use defaults */ }

    const toProcess = ideasNeedingImages.slice(0, maxToProcess);
    const results: { id: string; title: string; success: boolean; imageUrl?: string; error?: string }[] = [];

    for (const idea of toProcess) {
      console.log(`Regenerating image for: ${idea.title}`);
      
      try {
        const productDescription = idea.landing_page?.productDescription || idea.description;
        const mockupPrompt = `A clean, minimal, modern SaaS dashboard interface for "${idea.title}" - ${productDescription}. Dark theme, professional UI design, data visualization, minimal aesthetic. Ultra high resolution product screenshot mockup.`;

        const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              { role: "user", content: mockupPrompt }
            ],
            modalities: ["image", "text"]
          }),
        });

        if (!imageResponse.ok) {
          if (imageResponse.status === 429) {
            console.log("Rate limited, waiting 30 seconds...");
            await new Promise(r => setTimeout(r, 30000));
          }
          const errText = await imageResponse.text();
          console.error(`Image generation failed for ${idea.title}:`, errText);
          results.push({ id: idea.id, title: idea.title, success: false, error: errText });
          continue;
        }

        const imageData = await imageResponse.json();
        const mockupBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!mockupBase64) {
          results.push({ id: idea.id, title: idea.title, success: false, error: "No image in response" });
          continue;
        }

        // Upload to storage
        const base64Data = mockupBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = decode(base64Data);
        const fileName = `${crypto.randomUUID()}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('idea-mockups')
          .upload(fileName, imageBytes, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) {
          console.error(`Upload failed for ${idea.title}:`, uploadError);
          results.push({ id: idea.id, title: idea.title, success: false, error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('idea-mockups')
          .getPublicUrl(fileName);

        // Update the solution with new image URL
        const updatedLandingPage = {
          ...idea.landing_page,
          mockupImage: publicUrl
        };

        const { error: updateError } = await supabase
          .from('solutions')
          .update({ landing_page: updatedLandingPage })
          .eq('id', idea.id);

        if (updateError) {
          console.error(`Update failed for ${idea.title}:`, updateError);
          results.push({ id: idea.id, title: idea.title, success: false, error: updateError.message });
        } else {
          console.log(`Successfully regenerated image for: ${idea.title}`);
          results.push({ id: idea.id, title: idea.title, success: true, imageUrl: publicUrl });
        }

        // Delay between generations
        await new Promise(r => setTimeout(r, 3000));

      } catch (error) {
        console.error(`Error processing ${idea.title}:`, error);
        results.push({ 
          id: idea.id, 
          title: idea.title, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Image regeneration complete. Success: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: toProcess.length,
        successful: successCount,
        failed: failCount,
        remaining: ideasNeedingImages.length - toProcess.length,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Image regeneration error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
