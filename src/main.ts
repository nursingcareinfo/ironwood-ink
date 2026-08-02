// ============================================================
// IRONWOOD INK — site logic
// Content is data-driven so it's trivial to swap placeholders
// for real photos / copy / booking backend later.
// ============================================================

const svgWrap = (inner: string) =>
  `<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

// Base-aware asset prefix: "/" in dev, "/ironwood-ink/" on GitHub Pages.
const BASE = import.meta.env.BASE_URL;

const MOTIFS: Record<string, string> = {
  japanese: svgWrap(`
    <path d="M22 74c2-26 12-40 30-46" opacity=".85"/>
    <path d="M20 70c4-8 8-12 14-14M34 52c8-4 16-6 26-6" opacity=".5"/>
    <path d="M30 62c6-2 12-2 18 0" opacity=".5"/>
    <circle cx="64" cy="30" r="6"/><circle cx="64" cy="30" r="2" fill="currentColor" stroke="none"/>
    <path d="M60 26c-4-6-4-12 0-16 6 2 8 8 8 14-3 1-6 2-8 2z" fill="currentColor" stroke="none"/>
    <path d="M70 24c5-3 10-3 14 0" opacity=".7"/>
    <path d="M18 78h60"/>`),
  traditional: svgWrap(`
    <path d="M48 18c-6-4-16-2-18 6-1 4 1 8 6 10-8 2-12 8-10 16 2 8 10 12 18 10"/>
    <path d="M48 18c6-4 16-2 18 6 1 4-1 8-6 10 8 2 12 8 10 16-2 8-10 12-18 10"/>
    <path d="M48 20v-4M48 76c-4 2-8 4-12 8M48 76c4 2 8 4 12 8"/>
    <circle cx="30" cy="44" r="4" fill="currentColor" stroke="none"/>
    <circle cx="66" cy="44" r="4" fill="currentColor" stroke="none"/>`),
  blackwork: svgWrap(`
    <path d="M38 30h20M34 42h28M36 30c-6 8-6 20 0 26M60 30c6 8 6 20 0 26"/>
    <path d="M42 30c-1 16 2 30 6 40 4-10 7-24 6-40" fill="currentColor" stroke="none" opacity=".9"/>
    <path d="M38 76c4 2 8 2 10 0M58 76c-4 2-8 2-10 0"/>`),
  fineline: svgWrap(`
    <path d="M48 84V36" stroke-width="1.4"/>
    <path d="M48 52c-10-2-16-8-18-18 12 2 18 8 18 18z" stroke-width="1.4"/>
    <path d="M48 40c10-2 16-8 18-18-12 2-18 8-18 18z" stroke-width="1.4"/>
    <path d="M48 66c-8-2-12-6-14-14 10 2 14 6 14 14z" stroke-width="1.4"/>
    <path d="M48 60c8-2 12-6 14-14-10 2-14 6-14 14z" stroke-width="1.4"/>
    <path d="M46 20c1-3 3-4 5-4M44 12c2-2 4-2 6-1" stroke-width="1.2" opacity=".8"/>`),
  neo: svgWrap(`
    <path d="M48 78V34"/>
    <path d="M48 38c-14-2-20-10-22-20 16 2 22 10 22 20z" fill="currentColor" stroke="none" opacity=".85"/>
    <path d="M48 30c12-2 18-8 20-16-14 0-20 6-20 16z" fill="currentColor" stroke="none" opacity=".6"/>
    <path d="M40 46c-6 0-10 6-8 12 2 6 8 8 16 8"/>
    <path d="M56 46c6 0 10 6 8 12-2 6-8 8-16 8"/>
    <circle cx="32" cy="40" r="2.4" fill="currentColor" stroke="none"/>
    <circle cx="64" cy="38" r="2.4" fill="currentColor" stroke="none"/>`),
  realism: svgWrap(`
    <path d="M20 44c0-16 12-26 28-26s28 10 28 26-12 26-28 26S20 60 20 44z"/>
    <circle cx="48" cy="44" r="15"/>
    <circle cx="48" cy="44" r="7"/>
    <circle cx="48" cy="44" r="2.6" fill="currentColor" stroke="none"/>
    <path d="M48 26c8-6 18-8 26-6M48 62c8 6 18 8 26 6" opacity=".6"/>`),
  dotwork: svgWrap(`
    <circle cx="48" cy="48" r="32" stroke-dasharray="1 4"/>
    <circle cx="48" cy="48" r="22" stroke-dasharray="1 3.5"/>
    <circle cx="48" cy="48" r="12" stroke-dasharray="1 3"/>
    <path d="M48 16v64M16 48h64M27 27l42 42M69 27L27 69" stroke-dasharray="1 3.5"/>
    <circle cx="48" cy="48" r="2" fill="currentColor" stroke="none"/>`),
  tribal: svgWrap(`
    <path d="M14 20h30M14 20c6 12 8 24 4 34M44 20c-6 10-8 22-4 34M14 54h26" fill="currentColor" stroke="none" opacity=".85"/>
    <path d="M52 28h30M52 28c-6 12-8 24-4 34M82 28c6 10 8 22 4 34M52 62h26" fill="currentColor" stroke="none" opacity=".85"/>
    <path d="M20 34c8 2 14 2 20 0M58 42c8 2 14 2 20 0" opacity=".9"/>`),
};

const STYLES = [
  { id: "japanese", name: "Japanese / Irezumi", tags: ["Bold", "Story-driven", "Timeless"], blurb: "Te-bori tradition reimagined — waves, koi, chrysanthemums, and backgrounds that breathe with the body." },
  { id: "traditional", name: "American Traditional", tags: ["Bold lines", "Classic palette", "Built to last"], blurb: "The old-school canon: roses, daggers, swallows, panthers. Heavy black, honest color, zero regrets." },
  { id: "blackwork", name: "Blackwork", tags: ["Solid black", "High contrast", "Graphic"], blurb: "Pure black saturation and negative space. From delicate dot shading to solid panels that read from across the room." },
  { id: "fineline", name: "Fine Line", tags: ["Delicate", "Botanical", "Minimal"], blurb: "Single-needle precision for jewelry-fine work: florals, script, and pieces that whisper instead of shout." },
  { id: "neo", name: "Neo-Traditional", tags: ["Illustrative", "Rich color", "Modern"], blurb: "Traditional bones with contemporary depth — painterly shading, expressive color, and motifs that tell your story." },
  { id: "realism", name: "Realism / Portrait", tags: ["Photographic", "Detail", "B&W or color"], blurb: "Portraits and photo-real work built from hours of reference study. The slowest style, and the most rewarding." },
  { id: "dotwork", name: "Dotwork", tags: ["Geometric", "Sacred geometry", "Texture"], blurb: "Mandala, sacred geometry and stippled texture — patience in ten thousand tiny points." },
  { id: "tribal", name: "Tribal / Polynesian", tags: ["Heritage", "Angular", "Flow"], blurb: "Bold angular patterns designed with respect for their heritage — and your anatomy, not a stencil catalog." },
];

const ARTISTS = [
  { init: "A", name: "Atif Inno", role: "Owner · Japanese & blackwork", bio: "Twenty years behind the machine, twelve of them apprenticed under a te-bori master in Osaka. Atif designs every irezumi background by hand — no two are alike.", specs: ["Irezumi", "Blackwork", "Te-bori"] },
  { init: "G", name: "GaGa", role: "Traditional & neo-traditional", bio: "Trained in a two-year apprenticeship on the American Traditional curriculum. GaGa's flash wall is a love letter to the 1940s — and color packing is second to none.", specs: ["Traditional", "Neo-trad", "Color"] },
  { init: "H", name: "Habil", role: "Fine line & realism", bio: "Ex-illustrator who found their forever medium in skin. Habil specializes in botanical fine line and high-detail portraits, with a waiting list to match the reputation.", specs: ["Fine line", "Portrait", "Botanical"] },
];

type Piece = {
  title: string;
  style: string;
  artist: string;
  year: string;
  gradient: string;
  motif: string;
  photo: string;
  note: string;
};

// Sample pieces — real photos (Wikimedia Commons, free license) with
// procedural SVG fallback if the image fails to load.
const PIECES: Piece[] = [
  { title: "Koi & Chrysanthemum", style: "Japanese", artist: "Atif", year: "2025", photo: BASE + "photos/piece-1.jpg", gradient: "radial-gradient(120% 120% at 30% 20%, rgba(179,18,44,.4), transparent 60%), radial-gradient(100% 100% at 80% 90%, rgba(11,8,6,.9), transparent 70%), #1c1410", motif: "japanese", note: "Full back piece, three sessions. The koi swims upstream — perseverance through the chrysanthemum field." },
  { title: "Dagger & Heart", style: "Neo-Traditional", artist: "GaGa", year: "2025", photo: BASE + "photos/piece-3.jpg", gradient: "radial-gradient(120% 120% at 70% 25%, rgba(192,122,63,.35), transparent 60%), linear-gradient(160deg, #1a1210, #0c0907)", motif: "neo", note: "Loyalty and betrayal in one image. Painted with a full spectrum — from butter yellow to oxblood." },
  { title: "Sleeve Draft 01", style: "Japanese", artist: "Atif", year: "2024", photo: BASE + "photos/piece-2.jpg", gradient: "radial-gradient(130% 130% at 65% 15%, rgba(233,224,210,.14), transparent 55%), linear-gradient(200deg, #191009, #0b0806)", motif: "japanese", note: "Wind bars and maple. The background is drawn to flow with the triceps — the hardest part of the sleeve." },
  { title: "Rose & Swallow", style: "Traditional", artist: "GaGa", year: "2024", photo: BASE + "photos/piece-12.jpg", gradient: "radial-gradient(120% 120% at 40% 30%, rgba(179,18,44,.45), transparent 60%), linear-gradient(180deg, #17110d, #0a0706)", motif: "traditional", note: "The classic 'returning home' pairing. Bold enough to read at ten paces, thirty years from now." },
  { title: "Portrait Study", style: "Realism", artist: "Habil", year: "2025", photo: BASE + "photos/piece-9.jpg", gradient: "radial-gradient(120% 120% at 50% 35%, rgba(233,224,210,.16), transparent 60%), linear-gradient(180deg, #151210, #080605)", motif: "realism", note: "B&W portrait from a single 1982 photograph. Six hours, one sitting, one needle." },
  { title: "Monstera Arm", style: "Fine Line", artist: "Habil", year: "2024", photo: BASE + "photos/piece-7.jpg", gradient: "radial-gradient(120% 120% at 60% 30%, rgba(192,122,63,.3), transparent 60%), linear-gradient(180deg, #14100c, #0a0706)", motif: "fineline", note: "Botanical fine line down the inner forearm. The veins follow the muscle — it moves when she moves." },
  { title: "Skull & Serpent", style: "Blackwork", artist: "Atif", year: "2024", photo: BASE + "photos/piece-5.jpg", gradient: "radial-gradient(120% 120% at 40% 25%, rgba(233,224,210,.12), transparent 55%), linear-gradient(180deg, #100d0a, #070504)", motif: "blackwork", note: "Solid-black skull with a negative-space serpent. Packed to 100% — no grey, no mercy." },
  { title: "Mandala Core", style: "Dotwork", artist: "GaGa", year: "2023", photo: BASE + "photos/piece-11.jpg", gradient: "radial-gradient(120% 120% at 50% 45%, rgba(179,18,44,.28), transparent 60%), linear-gradient(180deg, #140f0b, #0a0706)", motif: "dotwork", note: "Sacred geometry sternum piece. Eleven hours of stippling — every dot placed by hand." },
  { title: "Wave Sleeve", style: "Japanese", artist: "Atif", year: "2023", photo: BASE + "photos/piece-13.jpg", gradient: "radial-gradient(140% 140% at 25% 80%, rgba(192,122,63,.3), transparent 60%), radial-gradient(100% 100% at 80% 20%, rgba(179,18,44,.3), transparent 55%), #171009", motif: "japanese", note: "Seigaiha waves with a rising sun shoulder cap. The sleeve's edge was left raw — a 'jump line' on purpose." },
  { title: "Hannya Half", style: "Neo-Traditional", artist: "GaGa", year: "2023", photo: BASE + "photos/piece-10.jpg", gradient: "radial-gradient(130% 130% at 60% 30%, rgba(179,18,44,.4), transparent 60%), linear-gradient(180deg, #171009, #0a0706)", motif: "neo", note: "Hannya mask with tiger lily. The anger mask, the flower of pride — a study in contrast." },
];

const FAQS = [
  { q: "Do you take walk-ins?", a: "We hold a walk-in window Saturday 11:00–13:00 for small pieces (up to palm-sized). Everything else starts with a consultation — we design custom work, so there's no clip-art wall." },
  { q: "How much will it hurt?", a: "Honestly: it stings. Placement matters more than size — ribs and elbows are spicy, forearms and thighs are friendly. We're experienced with first-timers and nervous clients; breaks are free and unlimited." },
  { q: "How do I look after it?", a: "You leave with a full aftercare kit and a printed guide. Short version: keep it clean, keep it moisturized, keep it out of the sun, and don't pick. We also do a free check-up at 2–4 weeks." },
  { q: "Can you cover an old tattoo?", a: "Often yes. Heavy black or dense color may need laser first — we'll assess honestly at consultation and tell you the truth, even when the truth is 'leave it alone'." },
  { q: "How far out are you booking?", a: "Consultations run 1–3 weeks out. Sessions book 6–8 weeks ahead; back pieces and large sleeves 3–6 months. The waitlist deposit locks your place at the quoted price." },
  { q: "Color or black and grey?", a: "That's a design conversation, not a preference poll. We'll advise based on your skin tone, the motif, and how the piece will age. We'd rather design it right than color it wrong." },
];

// ---------- render helpers ----------

const el = (html: string) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild as HTMLElement;
};

function renderStyles() {
  const grid = document.getElementById("styles-grid")!;
  STYLES.forEach((s, i) => {
    const card = el(`
      <article class="style-card reveal">
        <span class="num">${String(i + 1).padStart(2, "0")}</span>
        <div class="motif" style="color: var(--bone);">${MOTIFS[s.id]}</div>
        <h3>${s.name}</h3>
        <div class="tags">${s.tags.map((t) => `<span>${t}</span>`).join("")}</div>
        <p>${s.blurb}</p>
      </article>`);
    grid.appendChild(card);
  });
}

function renderArtists() {
  const grid = document.getElementById("artists-grid")!;
  ARTISTS.forEach((a) => {
    grid.appendChild(el(`
      <article class="artist-card reveal">
        <div class="artist-photo"><span class="monogram">${a.init}</span></div>
        <div class="artist-body">
          <h3>${a.name}</h3>
          <div class="role">${a.role}</div>
          <p>${a.bio}</p>
          <div class="specs">${a.specs.map((s) => `<span>${s}</span>`).join("")}</div>
        </div>
      </article>`));
  });
}

function pieceWash(p: Piece) {
  return `<div class="ink-wash" style="background: ${p.gradient}">
    <img class="wash-img" src="${p.photo}" alt="${p.title}"
         onerror="this.classList.add('err')" />
    <div class="wash-fallback" style="color: var(--bone);">
      <div style="width: 55%; opacity: .9; filter: drop-shadow(0 0 18px rgba(0,0,0,.5));">${MOTIFS[p.motif]}</div>
    </div>
  </div>`;
}

function renderGallery() {
  const grid = document.getElementById("gallery-grid")!;
  const filters = document.getElementById("gallery-filters")!;

  const styles = ["All", ...new Set(PIECES.map((p) => p.style))];
  styles.forEach((s) => {
    const btn = el(`<button class="filter-btn ${s === "All" ? "active" : ""}" data-filter="${s}">${s}</button>`);
    btn.addEventListener("click", () => {
      filters.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter!;
      grid.querySelectorAll<HTMLElement>(".piece").forEach((piece) => {
        piece.style.display = f === "All" || piece.dataset.style === f ? "" : "none";
      });
    });
    filters.appendChild(btn);
  });

  PIECES.forEach((p, i) => {
    const piece = el(`
      <figure class="piece reveal" data-style="${p.style}" data-idx="${i}">
        ${pieceWash(p)}
        <figcaption class="cap"><strong>${p.title}</strong><span>${p.style} · ${p.artist} · ${p.year}</span></figcaption>
      </figure>`);
    piece.addEventListener("click", () => openLightbox(i));
    grid.appendChild(piece);
  });
}

function openLightbox(i: number) {
  const p = PIECES[i];
  const box = document.getElementById("lightbox")!;
  document.getElementById("lightbox-art")!.innerHTML = pieceWash(p) + "";
  const art = document.getElementById("lightbox-art")!;
  art.innerHTML = "";
  art.appendChild(el(pieceWash(p)));
  document.getElementById("lightbox-title")!.textContent = p.title;
  document.getElementById("lightbox-meta")!.textContent = `${p.style} · ${p.artist} · ${p.year} — sample portfolio piece`;
  document.getElementById("lightbox-note")!.textContent = p.note;
  box.classList.add("open");
  document.body.style.overflow = "hidden";
}

function renderFaq() {
  const list = document.getElementById("faq-list")!;
  FAQS.forEach((f) => {
    const item = el(`
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">${f.q}<span class="chev">+</span></button>
        <div class="faq-a"><p>${f.a}</p></div>
      </div>`);
    const q = item.querySelector(".faq-q")!;
    const a = item.querySelector(".faq-a") as HTMLElement;
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      item.classList.toggle("open");
      q.setAttribute("aria-expanded", String(!open));
      a.style.maxHeight = open ? "0px" : `${a.scrollHeight + 20}px`;
    });
    list.appendChild(item);
  });
}

function wireBooking() {
  const form = document.getElementById("booking-form") as HTMLFormElement;
  const ok = document.getElementById("form-ok")!;

  // Real submission via FormSubmit (no-signup email endpoint).
  // TODO: replace with the studio's real inbox (FormSubmit confirms by email
  // on first use), or a proper backend / Formspree.
  const BOOKING_ENDPOINT = "https://formsubmit.co/ajax/hello@ironwood.ink";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const val = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement).value.trim();
    const name = val("f-name");
    const email = val("f-email");
    const phone = val("f-phone");
    const style = val("f-style");
    const placement = val("f-placement");
    const month = val("f-date");
    const message = val("f-msg");

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    let firstBad: HTMLElement | null = null;
    const check = (id: string, pass: boolean): HTMLElement | null => {
      // ids live on the input/select elements themselves (see index.html)
      const input = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
      input.style.borderColor = pass ? "" : "var(--blood-bright)";
      return pass ? null : input;
    };
    const bad1 = check("f-name", name.length >= 2);
    const bad2 = check("f-email", validEmail);
    const bad3 = check("f-style", !!style);
    const bad4 = check("f-placement", !!placement);
    firstBad = bad1 ?? bad2 ?? bad3 ?? bad4;
    if (firstBad) { firstBad.focus(); return; }

    const submit = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    submit.disabled = true;
    submit.textContent = "Sending…";

    const payload = {
      _subject: `Ironwood Ink consult — ${name}`,
      _template: "table",
      _captcha: "false",
      name, email, phone, style, placement, month,
      message: message || "—",
    };

    try {
      const res = await fetch(BOOKING_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`formsubmit ${res.status}`);
      ok.textContent = "Thanks — your request is in. We'll be in touch within 48 hours with consultation options.";
      ok.classList.add("show");
      form.reset();
    } catch (err) {
      // Graceful fallback: open the user's mail client with the request prefilled.
      const subject = encodeURIComponent(`Ironwood Ink consult — ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nStyle: ${style}\nPlacement: ${placement}\nMonth: ${month || "—"}\nIdea: ${message || "—"}`);
      ok.innerHTML = `Direct submission failed (${err instanceof Error ? err.message : "network"}) — <a href="mailto:hello@ironwood.ink?subject=${subject}&body=${body}" style="color: var(--bone); text-decoration: underline;">send it by email instead</a>, or call us at +1 (555) 014-2246.`;
      ok.classList.add("show");
      ok.style.borderColor = "var(--blood)";
    } finally {
      submit.disabled = false;
      submit.textContent = "Request consultation";
      ok.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
}

function wireReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((n) => io.observe(n));
}

function wireLightboxClose() {
  const box = document.getElementById("lightbox")!;
  const close = () => {
    box.classList.remove("open");
    document.body.style.overflow = "";
  };
  document.getElementById("lightbox-close")!.addEventListener("click", close);
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

renderStyles();
renderArtists();
renderGallery();
renderFaq();
wireBooking();
wireLightboxClose();
wireReveal();
