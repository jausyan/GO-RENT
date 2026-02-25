// Cloudflare Pages Function
import { createClient } from '@supabase/supabase-js';

export async function onRequestGet(context) {
  try {
    // Get environment variables from Cloudflare
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get rental ID from URL query parameter
    const url = new URL(context.request.url);
    const rentalId = url.searchParams.get('id');

    if (!rentalId) {
      return new Response(JSON.stringify({ error: "Rental ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fetch rental data from database
    const { data, error } = await supabase
      .from("rentals")
      .select("*")
      .eq("id", rentalId)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: "Rental not found", details: error }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      message: "Rental data retrieved successfully",
      data,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
