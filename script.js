
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
let coverUnlocked = false;

// Mencegah scroll mouse dan trackpad
document.addEventListener('wheel', (event) => {
  if (!coverUnlocked) event.preventDefault();
}, { passive: false });

// Mencegah swipe pada layar HP
document.addEventListener('touchmove', (event) => {
  if (!coverUnlocked) event.preventDefault();
}, { passive: false });

// Mencegah navigasi menggunakan keyboard
document.addEventListener('keydown', (event) => {
  const scrollKeys = [
    'ArrowDown', 'ArrowUp',
    'PageDown', 'PageUp',
    'Home', 'End', ' '
  ];

  if (!coverUnlocked && scrollKeys.includes(event.key)) {
    event.preventDefault();
  }
});

// Mencegah menu navigasi dibuka sebelum undangan
document.addEventListener('click', (event) => {
  const navLink = event.target.closest('.nav-item');

  if (navLink && !coverUnlocked) {
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
      coverUnlocked = true;
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

/* FORM UCAPAN VIA WHATSAPP */
const wishForm = document.getElementById('wishForm');

if (wishForm) {
  wishForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('guestName').value.trim();
    const attendance = document.getElementById('attendance').value;
    const message = document.getElementById('message').value.trim();

    const text =
      `Assalamu'alaikum Kahfi & Ririn, saya ${name}. ` +
      `Konfirmasi: ${attendance}.\n\nUcapan & doa: ${message}`;

    const url = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
  });
}

/* BAGIKAN UNDANGAN */
const shareBtn = document.getElementById('shareBtn');

if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: 'Undangan Kahfi & Ririn',
      text: 'Dengan bahagia, kami mengundang Anda ke pernikahan Kahfi & Ririn.',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        /* Pengguna membatalkan menu bagikan. */
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Tautan undangan disalin.');
      } catch (error) {
        window.prompt('Salin tautan undangan ini:', window.location.href);
      }
    }
  });
}

/* NAMA TAMU OTOMATIS DARI PARAMETER ?to= */
const guestParams = new URLSearchParams(window.location.search);
const guestName = guestParams.get('to')?.trim() || 'Tamu Undangan';

const coverGuest = document.getElementById('inviteGuestName');
const introGuest = document.getElementById('inviteGuestNameIntro');

if (coverGuest) coverGuest.textContent = guestName;
if (introGuest) introGuest.textContent = guestName;
