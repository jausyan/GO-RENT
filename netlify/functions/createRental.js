const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);

    const { nama, no_hp, alamat, alat, tanggal_sewa } = body;

    const { data, error } = await supabase
      .from("rentals")
      .insert([
        {
          nama,
          no_hp,
          alamat,
          alat,
          tanggal_sewa,
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
        message: "Rental created successfully",
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