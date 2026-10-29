const loading=document.getElementById('loading');
window.addEventListener('load',()=>setTimeout(()=>loading.classList.add('done'),650));
document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.go)?.scrollIntoView({behavior:'smooth'})));
const sections=[...document.querySelectorAll('.page')], navItems=[...document.querySelectorAll('.nav-item')];
const navTargets=['cover','couple','event','gallery','rsvp'];
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');const id=entry.target.id;navItems.forEach(a=>a.classList.toggle('selected',a.getAttribute('href')==='#'+id || (id==='intro'&&a.getAttribute('href')==='#cover') || (id==='story'&&a.getAttribute('href')==='#gallery') || (id==='gift'&&a.getAttribute('href')==='#rsvp')));}})},{threshold:.32});
sections.forEach(s=>{s.querySelectorAll('.section-heading,.person,.event-row,.story-head,.story-gallery,.gallery-grid,.wish-content,.closing-content').forEach(el=>el.classList.add('reveal'));observer.observe(s);});
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const audio=document.getElementById('bgMusic'),musicBtn=document.getElementById('musicBtn');let playing=false;musicBtn.addEventListener('click',async()=>{if(playing){audio.pause();playing=false;musicBtn.innerHTML='♫ <span>Music</span>';return}try{await audio.play();playing=true;musicBtn.innerHTML='Ⅱ <span>Pause</span>'}catch(e){alert('Tambahkan file musik bernama assets/music.mp3 untuk mengaktifkan musik.')}});
document.getElementById('wishForm').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('guestName').value.trim(),att=document.getElementById('attendance').value,msg=document.getElementById('message').value.trim();const text=`Assalamu'alaikum Kahfi & Ririn, saya ${name}. Konfirmasi: ${att}.\n\nUcapan & doa: ${msg}`;const url='https://wa.me/?text='+encodeURIComponent(text);window.open(url,'_blank','noopener');});
document.getElementById('shareBtn').addEventListener('click',async()=>{const shareData={title:'Undangan Kahfi & Ririn',text:'Dengan bahagia, kami mengundang Anda ke pernikahan Kahfi & Ririn.',url:location.href};if(navigator.share){try{await navigator.share(shareData)}catch(e){}}else{try{await navigator.clipboard.writeText(location.href);alert('Tautan undangan disalin.')}catch(e){prompt('Salin tautan undangan ini:',location.href)}}});
/* =================================
   WEDDING GIFT - COPY ACCOUNT NUMBER
   ================================= */

document.querySelectorAll(".gift-copy-btn").forEach(button => {
    button.addEventListener("click", async () => {
        const targetId = button.dataset.copy;
        const target = document.getElementById(targetId);

        if (!target) return;

        const accountNumber = target.textContent.trim();

        // Cegah nomor placeholder ikut disalin
        if (
            accountNumber.startsWith("NOMOR_") ||
            accountNumber.includes("NAMA_PEMILIK")
        ) {
            alert("Silakan masukkan nomor rekening atau DANA yang benar terlebih dahulu.");
            return;
        }

        try {
            await navigator.clipboard.writeText(accountNumber);

            const originalText = button.textContent;
            button.textContent = "Berhasil Disalin ✓";

            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);

        } catch (error) {
            // Alternatif untuk browser yang tidak mendukung Clipboard API
            window.prompt(
                "Salin nomor berikut:",
                accountNumber
            );
        }
    });
});
/* =====================================
   GLOBAL VIDEO & WEDDING MUSIC
   ===================================== */

(() => {
    const video = document.getElementById("globalBackgroundVideo");
    const music = document.getElementById("weddingMusic");
    const musicButton = document.getElementById("musicToggle");
    const musicIcon = document.getElementById("musicIcon");

    if (!video || !music) return;

    // Video background selalu senyap dan berulang
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    video.play().catch(() => {
        // Browser mungkin menunggu interaksi pengguna.
    });

    let musicStarted = false;

    async function startMusic() {
        if (!music.paused) {
            updateMusicButton();
            return;
        }

        try {
            await music.play();
            musicStarted = true;
            updateMusicButton();
        } catch (error) {
            // Jika autoplay diblokir, pengguna bisa menekan tombol musik.
            updateMusicButton();
        }
    }

    function updateMusicButton() {
        if (!musicButton) return;

        const playing = !music.paused;

        musicButton.classList.toggle("is-playing", playing);
        musicButton.setAttribute("aria-pressed", String(playing));
        musicButton.setAttribute(
            "aria-label",
            playing ? "Jeda musik" : "Putar musik"
        );

        if (musicIcon) {
            musicIcon.textContent = playing ? "♫" : "♪";
        }
    }

    // Tombol musik untuk memutar atau menjeda
    musicButton?.addEventListener("click", async () => {
        if (music.paused) {
            await startMusic();
        } else {
            music.pause();
            updateMusicButton();
        }
    });

    /*
     * Tombol Buka Undangan:
     * musik dimulai saat pengguna menekan tombol.
     * Tidak mengganggu fungsi buka undangan yang sudah ada.
     */
    document.querySelectorAll(
        "#openInvitation, .open-invitation, [data-open-invitation]"
    ).forEach(button => {
        button.addEventListener("click", () => {
            startMusic();
        });
    });

    /*
     * Jika pengunjung menggeser ke halaman kedua
     * atau halaman setelah cover, coba mulai musik.
     */
    const pages = document.querySelectorAll(".page");

    if (pages.length > 1 && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                const pageIndex = Array.from(pages).indexOf(entry.target);

                if (
                    entry.isIntersecting &&
                    pageIndex > 0 &&
                    !musicStarted
                ) {
                    startMusic();
                }
            }
        }, {
            threshold: 0.55
        });

        pages.forEach(page => observer.observe(page));
    }

    music.addEventListener("play", updateMusicButton);
    music.addEventListener("pause", updateMusicButton);

    updateMusicButton();
})();
