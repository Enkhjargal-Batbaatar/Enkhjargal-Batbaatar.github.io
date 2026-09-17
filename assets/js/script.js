document.addEventListener('DOMContentLoaded', () => {
  const C = SITE_CONTENT;

  // ================= populate content from config =================
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.textContent = value;
  }
  function setLines(id, lines) {
    const el = document.getElementById(id);
    if (!el || !lines) return;
    el.replaceChildren();
    lines.forEach((line, i) => {
      if (i) el.appendChild(document.createElement('br'));
      el.appendChild(document.createTextNode(line));
    });
  }

  document.title = `${C.coupleFirstName} & ${C.coupleSecondName} | Хуримын урилга`;

  setText('tapHint', C.intro.tapHint);
  setText('introLoading', C.intro.loading);
  setText('skipHint', C.intro.skip);

  // each line reveals on its own, one after another down the verse
  const verseText = document.getElementById('verseText');
  if (verseText) {
    verseText.replaceChildren(...C.verse.map((line, i) => {
      const p = document.createElement('p');
      p.className = 'reveal';
      p.style.setProperty('--d', i + 1);
      p.textContent = line;
      return p;
    }));
  }

  setText('ceremonyLabel', C.ceremony.label);
  setText('dateMonth', C.ceremony.month);
  setText('dateWeekday', C.ceremony.weekday);
  setText('dateDay', C.ceremony.day);
  setText('dateTime', C.ceremony.time);
  setText('dateTimeLabel', C.ceremony.timeLabel);
  setText('dateYear', C.ceremony.year);
  setText('placeLine', C.ceremony.place);

  // ---- love story: a deck of photos the guest flicks sideways ----
  // Only worth a panel if there are cards. With none, the panel and its dot
  // come out before the observers below ever see them.
  const lovePanel = document.getElementById('love');
  const loveDeck = document.getElementById('loveDeck');
  const loveDotRow = document.getElementById('loveDots');
  const loveCards = (C.loveStory && C.loveStory.cards) || [];

  if (lovePanel && loveDeck && loveDotRow && loveCards.length) {
    setText('loveTitle', C.loveStory.title);

    const namesEl = document.getElementById('loveNames');
    if (namesEl) {
      const heart = document.createElement('span');
      heart.className = 'love-heart';
      heart.textContent = '\u2665';
      namesEl.replaceChildren(
        document.createTextNode(C.coupleFirstName),
        heart,
        document.createTextNode(C.coupleSecondName)
      );
    }

    const cards = loveCards.map((card, i) => {
      const fig = document.createElement('figure');
      fig.className = 'love-card';
      const img = document.createElement('img');
      img.src = card.src;
      img.alt = card.alt || '';
      // the two either side of the opening card are already half on screen
      img.loading = i < 3 ? 'eager' : 'lazy';
      img.decoding = 'async';
      fig.appendChild(img);
      if (card.quote) {
        const cap = document.createElement('figcaption');
        cap.className = 'love-quote';
        cap.textContent = card.quote;
        fig.appendChild(cap);
      }
      return fig;
    });
    loveDeck.replaceChildren(...cards);

    const loveDots = loveCards.map((_, i) => {
      const d = document.createElement('span');
      d.addEventListener('click', () => go(i));
      return d;
    });
    loveDotRow.replaceChildren(...loveDots);

    let active = 0;

    // Each card is placed by how far it sits from the one in focus: the
    // neighbours turn away and shrink, anything past the second is gone.
    const STEPS = [
      { x: 0,   s: 1,    r: 0,   o: 1,   z: 30 },
      { x: 58,  s: 0.84, r: -16, o: 0.9, z: 20 },
      { x: 100, s: 0.70, r: -22, o: 0.5, z: 10 },
      { x: 130, s: 0.62, r: -26, o: 0,   z: 0  }
    ];

    function layout() {
      cards.forEach((card, i) => {
        const offset = i - active;
        const dist = Math.min(Math.abs(offset), 3);
        const dir = Math.sign(offset);
        const step = STEPS[dist];
        card.style.setProperty('--x', (step.x * dir) + '%');
        card.style.setProperty('--s', step.s);
        card.style.setProperty('--r', (step.r * dir) + 'deg');
        card.style.opacity = step.o;
        card.style.zIndex = step.z;
        card.style.pointerEvents = dist >= 3 ? 'none' : 'auto';
        card.setAttribute('aria-hidden', dist >= 3 ? 'true' : 'false');
      });
      loveDots.forEach((d, i) => d.classList.toggle('on', i === active));
    }

    function go(i) {
      const next = Math.max(0, Math.min(cards.length - 1, i));
      if (next === active) return;
      active = next;
      layout();
    }

    // one pointer gesture covers both jobs: a drag turns the deck, a tap
    // brings whichever card was tapped into focus
    let downX = null, downY = null;
    loveDeck.addEventListener('pointerdown', (e) => {
      downX = e.clientX;
      downY = e.clientY;
    });
    loveDeck.addEventListener('pointerup', (e) => {
      if (downX === null) return;
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      downX = null;
      if (Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy)) {
        go(active + (dx < 0 ? 1 : -1));
        return;
      }
      const tapped = cards.indexOf(e.target.closest('.love-card'));
      if (tapped > -1) go(tapped);
    });
    loveDeck.addEventListener('pointercancel', () => { downX = null; });
    loveDeck.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { go(active - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(active + 1); e.preventDefault(); }
    });

    layout();
    lovePanel.hidden = false;
  } else if (lovePanel) {
    lovePanel.remove();
    const loveDot = document.querySelector('.dot[data-target="love"]');
    if (loveDot) loveDot.remove();
  }

  setText('whereTitle', C.where.title);
  setLines('whereAddress', C.where.address);
  const whereMapLink = document.getElementById('whereMapLink');
  if (whereMapLink) {
    whereMapLink.href = C.where.mapUrl;
    whereMapLink.textContent = C.where.mapLabel;
  }

  setText('closingNameA', C.coupleFirstName);
  setText('closingNameB', C.coupleSecondName);

  // ================= countdown =================
  // The target carries its own UTC offset, so the numbers are the time left
  // until that one instant no matter what clock the guest's phone is set to.
  const countdown = document.getElementById('countdown');
  if (countdown && C.countdown) {
    const target = new Date(C.countdown.target).getTime();
    const label = document.getElementById('countdownLabel');
    const row = document.getElementById('countdownRow');
    const fields = {
      days: document.getElementById('cdDays'),
      hours: document.getElementById('cdHours'),
      minutes: document.getElementById('cdMins'),
      seconds: document.getElementById('cdSecs')
    };

    setText('countdownLabel', C.countdown.label);
    setText('cdDaysCap', C.countdown.units.days);
    setText('cdHoursCap', C.countdown.units.hours);
    setText('cdMinsCap', C.countdown.units.minutes);
    setText('cdSecsCap', C.countdown.units.seconds);

    const pad = (n) => String(n).padStart(2, '0');
    let ticker = 0;

    function tick() {
      const left = target - Date.now();
      if (!Number.isFinite(left)) return;
      if (left <= 0) {
        clearInterval(ticker);
        countdown.classList.add('done');
        if (label) label.textContent = C.countdown.done;
        if (row) row.hidden = true;
        return;
      }
      const totalSeconds = Math.floor(left / 1000);
      fields.days.textContent = Math.floor(totalSeconds / 86400);
      fields.hours.textContent = pad(Math.floor(totalSeconds / 3600) % 24);
      fields.minutes.textContent = pad(Math.floor(totalSeconds / 60) % 60);
      fields.seconds.textContent = pad(totalSeconds % 60);
    }

    tick();
    ticker = setInterval(tick, 1000);
  }

  // ================= scroll reveal =================
  const dots = document.querySelectorAll('.dot');
  const panels = document.querySelectorAll('.panel');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.25 });

  // The first panel sits at scroll 0, so its reveals would otherwise play out
  // behind the intro gate and be over before the guest ever sees the page.
  // Hold every reveal until the gate is dismissed.
  let revealsStarted = false;
  function startReveals() {
    if (revealsStarted) return;
    revealsStarted = true;
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  }

  const dotObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        dots.forEach((d) => d.classList.remove('active'));
        const match = document.querySelector(`.dot[data-target="${entry.target.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  }, { threshold: 0.5 });
  panels.forEach((p) => dotObserver.observe(p));

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ================= intro gate =================
  // Tap anywhere -> the film runs with sound. It ends two seconds after the
  // names settle, and the gate cross-fades straight into the page below.
  const introGate = document.getElementById('introGate');
  const introVideo = document.getElementById('introVideo');
  const introAudio = document.getElementById('introAudio');
  const introTap = document.getElementById('introTap');
  const skipHint = document.getElementById('skipHint');

  let introOpened = false;
  let introClosed = false;

  function closeIntro() {
    if (introClosed) return;
    introClosed = true;
    introGate.classList.add('done');
    document.documentElement.classList.remove('gate-open');
    window.scrollTo(0, 0);
    startReveals();
    setTimeout(() => {
      introGate.classList.add('gone');
      introVideo.pause();   // the music is deliberately left running
    }, 900);
  }

  function openIntro() {
    if (introOpened) return;
    introOpened = true;
    introGate.classList.add('playing', 'buffering');

    // The film itself has no audio track — the music is its own element so it
    // can carry on playing into the page after the gate is gone.
    if (introAudio) {
      introAudio.volume = 1;
      const music = introAudio.play();
      if (music && music.catch) music.catch(() => {});
    }

    const started = introVideo.play();
    if (started && started.catch) started.catch(closeIntro);
  }

  if (introGate && introVideo) {
    introTap.addEventListener('click', openIntro);
    skipHint.addEventListener('click', closeIntro);
    introVideo.addEventListener('playing', () => introGate.classList.remove('buffering'));
    introVideo.addEventListener('waiting', () => introGate.classList.add('buffering'));
    introVideo.addEventListener('ended', closeIntro);
    introVideo.addEventListener('error', closeIntro);
  } else {
    document.documentElement.classList.remove('gate-open');
    startReveals();
  }
});
