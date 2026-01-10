// Konfigurasi dasar
const PI_SDK_VERSION = "2.0";
const IS_SANDBOX = true; // Ubah ke false saat menggunakan Mainnet

let currentUser = null;

// Inisialisasi Pi SDK
function initializePiSDK() {
  if (typeof Pi === 'undefined') {
    showStatus("Pi SDK gagal dimuat. Periksa koneksi internet.", "error");
    return false;
  }

  try {
    Pi.init({ 
      version: PI_SDK_VERSION,
      sandbox: IS_SANDBOX 
    });
    showStatus("Pi SDK berhasil diinisialisasi", "success");
    return true;
  } catch (err) {
    showStatus(`Gagal inisialisasi Pi SDK: ${err.message}`, "error");
    console.error("Pi SDK init error:", err);
    return false;
  }
}

// Menampilkan status dengan warna berbeda
function showStatus(message, type = "info") {
  const statusEl = document.getElementById("auth-status");
  statusEl.textContent = message;
  
  if (type === "success") {
    statusEl.style.color = "#27ae60";
  } else if (type === "error") {
    statusEl.style.color = "#c0392b";
  } else {
    statusEl.style.color = "#7f8c8d";
  }
}

// Memuat status login sebelumnya (jika ada)
function loadSavedLogin() {
  const savedUser = localStorage.getItem('piUser');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      updateUIAfterLogin();
      showStatus(`Selamat datang kembali, ${currentUser.username}`, "success");
    } catch (e) {
      localStorage.removeItem('piUser');
    }
  }
}

// Update tampilan setelah berhasil login
function updateUIAfterLogin() {
  document.getElementById("username-display").style.display = "block";
  document.getElementById("pi-username").textContent = currentUser.username;
  
  document.getElementById("btn-login").style.display = "none";
  document.getElementById("btn-logout").style.display = "inline-block";
  
  // Update referral code
  document.getElementById("referral-code").textContent = currentUser.username;
}

// Membersihkan status login
function handleLogout() {
  currentUser = null;
  localStorage.removeItem('piUser');
  
  document.getElementById("username-display").style.display = "none";
  document.getElementById("btn-login").style.display = "inline-block";
  document.getElementById("btn-login").disabled = false;
  document.getElementById("btn-logout").style.display = "none";
  
  document.getElementById("referral-code").textContent = "Login untuk melihat kode Anda";
  
  showStatus("Anda telah keluar", "info");
}

// Proses login utama
async function handlePiLogin() {
  if (!initializePiSDK()) return;

  const loginBtn = document.getElementById("btn-login");
  loginBtn.disabled = true;
  loginBtn.textContent = "Memproses...";
  showStatus("Menunggu autentikasi...", "info");

  try {
    const scopes = ['username'];
    
    const auth = await Pi.authenticate(scopes, (payment) => {
      console.log("Ada pembayaran yang belum selesai:", payment);
      // Bisa ditangani lebih lanjut jika aplikasi menggunakan pembayaran
    });

    currentUser = auth.user;
    
    // Simpan ke localStorage (opsional)
    localStorage.setItem('piUser', JSON.stringify(currentUser));
    
    showStatus(`Berhasil login sebagai ${currentUser.username}`, "success");
    updateUIAfterLogin();
    
  } catch (error) {
    let errorMessage = "Gagal melakukan login";
    
    if (error.message?.includes("not registered")) {
      errorMessage = "Aplikasi belum terdaftar di Developer Portal Pi";
    } else if (error.message?.includes("denied")) {
      errorMessage = "Izin ditolak oleh pengguna";
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    showStatus(errorMessage, "error");
    console.error("Pi Authenticate Error:", error);
    
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Login dengan Pi";
  }
}

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  const sdkReady = initializePiSDK();
  
  if (sdkReady) {
    loadSavedLogin();
  }
  
  // Jika sudah login sebelumnya, tombol login disembunyikan
  if (currentUser) {
    document.getElementById("btn-login").style.display = "none";
    document.getElementById("btn-logout").style.display = "inline-block";
  }
});
