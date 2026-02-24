const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body);

    const {
      nama,
      no_hp,
      alamat,
      alat,
      tanggal_sewa,
      bukti_base64,
      filename
    } = body;

    // Convert base64 ke buffer
    const buffer = Buffer.from(
      bukti_base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const filePath = `bukti-${Date.now()}-${filename}`;

    // Upload ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("bukti-transfer")
      .upload(filePath, buffer, {
        contentType: "image/png",
      });

    if (uploadError) {
      return {
        statusCode: 500,
        body: JSON.stringify(uploadError),
      };
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/bukti-transfer/${filePath}`;

    // Insert ke database
    const { data, error } = await supabase
      .from("rentals")
      .insert([
        {
          nama,
          no_hp,
          alamat,
          alat,
          tanggal_sewa,
          bukti_transfer_url: publicUrl,
          status: "MENUNGGU_VERIFIKASI",
        },
      ])
      .select();

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Rental created with proof uploaded 🚀",
        data,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};