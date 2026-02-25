const form = document.getElementById("rentalForm");
const statusText = document.getElementById("status");
const fileInput = document.getElementById("bukti");
const fileNameDisplay = document.getElementById("fileName");
const checkboxes = document.querySelectorAll(".item-checkbox");
const priceDisplay = document.getElementById("priceDisplay");
const totalPriceElement = document.getElementById("totalPrice");
const selectedItemsElement = document.getElementById("selectedItems");

// File upload feedback
fileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    fileNameDisplay.textContent = "✓ " + e.target.files[0].name;
    fileNameDisplay.classList.remove("hidden");
    fileNameDisplay.classList.add("text-[#58a6ff]");
  } else {
    fileNameDisplay.classList.add("hidden");
  }
});

// Handle item selection and price calculation
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const selectedCheckboxes = document.querySelectorAll(".item-checkbox:checked");
    
    // Limit to 4 items
    if (selectedCheckboxes.length > 4) {
      checkbox.checked = false;
      alert("Maksimal 4 alat yang dapat dipilih!");
      return;
    }

    // Calculate total price
    let totalPrice = 0;
    const selectedItems = [];
    
    selectedCheckboxes.forEach((cb) => {
      totalPrice += parseInt(cb.dataset.price);
      selectedItems.push(cb.value);
    });

    // Update display
    if (selectedCheckboxes.length > 0) {
      priceDisplay.classList.remove("hidden");
      totalPriceElement.textContent = `Rp ${totalPrice.toLocaleString("id-ID")}`;
      selectedItemsElement.textContent = `Dipilih: ${selectedItems.join(", ")}`;
    } else {
      priceDisplay.classList.add("hidden");
    }
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate at least one item is selected
  const selectedCheckboxes = document.querySelectorAll(".item-checkbox:checked");
  if (selectedCheckboxes.length === 0) {
    alert("Pilih minimal 1 alat untuk dipinjam!");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function () {
    const base64 = reader.result;

    // Prepare items data (item_1, item_2, item_3, item_4)
    const itemsData = {
      item_1: "",
      item_2: "",
      item_3: "",
      item_4: ""
    };

    let totalPrice = 0;
    selectedCheckboxes.forEach((cb, index) => {
      itemsData[`item_${index + 1}`] = cb.value;
      totalPrice += parseInt(cb.dataset.price);
    });

    const data = {
      nama: document.getElementById("nama").value,
      no_hp: document.getElementById("no_hp").value,
      alamat: document.getElementById("alamat").value,
      ...itemsData,
      price_total: totalPrice,
      tanggal_sewa: document.getElementById("tanggal_sewa").value,
      filename: file.name,
      bukti_base64: base64
    };

    statusText.classList.remove("hidden", "bg-red-900/30", "text-red-400", "border-red-700/50");
    statusText.classList.add("bg-blue-900/30", "text-blue-400", "border", "border-blue-700/50");
    statusText.innerText = "Mengirim data...";

    const response = await fetch("/functions/createRental", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      statusText.classList.remove("bg-blue-900/30", "text-blue-400", "border-blue-700/50");
      statusText.classList.add("bg-green-900/30", "text-[#3fb950]", "border", "border-green-700/50");
      statusText.innerText = "✓ Berhasil dikirim! Mengalihkan ke halaman verifikasi...";
      
      // Store rental ID and redirect to verification page
      if (result.data && result.data[0]) {
        const rentalId = result.data[0].id;
        setTimeout(() => {
          window.location.href = `verify.html?id=${rentalId}`;
        }, 1500);
      }
    } else {
      statusText.classList.remove("bg-blue-900/30", "text-blue-400", "border-blue-700/50");
      statusText.classList.add("bg-red-900/30", "text-red-400", "border", "border-red-700/50");
      statusText.innerText = "✗ Terjadi kesalahan. Silakan coba lagi.";
      console.error(result);
    }
  };

  reader.readAsDataURL(file);
});