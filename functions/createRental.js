// Cloudflare Pages Function
import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
  try {
    // Get environment variables from Cloudflare
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const body = await context.request.json();
    
    const {
      nama,
      no_hp,
      alamat,
      item_1,
      item_2,
      item_3,
      item_4,
      price_total,
      tanggal_sewa,
      bukti_base64,
      filename
    } = body;

    // Convert base64 to buffer
    const base64Data = bukti_base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const filePath = `bukti-${Date.now()}-${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("bukti-transfer")
      .upload(filePath, buffer, {
        contentType: "image/png",
      });

    if (uploadError) {
      return new Response(JSON.stringify(uploadError), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/bukti-transfer/${filePath}`;

    // Insert to database
    const { data, error } = await supabase
      .from("rentals")
      .insert([
        {
          nama,
          no_hp,
          alamat,
          item_1,
          item_2,
          item_3,
          item_4,
          price_total,
          tanggal_sewa,
          bukti_transfer_url: publicUrl,
          status: "MENUNGGU_VERIFIKASI",
        },
      ])
      .select();

    if (error) {
      return new Response(JSON.stringify(error), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      message: "Rental created with proof uploaded 🚀",
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
