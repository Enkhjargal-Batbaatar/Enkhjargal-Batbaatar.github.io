document.addEventListener('DOMContentLoaded', () => {
  const C = SITE_CONTENT;

  // ================= populate content from config =================
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.textContent = value;
  }

  document.title = `${C.coupleFirstName} & ${C.coupleSecondName} | We're Getting Married`;

  setText('invitedLine', C.invited.line);

  const eyebrowEl = document.getElementById('heroEyebrow');
  if (eyebrowEl) eyebrowEl.innerHTML = C.hero.eyebrow.split('\n').join('<br>');
  setText('heroNameA', C.coupleFirstName);
  setText('heroNameB', C.coupleSecondName);
  setText('closingNameA', C.coupleFirstName);
  setText('closingNameB', C.coupleSecondName);

  setText('celebrationLine', C.date.celebrationLine);
  setText('dateMonth', C.date.month);
  setText('dateWeekday', C.date.weekday);
  setText('dateDay', C.date.day);
  setText('dateTime', C.date.time);
  setText('dateYear', C.date.year);
  setText('receptionLine', C.date.receptionLine);

  setText('timelineHeading', C.timeline.heading);
  const timelineList = document.getElementById('timelineList');
  if (timelineList) {
    timelineList.innerHTML = C.timeline.items.map((item) => `
      <li>
        <span class="tl-label">${item.label}</span>
        <span class="tl-time">${item.time}</span>
      </li>
    `).join('');
  }

  setText('detailsHeadingSans', C.details.headingSans);
  setText('detailsHeadingScript', C.details.headingScript);

  setText('registryTitle', C.details.registry.title);
  const registryRow = document.getElementById('registryRow');
  if (registryRow) {
    registryRow.innerHTML = C.details.registry.items.map((item) => `
      <div class="qr-item">
        <svg viewBox="0 0 100 100" class="qr-code"><use href="#${item.symbol}"/></svg>
        <span>${item.label}</span>
      </div>
    `).join('');
  }

  setText('dressCodeTitle', C.details.dressCode.title);
  setText('dressCodeLabel', C.details.dressCode.label);

  setText('hotelTitle', C.details.hotel.title);
  const hotelLines = document.getElementById('hotelLines');
  if (hotelLines) {
    hotelLines.innerHTML = [C.details.hotel.name, ...C.details.hotel.lines].join('<br>');
  }

  setText('rsvpPlease', C.rsvp.please);
  setText('rsvpBy', C.rsvp.by);
  setText('rsvpEmail', C.rsvp.email);
  setText('rsvpNote', C.rsvp.note);

  const nameInput = document.getElementById('rsvpNameInput');
  if (nameInput) nameInput.placeholder = C.rsvp.form.namePlaceholder;
  setText('rsvpAttendYesLabel', C.rsvp.form.attendYes);
  setText('rsvpAttendNoLabel', C.rsvp.form.attendNo);
  const guestsInput = document.getElementById('rsvpGuestsInput');
  if (guestsInput) guestsInput.placeholder = C.rsvp.form.guestsPlaceholder;
  const messageInput = document.getElementById('rsvpMessageInput');
  if (messageInput) messageInput.placeholder = C.rsvp.form.messagePlaceholder;
  setText('rsvpSubmitBtn', C.rsvp.form.submit);
  setText('rsvpThanks', C.rsvp.form.thanks);

  // ================= scroll reveal =================
  const scroller = document.getElementById('scroller');
  const dots = document.querySelectorAll('.dot');
  const panels = document.querySelectorAll('.panel');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // --- active dot tracking ---
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

  // ================= envelope open -> invited -> hero =================
  const waxSeal = document.getElementById('waxSeal');
  const envelope = document.getElementById('envelope');
  const invitedPanel = document.getElementById('invited');
  const flutterButterfly = document.getElementById('flutterButterfly');

  if (waxSeal && envelope) {
    waxSeal.addEventListener('click', () => {
      if (envelope.classList.contains('opened')) return;
      envelope.classList.add('opened');

      setTimeout(() => {
        invitedPanel.scrollIntoView({ behavior: 'smooth' });
        if (flutterButterfly) flutterButterfly.classList.add('flutter-play');
        setTimeout(() => {
          document.getElementById('invitedLine').classList.add('in-view');
        }, 900);
        setTimeout(() => {
          document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
        }, 2600);
      }, 950);
    });
  }

  // ================= RSVP form (client-side only) =================
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpThanks = document.getElementById('rsvpThanks');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      rsvpForm.style.display = 'none';
      rsvpThanks.classList.add('show');
    });
  }
});
