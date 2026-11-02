
/* =====================================================
   KAHFI & RIRIN — SCRIPT.JS
   ===================================================== */

/* LOADING SCREEN */
const loading = document.getElementById('loading');
const loadingStart = Date.now();
const minimumLoadingTime = 3000;

function hideLoading() {
  if (!loading) return;

  const elapsed = Date.now() - loadingStart;
  const remaining = Math.max(0, minimumLoadingTime - elapsed);

  window.setTimeout(() => {
    loading.classList.add('done');
  }, remaining);
}

window.addEventListener('load', hideLoading);
/* KUNCI HALAMAN COVER */
function isCoverUnlocked() {
  return sessionStorage.getItem('weddingUnlocked') === 'true';
}

// Mencegah scroll mouse dan trackpad
document.addEventListener('wheel', (event) => {
  if (!isCoverUnlocked()) event.preventDefault();
}, { passive: false });

// Mencegah swipe pada layar HP
document.addEventListener('touchmove', (event) => {
  if (!isCoverUnlocked()) event.preventDefault();
}, { passive: false });

// Mencegah navigasi menggunakan keyboard
document.addEventListener('keydown', (event) => {
  const scrollKeys = [
    'ArrowDown', 'ArrowUp',
    'PageDown', 'PageUp',
    'Home', 'End', ' '
  ];

  if (!isCoverUnlocked() && scrollKeys.includes(event.key)) {
    event.preventDefault();
  }
});

// Mencegah menu navigasi dibuka sebelum undangan
document.addEventListener('click', (event) => {
  const navLink = event.target.closest('.nav-item');

  if (navLink && !isCoverUnlocked()) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);
/* TOMBOL BUKA UNDANGAN */
document.querySelectorAll('[data-go]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.go);

    // Buka kunci ketika tombol Buka Undangan ditekan
   if (button.dataset.go === 'intro') {
  sessionStorage.setItem('weddingUnlocked', 'true');
   }

    target?.scrollIntoView({ behavior: 'smooth' });
  });
});

/* DETEKSI HALAMAN DAN NAVIGASI */
const sections = [...document.querySelectorAll('.page')];
const navItems = [...document.querySelectorAll('.nav-item')];

const navMap = {
  cover: '#cover',
  intro: '#cover',
  couple: '#couple',
  event: '#event',
  story: '#gallery',
  gallery: '#gallery',
  rsvp: '#rsvp',
  gift: '#gift',
  closing: '#gift'
};

const pageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add('in-view');

    const activeHref = navMap[entry.target.id];
    navItems.forEach((item) => {
      item.classList.toggle(
        'selected',
        item.getAttribute('href') === activeHref
      );
    });
  });
}, { threshold: 0.32 });

sections.forEach((section) => pageObserver.observe(section));

/* ANIMASI REVEAL */
const revealElements = document.querySelectorAll(
  '.section-heading,.person,.event-row,.story-head,.story-gallery,.gallery-grid,.wish-content,.closing-content,.gift-content'
);

revealElements.forEach((element) => element.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => {
  revealObserver.observe(element);
});

/* MUSIK */
const audio = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
let musicAttempted = false;

function updateMusicUI() {
  if (!audio || !musicBtn) return;

  const playing = !audio.paused;
  musicBtn.innerHTML = playing ? 'Ⅱ <span>Pause</span>' : '♫ <span>Music</span>';
  musicBtn.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
}

async function startWeddingMusic() {
  if (!audio || !audio.paused) return;

  try {
    await audio.play();
    musicAttempted = true;
    updateMusicUI();
  } catch (error) {
    updateMusicUI();
  }
}

if (musicBtn && audio) {
  musicBtn.addEventListener('click', async () => {
    if (!audio.paused) {
      audio.pause();
      updateMusicUI();
      return;
    }

    await startWeddingMusic();

    if (audio.paused) {
      alert('Musik belum bisa diputar. Pastikan file images/music.mp3 sudah diunggah ke GitHub, lalu tekan tombol Music sekali lagi.');
    }
  });

  document.querySelectorAll('[data-go="intro"]').forEach((button) => {
    button.addEventListener('click', startWeddingMusic);
  });

  const musicStartObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target.id !== 'cover' && !musicAttempted) {
        startWeddingMusic();
      }
    });
  }, { threshold: 0.55 });

  sections
    .filter((section) => section.id !== 'cover')
    .forEach((section) => musicStartObserver.observe(section));

  audio.addEventListener('play', updateMusicUI);
  audio.addEventListener('pause', updateMusicUI);
}

