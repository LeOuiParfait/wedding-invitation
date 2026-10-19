'use client';

import { useEffect } from 'react';

export default function Home() {
  const MAP_CEREMONY = 'https://www.google.com/maps/search/?api=1&query=%C3%89glise%20Protestante%20du%20Nazar%C3%A9en%20La%20Vie%20%C3%89ternelle%203%20all%C3%A9e%20Jean%20Image%2077200%20Torcy';
  const MAP_RECEPTION = 'https://www.google.com/maps/search/?api=1&query=Salle%20Millennium%2015%20Rue%20Ferdinand%20de%20Lesseps%2091350%20Grigny';
  useEffect(() => {
(() => {
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  const startReveals = () => revealEls.forEach(el => revealObserver.observe(el));

  const intro = document.getElementById('introOverlay');
  if (intro) {
    document.body.classList.add('intro-lock');
    let finished = false, started = false;
    const endIntro = () => {
      if (finished) return;
      finished = true;
      intro.remove();
      document.body.classList.remove('intro-lock');
      startReveals();
      startMusic();
    };
    const begin = () => {
      if (started || finished) return;
      started = true;
      intro.classList.add('open');
      startReveals();
      startMusic();
      setTimeout(() => {
        finished = true;
        document.body.classList.remove('intro-lock');
        intro.remove();
      }, 2100);
    };
    intro.addEventListener('click', begin);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') endIntro(); });
  } else {
    startReveals();
  }

  const counter = document.querySelector('.counter');
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const pad = (v, s = 2) => String(v).padStart(s, '0');

  function updateCountdown() {
    if (!counter) return;
    const target = new Date(counter.dataset.target).getTime();
    const distance = Math.max(0, target - Date.now());
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    daysEl.textContent = pad(days, 3);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const RSVP_WEBHOOK = 'https://script.google.com/macros/s/AKfycbz2BKd6w9haHDhUcnSES6cNxGFKgiqpZlDI2gCebaP8TJM9-n28rk26fXkl_8EZ6J2mmA/exec'; // URL de ton Apps Script (https://script.google.com/macros/s/.../exec)
  const form = document.getElementById('rsvpForm');
  const status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      localStorage.setItem('reponseInvitation07082027', JSON.stringify(data));
      if (RSVP_WEBHOOK) {
        const mail = {
          'Nom et prénom': data.nom,
          'Présence': data.presence,
          'Email': data.email,
          'Cérémonie — Église, Torcy': data.ceremonie ? 'Oui' : 'Non',
          'Réception — Salle Millennium, Grigny': data.reception ? 'Oui' : 'Non',
          "Nombre de personnes": data.invites,
        };
        Object.keys(data).forEach((k) => {
          const m = k.match(/^invite_(\d+)_(nom|presence|enfant)$/);
          if (!m) return;
          const label = { nom: 'Nom', presence: 'Présence', enfant: 'Enfant' }[m[2]];
          mail['Invité ' + m[1] + ' — ' + label] = data[k];
        });
        if (data.message) mail['Petit mot'] = data.message;
        try {
          await fetch(RSVP_WEBHOOK, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(mail)
          });
        } catch (err) { /* reponse gardee sur l'appareil */ }
      }
      const accepte = String(data.presence || '').startsWith('Oui');
      document.getElementById('rsvpModalName').textContent = data.nom ? data.nom.split(' ')[0] : '';
      document.getElementById('rsvpModalText').textContent = accepte
        ? 'Votre réponse a bien été envoyée et un mail de confirmation vient de partir vers votre boîte. On a tellement hâte de célébrer avec vous le 7 août 2027 !'
        : 'Votre réponse a bien été envoyée et un mail de confirmation vient de partir vers votre boîte. Vous nous manquerez, mais merci de nous avoir prévenus.';
      document.getElementById('rsvpModal').hidden = false;
      document.body.style.overflow = 'hidden';
      form.querySelector('button').textContent = 'RÉPONSE ENREGISTRÉE';
      form.reset();
      const gf = document.getElementById('guestFields');
      if (gf) gf.innerHTML = '';
    });
  }
  const rsvpModal = document.getElementById('rsvpModal');
  const closeRsvpModal = () => { rsvpModal.hidden = true; document.body.style.overflow = ''; };
  ['rsvpModalClose', 'rsvpModalOk'].forEach((id) => document.getElementById(id).addEventListener('click', closeRsvpModal));
  rsvpModal.querySelector('.rsvp-modal-backdrop').addEventListener('click', closeRsvpModal);

  const guestCount = document.getElementById('guestCount');
  const guestFields = document.getElementById('guestFields');
  if (guestCount && guestFields) {
    guestCount.addEventListener('change', () => {
      const total = parseInt(guestCount.value, 10) || 0;
      guestFields.innerHTML = '';
      for (let i = 2; i <= total; i++) {
        const row = document.createElement('div');
        row.className = 'guest-row';
        row.innerHTML =
          `<span class="guest-tag">INVITÉ(E) ${i}</span>` +
          `<input type="text" name="invite_${i}_nom" placeholder="Nom et prénom" required>` +
          `<div class="guest-opts">` +
          `<label class="radio-line"><input type="radio" name="invite_${i}_presence" value="Oui" required> <span>Présent(e)</span></label>` +
          `<label class="radio-line"><input type="radio" name="invite_${i}_presence" value="Non"> <span>Absent(e)</span></label>` +
          `<label class="radio-line"><input type="checkbox" name="invite_${i}_enfant" value="Oui"> <span>Enfant</span></label>` +
          `</div>`;
        guestFields.appendChild(row);
      }
    });
  }

  function startMusic() {
    const el = document.getElementById('weddingAudio');
    if (el && el.paused) {
      el.play().then(() => {
        const w = document.getElementById('musicWidget');
        const ic = document.getElementById('musicIcon');
        const btn = document.getElementById('musicButton');
        if (w) w.classList.add('playing');
        if (ic) ic.textContent = 'Ⅱ';
        if (btn) btn.setAttribute('aria-label', 'Mettre la musique en pause');
      }).catch(() => {});
    }
  }

  const audio = document.getElementById('weddingAudio');
  const button = document.getElementById('musicButton');
  const widget = document.getElementById('musicWidget');
  const icon = document.getElementById('musicIcon');
  if (audio && button) {
    button.addEventListener('click', async () => {
      try {
        if (audio.paused) {
          await audio.play();
          widget.classList.add('playing');
          icon.textContent = 'Ⅱ';
          button.setAttribute('aria-label', 'Mettre la musique en pause');
        } else {
          audio.pause();
          widget.classList.remove('playing');
          icon.textContent = '▶';
          button.setAttribute('aria-label', 'Lire la musique');
        }
      } catch (error) {
        alert('Ajoutez votre fichier MP3 dans public/musique.mp3 pour activer la musique.');
      }
    });
  }
})();
  }, []);

  return (
    <>
<div className="intro-overlay" id="introOverlay">
    <div className="door door-left"><div className="door-img"></div></div>
    <div className="door door-right"><div className="door-img"></div></div>
    <div className="intro-cta" aria-hidden="true">
      <span className="intro-script">vous avez reçu</span>
      <span className="intro-title">UNE INVITATION</span>
      <span className="intro-tagline">Un amour précieux, un rêve partagé, une histoire à célébrer.</span>
      <span className="intro-rule"></span>
      <span className="intro-open">Cliquez pour ouvrir</span>
    </div>
  </div>
  <main>
    <section className="hero section" id="accueil">
      <div className="hero-side hero-side-left" aria-hidden="true"></div>
      <div className="hero-side hero-side-right" aria-hidden="true"></div>
      <div className="hero-card reveal">
        <div className="hero-image"></div>
        <div className="hero-veil"></div>
        <div className="hero-content">
          <p className="hero-kicker">Une histoire d'amour, de foi et de lumière</p>
          <h1 className="hero-script">Oui, encore</h1>
          <div className="hero-rule"></div>
          <p className="hero-subtitle">NOUS VOUS INVITONS À CÉLÉBRER AVEC NOUS</p>
          <div className="hero-title">NOTRE HISTOIRE<br/><span>CONTINUE</span></div>
          <p className="couple-names"><span>Dalisseau</span><em>&</em><span>Nathalie</span></p>
          <p className="hero-copy">Entourés de ceux que nous aimons, nous ouvrirons une nouvelle page de notre histoire et renouvellerons notre engagement.</p>
          <div className="date-lockup" aria-label="7 août 2027">
            <span>07</span>
            <strong>AOÛT</strong>
            <span>2027</span>
          </div>
          <p className="hero-bottom">SAMEDI · 7 AOÛT 2027</p>
          <a className="scroll-cue" href="#compte-a-rebours" aria-label="Découvrir l'invitation"><span></span></a>
        </div>
      </div>
    </section>

    <section className="paper-section countdown-section section" id="compte-a-rebours">
      <svg className="ghost-heart" viewBox="0 0 200 180" aria-hidden="true"><path d="M100 160 28 91C-11 54 11 8 49 8c22 0 39 13 51 31 12-18 29-31 51-31 38 0 60 46 21 83l-72 69Z"/></svg>
      <div className="paper-inner countdown-inner reveal">
        <header className="section-heading">
          <span className="script-word">le</span>
          <h2>COMPTE À REBOURS</h2>
        </header>
        <p className="section-lead">Jusqu'au jour où nous célébrerons la suite de notre histoire.</p>
        <div className="counter" data-target="2027-08-07T00:00:00+02:00" aria-live="polite">
          <div><strong id="days">000</strong><span>JOURS</span></div>
          <em>:</em>
          <div><strong id="hours">00</strong><span>HEURES</span></div>
          <em>:</em>
          <div><strong id="minutes">00</strong><span>MINUTES</span></div>
          <em>:</em>
          <div><strong id="seconds">00</strong><span>SECONDES</span></div>
        </div>
        <img className="rings-img" src="/alliances.png" alt="Alliances entrelacées" />
        <p className="countdown-script">jusqu'à notre nouveau <span style={{whiteSpace:'nowrap'}}>« oui »</span></p>
      </div>
    </section>

    <section className="story-section section" id="notre-histoire">
      <div className="story-photo reveal" role="img" aria-label="Le couple devant un décor floral"></div>
      <div className="story-panel reveal">
        <header className="section-heading story-heading">
          <span className="script-word">notre</span>
          <h2>HISTOIRE D'AMOUR</h2>
          <p className="story-tagline">Un chemin de lumière à deux</p>
        </header>
        <div className="story-text">
          <p>L'amour n'est pas une destination où l'on arrive, mais un chemin que l'on choisit, jour après jour, de parcourir ensemble.</p>
          <p>Il y a quelques années, nos routes se sont rencontrées et, peu à peu, nos cœurs ont appris à battre au même rythme. Depuis, nous écrivons une histoire tissée de tendresse, de complicité, de patience et d'espérance, une histoire dont chaque page porte la trace de notre amour.</p>
          <p>Nous avons grandi l'un auprès de l'autre, traversé les saisons de la vie, accueilli les épreuves comme les joies et recueilli de précieux souvenirs. Aimer, c'est se tenir la main dans la lumière comme dans le noir, se pardonner avec douceur et choisir, chaque matin, de poursuivre le chemin côte à côte.</p>
          <p>Parce que Dieu est au centre de notre union, nous lui confions la suite de notre chemin. Qu'il guide nos pas, fortifie notre amour et nous aide à nous choisir encore, année après année.</p>
          <p>Le 7 août 2027, entourés de ceux que nous aimons, nous célébrerons une nouvelle page de notre histoire et renouvellerons notre engagement avec amour, confiance et espérance.</p>
          <p>Nous voulons continuer à rire, à prier, à rêver et à vieillir ensemble, main dans la main, le cœur tourné vers Dieu et l'avenir.</p>
        </div>
        <blockquote>
          « Ce que Dieu a uni, que l'homme ne le sépare pas. »
          <cite>Marc 10:9</cite>
        </blockquote>
        <p className="story-ending">Notre histoire continue…<br/><span>et le plus beau reste à écrire.</span></p>
      </div>
    </section>

    <section className="paper-section memories-section section" id="souvenirs">
      <div className="paper-inner memories-inner reveal">
        <header className="section-heading">
          <span className="script-word">nos</span>
          <h2>SOUVENIRS</h2>
        </header>
        <p className="section-lead">Quelques instants de notre chemin à deux.</p>
        <div className="gallery">
          <figure className="gallery-main"><img src="/couple-gallery-1.png" alt="Le couple devant un mur de fleurs, dans des tons lilas" /></figure>
          <figure className="gallery-secondary"><img src="/couple-gallery-2.jpg" alt="Le couple dans un jardin" /></figure>
          <figure className="gallery-third"><img src="/couple-gallery-3.jpg" alt="Portrait élégant du couple" /></figure>
        </div>
        <div className="memory-quote"><span>Deux chemins</span><b>une seule histoire</b></div>
      </div>
    </section>

    <section className="paper-section program-section section" id="programme">
      <div className="paper-inner program-inner reveal">
        <header className="section-heading">
          <span className="script-word">la</span>
          <h2>JOURNÉE</h2>
        </header>
        <p className="section-lead">Le programme détaillé et les horaires vous seront communiqués avec la confirmation de présence.</p>
        <div className="timeline">
          <div className="timeline-line" aria-hidden="true"></div>
          <article className="timeline-item">
            <div className="timeline-icon">♡</div><div className="timeline-dot"></div><div className="event"><h3>CÉRÉMONIE · 15H</h3><p>Église Protestante du Nazaréen <span style={{whiteSpace:'nowrap'}}>« La Vie Éternelle »</span> — <a className="map-link" href={MAP_CEREMONY} target="_blank" rel="noopener noreferrer">3 allée Jean Image, 77200 Torcy</a></p></div>
          </article>
          <article className="timeline-item">
            <div className="timeline-icon">◈</div><div className="timeline-dot"></div><div className="event"><h3>VIN D'HONNEUR · 19H</h3><p>Salle Millennium — <a className="map-link" href={MAP_RECEPTION} target="_blank" rel="noopener noreferrer">15 Rue Ferdinand de Lesseps, 91350 Grigny</a></p></div>
          </article>
        </div>
      </div>
    </section>

    <section className="paper-section details-section section" id="details">
      <div className="paper-inner details-inner reveal">
        <header className="section-heading">
          <span className="script-word">les</span>
          <h2>DÉTAILS</h2>
        </header>
        <div className="detail-card date-card">
          <span className="detail-label">DATE</span>
          <strong>7 août 2027</strong>
          <p>Réservez cette journée pour partager avec nous cette nouvelle étape.</p>
        </div>
        <div className="detail-divider"></div>
        <div className="detail-card">
          <span className="detail-label">THÈME</span>
          <strong>Blanc · Lilas · Argenté</strong>
          <p>Une atmosphère douce, lumineuse et élégante inspirée de notre palette.</p>
        </div>
      </div>
    </section>

    <section className="paper-section rsvp-section section" id="confirmation">
      <div className="paper-inner rsvp-inner reveal">
        <span className="rsvp-script">avec joie</span>
        <div className="rsvp-letters" aria-label="Confirmation"><span>OUI</span><span>JE VIENS</span></div>
        <p className="rsvp-deadline">Réponse souhaitée avant le <strong>30 avril 2027</strong></p>
          <p className="rsvp-copy">Merci de nous confirmer votre présence afin que nous puissions préparer cette journée avec soin.</p>
        <form className="rsvp-form" id="rsvpForm">
          <label><span>Votre nom</span><input type="text" name="nom" placeholder="Nom et prénom" required /></label>
          <label><span>Votre email</span><input type="email" name="email" placeholder="vous@exemple.com" required /></label>
          <label><span>Serez-vous présent(e) ?</span><select name="presence" required><option value="">Choisir</option><option>Oui, avec plaisir</option><option>Non, malheureusement</option></select></label><fieldset className="rsvp-venues"><legend>À quel moment serez-vous présent(e) ?</legend><label><input type="checkbox" name="ceremonie" value="Oui" /><span>La cérémonie — Église, Torcy</span></label><label><input type="checkbox" name="reception" value="Oui" /><span>La réception — Salle Millennium, Grigny</span></label></fieldset>
          <label><span>Nombre de personnes (vous compris)</span><select name="invites" id="guestCount" required><option value="">Choisir</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5+">5 ou plus</option></select></label>
          <div className="guest-fields" id="guestFields"></div>
          <label><span>Un petit mot</span><textarea name="message" rows="3" placeholder="Votre message (facultatif)"></textarea></label>
          <button className="rsvp-button" type="submit">CONFIRMER MA RÉPONSE</button>
        </form>
        <p className="form-status" id="formStatus" hidden>Merci, votre réponse a bien été prise en compte sur cet appareil.</p>
        <p className="thank-you">Merci</p>
      </div>
    </section>

    <section className="closing section" id="fin">
      <div className="closing-image"></div>
      <div className="closing-overlay"></div>
      <div className="closing-content reveal">
        <p className="closing-small">NOTRE HISTOIRE CONTINUE</p>
        <div className="closing-date"><span>07</span><i></i><span>AOÛT</span></div>
        <p className="closing-year">2027</p>
        <div className="closing-verse">« Ce que Dieu a uni, que l'homme ne le sépare pas. »<br/><span>Marc 10:9</span></div>
        <p className="closing-script">on vous attend</p>
      </div>
    </section>
  </main>

  <div className="rsvp-modal" id="rsvpModal" hidden>
    <div className="rsvp-modal-backdrop"></div>
    <div className="rsvp-modal-card" role="dialog" aria-modal="true" aria-label="Confirmation de réponse">
      <button className="rsvp-modal-close" id="rsvpModalClose" type="button" aria-label="Fermer">×</button>
      <span className="rsvp-modal-kicker">RÉPONSE ENREGISTRÉE</span>
      <span className="rsvp-modal-heart">♡</span>
      <h3>Merci <span id="rsvpModalName"></span></h3>
      <p id="rsvpModalText"></p>
      <button className="rsvp-button" id="rsvpModalOk" type="button">À TRÈS VITE</button>
    </div>
  </div>

  <div className="music-widget" id="musicWidget">
    <button id="musicButton" className="music-button" type="button" aria-label="Lire la musique"><span id="musicIcon">▶</span></button>
    <div className="music-meta"><span className="music-label">MUSIQUE</span><span className="music-track">Notre chanson</span></div>
    <div className="music-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  </div>
  <audio id="weddingAudio" src="/musique.mp3" preload="auto" loop />
    </>
  );
}
