const { createClient } = require("@supabase/supabase-js");

exports.handler = async function (event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Netlify Function Running 🚀" }),
  };
};