/* SALIN NOMOR REKENING DAN DANA */
document.querySelectorAll('[data-copy-target]').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;

    const value = target.textContent.trim();

    if (value.startsWith('ISI_')) {
      alert('Silakan ganti placeholder dengan nomor yang benar di index.html terlebih dahulu.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      const oldText = button.textContent;
      button.textContent = 'Berhasil disalin ✓';

      window.setTimeout(() => {
        button.textContent = oldText;
      }, 1800);
    } catch (error) {
      window.prompt('Salin nomor berikut:', value);
    }
  });
});

/* =====================================================
   UCAPAN & KOMENTAR — SUPABASE
   ===================================================== */

const SUPABASE_URL = 'https://kmsjcvlmuoulkrkvisdq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iYEK2XYnUwOjaUcHiElx-Q_K1O5daxG';

const wishForm = document.getElementById('wishForm');
const wishList = document.getElementById('wishList');
const wishStatus = document.getElementById('wishStatus');
const wishCount = document.getElementById('wishCount');
const wishSubmit = document.getElementById('wishSubmit');

const supabaseHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

/* MEMUAT DAFTAR UCAPAN */
async function loadWishes() {
  if (!wishList) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/wedding_wishes?select=guest_name,message,attendance,created_at&order=created_at.desc&limit=100`,
      {
        method: 'GET',
        headers: supabaseHeaders
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const wishes = await response.json();

    wishList.replaceChildren();

    if (wishCount) {
      wishCount.textContent = `${wishes.length} ucapan`;
    }

    if (wishes.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'comments-empty';
      empty.textContent = 'Belum ada ucapan. Jadilah yang pertama mengirim doa!';
      wishList.appendChild(empty);
      return;
    }

    wishes.forEach((wish) => {
      const item = document.createElement('article');
      item.className = 'wish-comment';

      const name = document.createElement('h3');
      name.className = 'wish-comment-name';
      name.textContent = wish.guest_name;

      const message = document.createElement('p');
      message.className = 'wish-comment-message';
      message.textContent = wish.message;

      const meta = document.createElement('div');
      meta.className = 'wish-comment-meta';

      const date = new Date(wish.created_at);
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      meta.textContent =
        `${wish.attendance || 'Belum dikonfirmasi'} · ${formattedDate}`;

      item.append(name, message, meta);
      wishList.appendChild(item);
    });

  } catch (error) {
    console.error('Gagal memuat ucapan:', error);

    wishList.innerHTML =
      '<p class="comments-empty">Ucapan belum dapat dimuat. Silakan muat ulang halaman.</p>';
  }
}

/* MENGIRIM UCAPAN */
if (wishForm) {
  wishForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('guestName').value.trim();
    const attendance = document.getElementById('attendance').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !message) {
      alert('Silakan isi nama dan ucapan terlebih dahulu.');
      return;
    }

    if (name.length > 60 || message.length > 500) {
      alert('Nama maksimal 60 karakter dan ucapan maksimal 500 karakter.');
      return;
    }

    wishSubmit.disabled = true;
    wishSubmit.textContent = 'Mengirim...';

    if (wishStatus) {
      wishStatus.textContent = 'Sedang menyimpan ucapan Anda...';
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/wedding_wishes`,
        {
          method: 'POST',
          headers: {
            ...supabaseHeaders,
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({
            guest_name: name,
            attendance: attendance,
            message: message
          })
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      wishForm.reset();

      if (wishStatus) {
        wishStatus.textContent = 'Terima kasih! Ucapan Anda berhasil dikirim.';
      }

      await loadWishes();

      if (wishList) {
        wishList.scrollTop = 0;
      }

    } catch (error) {
      console.error('Gagal mengirim ucapan:', error);

      if (wishStatus) {
        wishStatus.textContent =
          'Ucapan belum berhasil dikirim. Silakan coba kembali.';
      }

    } finally {
      wishSubmit.disabled = false;
      wishSubmit.textContent = 'Kirim Ucapan ↗';
    }
  });
}

/* MEMUAT UCAPAN SAAT HALAMAN DIBUKA */
loadWishes();

/* MEMPERBARUI DAFTAR SETIAP 30 DETIK */
setInterval(loadWishes, 30000);

/* NAMA TAMU OTOMATIS DARI PARAMETER ?to= */
const guestParams = new URLSearchParams(window.location.search);
const guestName = guestParams.get('to')?.trim() || 'Tamu Undangan';

const coverGuest = document.getElementById('inviteGuestName');
const introGuest = document.getElementById('inviteGuestNameIntro');

if (coverGuest) coverGuest.textContent = guestName;
if (introGuest) introGuest.textContent = guestName;
