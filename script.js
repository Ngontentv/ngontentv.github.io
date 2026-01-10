// Inisialisasi Pi SDK
Pi.init({ 
  version: "2.0",
  sandbox: true   // Ubah ke false saat deploy ke Mainnet
});

let currentUser = null;
let referrals = JSON.parse(localStorage.getItem('pi_referrals')) || [];

// Update tampilan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  updateReferralDisplay();
  loadReferrals();
});

// Autentikasi dengan Pi Network
async function authenticateWithPi() {
  const statusEl = document.getElementById('auth-status');
  statusEl.textContent = "Sedang mengautentikasi...";

  try {
    const scopes = ['username'];
    
    const auth = await Pi.authenticate(scopes, (payment) => {
      console.log("Incomplete payment found:", payment);
      // Tangani pembayaran yang belum selesai jika diperlukan
    });

    currentUser = auth.user;
    
    document.getElementById('auth-status').textContent = "Terautentikasi";
    document.getElementById('username-display').textContent = 
      `Username: ${currentUser.username}`;
    document.getElementById('referral-code').textContent = currentUser.username;
    
    document.getElementById('btn-auth').disabled = true;
    document.getElementById('btn-auth').textContent = "Sudah Login";
    
  } catch (error) {
    statusEl.textContent = `Gagal: ${error.message || 'Terjadi kesalahan'}`;
    console.error("Authentication error:", error);
  }
}

// Menyalin kode referral ke clipboard
function copyReferralCode() {
  if (!currentUser) {
    alert("Silakan login terlebih dahulu");
    return;
  }
  
  navigator.clipboard.writeText(currentUser.username)
    .then(() => alert("Kode referral berhasil disalin!"))
    .catch(() => alert("Gagal menyalin kode"));
}

// Bagikan kode referral (menggunakan Web Share API jika tersedia)
function shareReferral() {
  if (!currentUser) {
    alert("Silakan login terlebih dahulu");
    return;
  }

  const text = `Join Pi Network sekarang!\nGunakan kode referral saya: ${currentUser.username}\nDapatkan bonus mining rate 25%!`;

  if (navigator.share) {
    navigator.share({
      title: 'Pi Referral Booster',
      text: text,
      url: window.location.href
    }).catch(console.error);
  } else {
    alert("Bagikan pesan ini:\n\n" + text);
  }
}

// Menambah referral secara manual
function addReferral() {
  const input = document.getElementById('new-referral');
  const value = input.value.trim();
  
  if (!value) return;
  
  referrals.push({
    date: new Date().toLocaleDateString('id-ID'),
    name: value
  });
  
  localStorage.setItem('pi_referrals', JSON.stringify(referrals));
  input.value = '';
  
  loadReferrals();
}

// Memuat dan menampilkan daftar referral
function loadReferrals() {
  const list = document.getElementById('referral-list');
  list.innerHTML = '';
  
  referrals.forEach(ref => {
    const li = document.createElement('li');
    li.textContent = `${ref.date} - ${ref.name}`;
    list.appendChild(li);
  });
  
  const total = referrals.length;
  document.getElementById('total-count').textContent = total;
  document.getElementById('bonus-rate').textContent = `${Math.min(total * 25, 100)}%`;
}

// Update tampilan awal referral code
function updateReferralDisplay() {
  document.getElementById('referral-code').textContent = "Login untuk melihat kode Anda";
}
