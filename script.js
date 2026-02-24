const form = document.getElementById("rentalForm");
const statusText = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("bukti");
  const file = fileInput.files[0];

  const reader = new FileReader();

  reader.onload = async function () {
    const base64 = reader.result;

    const data = {
      nama: document.getElementById("nama").value,
      no_hp: document.getElementById("no_hp").value,
      alamat: document.getElementById("alamat").value,
      alat: document.getElementById("alat").value,
      tanggal_sewa: document.getElementById("tanggal_sewa").value,
      filename: file.name,
      bukti_base64: base64
    };

    statusText.innerText = "Mengirim...";

    const response = await fetch("/.netlify/functions/createRental", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      statusText.innerText = "Berhasil dikirim 🚀";
      form.reset();
    } else {
      statusText.innerText = "Terjadi error ❌";
      console.error(result);
    }
  };

  reader.readAsDataURL(file);
});