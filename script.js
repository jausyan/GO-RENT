const form = document.getElementById("rentalForm");
const statusText = document.getElementById("status");
const fileInput = document.getElementById("bukti");
const fileNameDisplay = document.getElementById("fileName");

fileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    fileNameDisplay.textContent = "✓ " + e.target.files[0].name;
    fileNameDisplay.classList.remove("hidden");
    fileNameDisplay.classList.add("text-[#58a6ff]");
  } else {
    fileNameDisplay.classList.add("hidden");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];

  const reader = new FileReader();

  reader.onload = async function () {
    const base64 = reader.result;

    const data = {
      nama: document.getElementById("nama").value,
      no_hp: document.getElementById("no_hp").value,
      alamat: document.getElementById("alamat").value,
      instansi: document.getElementById("alat").value,
      tanggal_sewa: document.getElementById("tanggal_sewa").value,
      filename: file.name,
      bukti_base64: base64
    };

    statusText.classList.remove("hidden", "bg-red-900/30", "text-red-400", "border-red-700/50");
    statusText.classList.add("bg-blue-900/30", "text-blue-400", "border", "border-blue-700/50");
    statusText.innerText = "Mengirim data...";

    const response = await fetch("/.netlify/functions/createRental", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      statusText.classList.remove("bg-blue-900/30", "text-blue-400", "border-blue-700/50");
      statusText.classList.add("bg-green-900/30", "text-[#3fb950]", "border", "border-green-700/50");
      statusText.innerText = "✓ Berhasil dikirim! Terima kasih telah mempercayai GoRent 🚀";
      form.reset();
      fileNameDisplay.classList.add("hidden");
      setTimeout(() => {
        statusText.classList.add("hidden");
      }, 5000);
    } else {
      statusText.classList.remove("bg-blue-900/30", "text-blue-400", "border-blue-700/50");
      statusText.classList.add("bg-red-900/30", "text-red-400", "border", "border-red-700/50");
      statusText.innerText = "✗ Terjadi kesalahan. Silakan coba lagi.";
      console.error(result);
    }
  };

  reader.readAsDataURL(file);
});
