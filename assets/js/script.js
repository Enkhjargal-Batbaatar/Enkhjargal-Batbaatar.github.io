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

  setText('ceremonyLabel', C.ceremony.label);
  setText('dateMonth', C.ceremony.month);
  setText('dateWeekday', C.ceremony.weekday);
  setText('dateDay', C.ceremony.day);
  setText('dateTime', C.ceremony.time);
  setText('dateYear', C.ceremony.year);
  setText('placeLine', C.ceremony.place);

  const timelineList = document.getElementById('timelineList');
  if (timelineList) {
    timelineList.replaceChildren(...C.timeline.map((item) => {
      const li = document.createElement('li');
      const what = document.createElement('p');
      what.className = 'tl-label';
      what.textContent = item.label;
      const when = document.createElement('p');
      when.className = 'tl-time';
      when.textContent = item.time;
      li.append(what, when);
      return li;
    }));
  }

  setText('whereTitle', C.details.where.title);
  setLines('whereLines', C.details.where.lines);
  setText('dressTitle', C.details.dress.title);
  setText('dressLabel', C.details.dress.label);
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
