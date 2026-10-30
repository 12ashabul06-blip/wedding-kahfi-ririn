const loading = document.getElementById('loading');

function hideLoading() {
  if (!loading) return;
  loading.classList.add('done');
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(hideLoading, 500);
});

window.addEventListener('load', hideLoading);
document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.go)?.scrollIntoView({behavior:'smooth'})));
const sections=[...document.querySelectorAll('.page')], navItems=[...document.querySelectorAll('.nav-item')];
const navTargets=['cover','couple','event','gallery','rsvp'];
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');const id=entry.target.id;navItems.forEach(a=>a.classList.toggle('selected',a.getAttribute('href')==='#'+id || (id==='intro'&&a.getAttribute('href')==='#cover') || (id==='story'&&a.getAttribute('href')==='#gallery') || (id==='gift'&&a.getAttribute('href')==='#gift') || (id==='closing'&&a.getAttribute('href')==='#gift')));}})},{threshold:.32});
sections.forEach(s=>{s.querySelectorAll('.section-heading,.person,.event-row,.story-head,.story-gallery,.gallery-grid,.wish-content,.closing-content').forEach(el=>el.classList.add('reveal'));observer.observe(s);});
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const audio=document.getElementById('bgMusic'),musicBtn=document.getElementById('musicBtn');
let playing=false, musicAttempted=false;
function updateMusicUI(){playing=!audio.paused;musicBtn.innerHTML=playing?'Ⅱ <span>Pause</span>':'♫ <span>Music</span>';musicBtn.setAttribute('aria-label',playing?'Jeda musik':'Putar musik');}
async function startWeddingMusic(){if(!audio||!audio.paused)return;try{await audio.play();musicAttempted=true;updateMusicUI();}catch(e){updateMusicUI();}}
musicBtn.addEventListener('click',async()=>{if(!audio.paused){audio.pause();updateMusicUI();}else{await startWeddingMusic();if(audio.paused)alert('Musik belum bisa diputar. Pastikan file images/music.mp3 sudah diunggah ke GitHub, lalu tekan tombol Music sekali lagi.');}});
// Musik mulai langsung saat tombol Buka Undangan ditekan (interaksi pengguna).
document.querySelectorAll('[data-go="intro"]').forEach(btn=>btn.addEventListener('click',()=>{startWeddingMusic();}));
// Jika tamu melewati cover dengan scroll/swipe, coba mulai musik saat halaman sesudah cover terlihat.
const musicStartObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting&&entry.target.id!=='cover'&&!musicAttempted){startWeddingMusic();}})},{threshold:.55});
sections.filter(section=>section.id!=='cover').forEach(section=>musicStartObserver.observe(section));
audio.addEventListener('play',updateMusicUI);audio.addEventListener('pause',updateMusicUI);
// Salin nomor rekening/DANA; placeholder belum bisa disalin.
document.querySelectorAll('[data-copy-target]').forEach(button=>button.addEventListener('click',async()=>{const target=document.getElementById(button.dataset.copyTarget);if(!target)return;const value=target.textContent.trim();if(value.startsWith('ISI_')){alert('Silakan ganti placeholder dengan nomor yang benar di index.html terlebih dahulu.');return;}try{await navigator.clipboard.writeText(value);const old=button.textContent;button.textContent='Berhasil disalin ✓';setTimeout(()=>button.textContent=old,1800);}catch(e){prompt('Salin nomor berikut:',value);}}));
document.getElementById('wishForm').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('guestName').value.trim(),att=document.getElementById('attendance').value,msg=document.getElementById('message').value.trim();const text=`Assalamu'alaikum Kahfi & Ririn, saya ${name}. Konfirmasi: ${att}.\n\nUcapan & doa: ${msg}`;const url='https://wa.me/?text='+encodeURIComponent(text);window.open(url,'_blank','noopener');});
document.getElementById('shareBtn').addEventListener('click',async()=>{const shareData={title:'Undangan Kahfi & Ririn',text:'Dengan bahagia, kami mengundang Anda ke pernikahan Kahfi & Ririn.',url:location.href};if(navigator.share){try{await navigator.share(shareData)}catch(e){}}else{try{await navigator.clipboard.writeText(location.href);alert('Tautan undangan disalin.')}catch(e){prompt('Salin tautan undangan ini:',location.href)}}});

/* NAMA TAMU UNDANGAN OTOMATIS */
const guestParams = new URLSearchParams(window.location.search);
const guestName = guestParams.get('to')?.trim() || 'Tamu Undangan';

const coverGuest = document.getElementById('inviteGuestName');
const introGuest = document.getElementById('inviteGuestNameIntro');

if (coverGuest) {
  coverGuest.textContent = guestName;
}

if (introGuest) {
  introGuest.textContent = guestName;
}
