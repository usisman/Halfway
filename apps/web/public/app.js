const API_BASE = "https://halfway-f1ft.onrender.com";

const createJamBtn = document.getElementById("createJamBtn");
const sendLocationBtn = document.getElementById("sendLocationBtn");
const getResultBtn = document.getElementById("getResultBtn");
const jamIdInput = document.getElementById("jamId");
const shareLinkInput = document.getElementById("shareLink");
const resultBox = document.getElementById("result");
const statusBox = document.getElementById("status");

function setStatus(message) {
  statusBox.textContent = message;
}

function setResult(message) {
  resultBox.textContent = message;
}

function updateShareLink(id) {
  if (!id) {
    shareLinkInput.value = "";
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("jam", id);
  shareLinkInput.value = url.toString();
}

function getJamId() {
  return jamIdInput.value.trim();
}

async function createJam() {
  setStatus("Jam oluşturuluyor...");
  try {
    const response = await fetch(`${API_BASE}/jams`, { method: "POST" });
    if (!response.ok) {
      setStatus("Jam oluşturulamadı.");
      return;
    }

    const data = await response.json();
    jamIdInput.value = data.id;
    updateShareLink(data.id);
    setStatus("Jam hazır. Linki paylaşabilirsin.");
  } catch (error) {
    setStatus("Sunucuya ulaşılamadı.");
  }
}

async function sendLocation() {
  const jamId = getJamId();
  if (!jamId) {
    setStatus("Önce bir jam ID gir.");
    return;
  }

  if (!navigator.geolocation) {
    setStatus("Tarayıcı konum API'si yok.");
    return;
  }

  setStatus("Konum alınıyor...");
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const payload = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      try {
        const response = await fetch(`${API_BASE}/jams/${jamId}/locations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          setStatus("Konum gönderilemedi.");
          return;
        }

        setStatus("Konum gönderildi.");
      } catch (error) {
        setStatus("Sunucuya ulaşılamadı.");
      }
    },
    () => {
      setStatus("Konum izni verilmedi.");
    },
    { enableHighAccuracy: false, timeout: 8000 }
  );
}

async function getResult() {
  const jamId = getJamId();
  if (!jamId) {
    setStatus("Önce bir jam ID gir.");
    return;
  }

  setStatus("Sonuç getiriliyor...");
  try {
    const response = await fetch(`${API_BASE}/jams/${jamId}/result`);
    if (!response.ok) {
      setStatus("Sonuç alınamadı.");
      return;
    }

    const data = await response.json();
    const areaText = data.area ? `Bölge: ${data.area}` : "Bölge bulunamadı";
    setResult(`Lat: ${data.lat.toFixed(5)}, Lng: ${data.lng.toFixed(5)} | ${areaText}`);
    setStatus("Sonuç geldi.");
  } catch (error) {
    setStatus("Sunucuya ulaşılamadı.");
  }
}

createJamBtn.addEventListener("click", createJam);
sendLocationBtn.addEventListener("click", sendLocation);
getResultBtn.addEventListener("click", getResult);

const params = new URLSearchParams(window.location.search);
const jamFromUrl = params.get("jam");
if (jamFromUrl) {
  jamIdInput.value = jamFromUrl;
  updateShareLink(jamFromUrl);
}
