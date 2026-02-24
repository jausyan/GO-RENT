const form = document.getElementById("rentalForm");
const statusText = document.getElementById("status");
const fileInput = document.getElementById("bukti");
const fileNameDisplay = document.getElementById("fileName");

// ==============================
// Tampilkan nama file
// ==============================

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (file) {
    // Validasi max 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB!");
      fileInput.value = "";
      return;
    }

    fileNameDisplay.textContent = "✓ " + file.name;
    fileNameDisplay.classList.remove("hidden");
  } else {
    fileNameDisplay.classList.add("hidden");
  }
});

// ==============================
// Submit Form
// ==============================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];

  if (!file) {
    alert("Upload bukti transfer terlebih dahulu!");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function () {
    const base64 = reader.result;

    const data = {
      nama: document.getElementById("nama").value,
      no_hp: document.getElementById("no_hp").value,
      alamat: document.getElementById("alamat").value,
      alat: document.getElementById("alat").value, // sesuai DB
      tanggal_sewa: document.getElementById("tanggal_sewa").value,
      filename: file.name,
      bukti_base64: base64,
    };

    console.log("DATA DIKIRIM:", data);

    // Styling status loading
    statusText.className =
      "mt-6 text-center text-sm font-medium rounded-lg p-3 bg-blue-900/30 text-blue-400 border border-blue-700/50";

    statusText.classList.remove("hidden");
    statusText.innerText = "Mengirim data...";

    try {
      const response = await fetch("/.netlify/functions/createRental", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan");
      }

      // Success
      statusText.className =
        "mt-6 text-center text-sm font-medium rounded-lg p-3 bg-green-900/30 text-[#3fb950] border border-green-700/50";

      statusText.innerText =
        "✓ Berhasil dikirim! Terima kasih telah mempercayai GoRent 🚀";

      form.reset();
      fileNameDisplay.classList.add("hidden");

      setTimeout(() => {
        statusText.classList.add("hidden");
      }, 5000);

    } catch (error) {
      statusText.className =
        "mt-6 text-center text-sm font-medium rounded-lg p-3 bg-red-900/30 text-red-400 border border-red-700/50";

      statusText.innerText = "✗ " + error.message;
      console.error("ERROR:", error);
    }
  };

  reader.readAsDataURL(file);
});