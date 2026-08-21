/**
 * Logika façade + kontrol kustom.
 * Referensi keputusan: VIDEO_EMBED.md §2 dan §4.
 *
 * CATATAN PENTING — parameter yang TIDAK dipakai dan alasannya:
 *   modestbranding=1  -> tidak berfungsi sejak 15 Agustus 2023. Sengaja dihapus.
 *   showinfo=0        -> tidak berfungsi sejak 2018.
 * rel=0 TETAP dipakai, tapi ia hanya membatasi rekomendasi ke channel yang sama.
 * Karena itu semua video WAJIB dari satu channel resmi (RULES V-8).
 */

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const FALLBACK_TIMEOUT_MS = 5000;
let apiLoading: Promise<void> | null = null;

/** Muat IFrame API hanya setelah klik Play pertama di halaman (façade — RULES V-4). */
function loadYouTubeApi(): Promise<void> {
  if (apiLoading) return apiLoading;
  apiLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api"; // butuh entri di CSP script-src
    s.async = true;
    s.onerror = () => reject(new Error("iframe_api gagal dimuat"));
    (window as any).onYouTubeIframeAPIReady = () => resolve();
    document.head.appendChild(s);
  });
  return apiLoading;
}

/** AuditLog — SECURITY §7 / RULES V-10. Asinkron, gagal diam-diam, tidak menunda pemutaran. */
function logAudit(
  eventType: string,
  itemId: string,
  meta: Record<string, unknown> = {},
) {
  try {
    const body = JSON.stringify({
      event_type: eventType,
      target_type: "archive_item",
      target_id: itemId,
      metadata: { ...meta, referrer_path: location.pathname },
    });
    navigator.sendBeacon?.(
      "/api/audit",
      new Blob([body], { type: "application/json" }),
    );
  } catch {
    /* pencatatan tidak boleh menggagalkan pemutaran */
  }
}

function showFallback(root: HTMLElement) {
  const box = root.querySelector<HTMLElement>("[data-fallback]");
  if (!box) return;
  const actions = box.querySelector<HTMLElement>(
    ".arsip-player__fallback-actions",
  )!;
  const mp4 = root.dataset.fallbackMp4;
  const transcript = root.dataset.transcriptHref;
  actions.innerHTML = "";

  if (mp4) {
    const a = document.createElement("a");
    a.className = "btn btn--primary";
    a.href = mp4;
    a.textContent = "Putar dari server Arsip Hidup";
    actions.appendChild(a);
  }
  if (transcript) {
    const a = document.createElement("a");
    a.className = "btn";
    a.href = transcript;
    a.textContent = "Baca transkrip lengkap";
    actions.appendChild(a);
  }
  const req = document.createElement("a");
  req.className = "btn";
  req.href = "/terlibat/akses-arsip";
  req.textContent = "Ajukan akses arsip lengkap";
  actions.appendChild(req);

  box.hidden = false;
  root
    .querySelector<HTMLElement>(".arsip-player__frame")
    ?.setAttribute("hidden", "");
}

function mountYouTube(root: HTMLElement, videoId: string) {
  const frame = root.querySelector<HTMLElement>(".arsip-player__frame")!;
  const host = document.createElement("div");
  host.className = "arsip-player__iframe-host";
  frame.innerHTML = "";
  frame.appendChild(host);

  const timer = window.setTimeout(
    () => showFallback(root),
    FALLBACK_TIMEOUT_MS,
  );

  loadYouTubeApi()
    .then(() => {
      const YT = (window as any).YT;
      const player = new YT.Player(host, {
        videoId,
        host: "https://www.youtube-nocookie.com", // VIDEO_EMBED §1
        playerVars: {
          autoplay: 1,
          rel: 0, // membatasi ke channel sendiri, BUKAN mematikan
          iv_load_policy: 3,
          controls: 0, // kita menyediakan kontrol sendiri (jalur resmi API)
          disablekb: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: location.origin,
          hl: "id",
          cc_lang_pref: "id",
        },
        events: {
          onReady: () => {
            clearTimeout(timer);
            hardenIframe(host);
            wireControls(root, player);
          },
          onStateChange: (e: any) => {
            const S = (window as any).YT.PlayerState;
            if (e.data === S.PLAYING) {
              logAudit("video.play", root.dataset.itemId!, {
                source: "youtube",
                tier: "public",
              });
            }
            if (e.data === S.ENDED) {
              // Cegah end-screen YouTube tanpa menutupi elemen player (RULES V-7).
              player.stopVideo();
              showAfterPanel(root);
              logAudit("video.complete", root.dataset.itemId!, {
                source: "youtube",
              });
            }
          },
          onError: () => {
            clearTimeout(timer);
            showFallback(root);
          },
        },
      });
    })
    .catch(() => {
      clearTimeout(timer);
      showFallback(root);
    });
}

