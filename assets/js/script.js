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

  setText('whereTitle', C.details.where.title);
  const whereContacts = document.getElementById('whereContacts');
  if (whereContacts) {
    whereContacts.replaceChildren(...C.details.where.contacts.map((c) => {
      const p = document.createElement('p');
      p.className = 'detail-sub';
      const a = document.createElement('a');
      a.href = `tel:${c.phone.replace(/\s+/g, '')}`;
      a.className = 'detail-phone-link';
      a.textContent = c.phone;
      p.append(`${c.name} · `, a);
      return p;
    }));
  }
  setLines('whereAddress', C.details.where.address);
  const whereMapLink = document.getElementById('whereMapLink');
  if (whereMapLink) {
    whereMapLink.href = C.details.where.mapUrl;
    whereMapLink.textContent = C.details.where.mapLabel;
  }
  setText('whenTitle', C.details.when.title);
  setLines('whenLines', C.details.when.lines);

  setText('rsvpBy', C.rsvp.by);
  const rsvpEmail = document.getElementById('rsvpEmail');
  if (rsvpEmail) {
    rsvpEmail.textContent = C.rsvp.email;
    rsvpEmail.href = `mailto:${C.rsvp.email}`;
  }
  setLines('rsvpNote', C.rsvp.note);

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
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

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
    setTimeout(() => {
      introGate.classList.add('gone');
      introVideo.pause();
    }, 900);
  }

  function openIntro() {
    if (introOpened) return;
    introOpened = true;
    introGate.classList.add('playing', 'buffering');
    introVideo.muted = false;
    introVideo.volume = 1;
    const started = introVideo.play();
    if (started && started.catch) {
      started.catch(() => {
        // sound was refused (rare after a real tap) — run it silently rather than not at all
        introVideo.muted = true;
        introVideo.play().catch(closeIntro);
      });
    }
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
  }
});
