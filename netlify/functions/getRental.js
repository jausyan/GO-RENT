const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async function (event) {
  try {
    // Get rental ID from query parameter
    const rentalId = event.queryStringParameters?.id;

    if (!rentalId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Rental ID is required" }),
      };
    }

    // Fetch rental data from database
    const { data, error } = await supabase
      .from("rentals")
      .select("*")
      .eq("id", rentalId)
      .single();

    if (error) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Rental not found", details: error }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Rental data retrieved successfully",
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