/**
 * Atribut keamanan iframe (RULES V-6).
 * Yang melindungi bukan `allow-same-origin` — iframe berasal dari origin lain,
 * jadi ia hanya mendapat origin-nya sendiri. Yang melindungi adalah apa yang
 * TIDAK diberikan: tanpa allow-popups (tab ke youtube.com diblokir browser),
 * tanpa allow-top-navigation (iframe tidak bisa membajak halaman induk).
 */
function hardenIframe(host: HTMLElement) {
  const iframe = host.querySelector("iframe") ?? (host as HTMLIFrameElement);
  if (!(iframe instanceof HTMLIFrameElement)) return;
  iframe.setAttribute(
    "sandbox",
    "allow-scripts allow-same-origin allow-presentation",
  );
  iframe.setAttribute(
    "allow",
    "autoplay; encrypted-media; fullscreen; picture-in-picture",
  );
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  iframe.setAttribute("loading", "lazy");
  // TODO(uji manual): sandbox + fullscreen bermasalah di sebagian browser.
  // Uji Safari iOS, Chrome Android, Firefox desktop sebelum go-live (VIDEO_EMBED §4.2).
}

function showAfterPanel(root: HTMLElement) {
  const t = root.dataset.transcriptHref;
  const panel = document.createElement("div");
  panel.className = "arsip-player__after";
  panel.innerHTML = `<p>Selesai.</p>${t ? `<a class="btn" href="${t}">Transkrip lengkap</a>` : ""}`;
  root.appendChild(panel);
}

/** Kontrol kustom — DESIGN §5.2. Keyboard wajib berfungsi penuh. */
function wireControls(root: HTMLElement, player: any) {
  const bar = root.querySelector<HTMLElement>("[data-controls]");
  if (!bar) return;
  bar.hidden = false;

  const q = (a: string) =>
    bar.querySelector(`[data-act="${a}"]`) as HTMLElement;
  const toggle = q("toggle") as HTMLButtonElement;
  const seek = q("seek") as HTMLInputElement;
  const time = q("time");
  const rate = q("rate") as HTMLButtonElement;
  const rates = [1, 1.25, 1.5, 0.75];
  let rateIdx = 0;

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  toggle.addEventListener("click", () => {
    const playing = player.getPlayerState() === 1;
    playing ? player.pauseVideo() : player.playVideo();
    toggle.setAttribute("aria-pressed", String(!playing));
    toggle.textContent = playing ? "▶" : "‖";
  });
  seek.addEventListener("input", () => {
    player.seekTo((Number(seek.value) / 1000) * player.getDuration(), true);
  });
  (q("mute") as HTMLButtonElement).addEventListener("click", (e) => {
    const b = e.currentTarget as HTMLButtonElement;
    const muted = player.isMuted();
    muted ? player.unMute() : player.mute();
    b.setAttribute("aria-pressed", String(!muted));
  });
  (q("volume") as HTMLInputElement).addEventListener("input", (e) => {
    player.setVolume(Number((e.target as HTMLInputElement).value));
  });
  rate.addEventListener("click", () => {
    rateIdx = (rateIdx + 1) % rates.length;
    player.setPlaybackRate(rates[rateIdx]);
    rate.textContent = `${rates[rateIdx]}×`;
  });
  (q("fs") as HTMLButtonElement).addEventListener("click", () => {
    root.querySelector(".arsip-player__frame")?.requestFullscreen?.();
  });

  setInterval(() => {
    if (!player.getDuration) return;
    const d = player.getDuration() || 1;
    const c = player.getCurrentTime() || 0;
    seek.value = String(Math.round((c / d) * 1000));
    if (time) time.textContent = `${fmt(c)} / ${fmt(d)}`;
  }, 500);

  root.addEventListener("keydown", (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    const map: Record<string, () => void> = {
      " ": () => toggle.click(),
      arrowright: () => player.seekTo(player.getCurrentTime() + 5, true),
      arrowleft: () =>
        player.seekTo(Math.max(0, player.getCurrentTime() - 5), true),
      arrowup: () => player.setVolume(Math.min(100, player.getVolume() + 10)),
      arrowdown: () => player.setVolume(Math.max(0, player.getVolume() - 10)),
      m: () => (q("mute") as HTMLButtonElement).click(),
      f: () => (q("fs") as HTMLButtonElement).click(),
    };
    if (map[k]) {
      e.preventDefault();
      map[k]();
    }
  });
}

function init() {
  document
    .querySelectorAll<HTMLElement>("[data-arsip-player]")
    .forEach((root) => {
      const btn = root.querySelector<HTMLButtonElement>(".arsip-player__play");
      btn?.addEventListener(
        "click",
        () => {
          const id = root.dataset.videoId ?? "";
          if (root.dataset.videoSource === "youtube" && YT_ID.test(id)) {
            mountYouTube(root, id);
          } else {
            showFallback(root);
          }
        },
        { once: true },
      );
    });
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", init)
  : init();
