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
      instansi,
      tanggal_sewa,
      bukti_base64,
      filename,
      items
    } = body;

    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Tidak ada item dipilih" }),
      };
    }

    // ======================
    // 1️⃣ Upload bukti transfer
    // ======================

    const buffer = Buffer.from(
      bukti_base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const filePath = `bukti-${Date.now()}-${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("bukti-transfer")
      .upload(filePath, buffer, {
        contentType: "image/png",
      });

    if (uploadError) throw uploadError;

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/bukti-transfer/${filePath}`;

    // ======================
    // 2️⃣ Insert ke rentals dulu
    // ======================

    const { data: rentalData, error: rentalError } = await supabase
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
          total_harga: 0
        },
      ])
      .select()
      .single();

    if (rentalError) throw rentalError;

    const rentalId = rentalData.id;

    // ======================
    // 3️⃣ Ambil harga produk dari DB
    // ======================

    const productIds = items.map(item => item.product_id);

    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, harga")
      .in("id", productIds);

    if (productError) throw productError;

    // ======================
    // 4️⃣ Hitung total harga
    // ======================

    let totalHarga = 0;

    const rentalItemsToInsert = items.map(item => {
      const product = products.find(p => p.id === item.product_id);

      if (!product) {
        throw new Error("Produk tidak ditemukan");
      }

      totalHarga += product.harga * item.qty;

      return {
        rental_id: rentalId,
        product_id: item.product_id,
        qty: item.qty
      };
    });

    // ======================
    // 5️⃣ Insert ke rental_items
    // ======================

    const { error: rentalItemsError } = await supabase
      .from("rental_items")
      .insert(rentalItemsToInsert);

    if (rentalItemsError) throw rentalItemsError;

    // ======================
    // 6️⃣ Update total_harga
    // ======================

    const { error: updateError } = await supabase
      .from("rentals")
      .update({ total_harga: totalHarga })
      .eq("id", rentalId);

    if (updateError) throw updateError;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Rental berhasil dibuat 🚀",
        total_harga: totalHarga
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};