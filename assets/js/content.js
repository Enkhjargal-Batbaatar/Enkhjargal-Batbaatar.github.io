/*
  All editable wording for the invitation lives here.
  To reuse this site for a different couple/event, change the values
  below only — nothing in index.html, style.css or script.js needs to
  change.

  Note: the intro (envelope opening, "you're cordially invited", and the
  "Adele & Oliver" hero names) is the actual source video
  (assets/video/intro.mp4), so that text is baked into the video pixels.
  coupleFirstName/coupleSecondName below only drive the closing frame and
  the page title — a different intro video is needed to change the names
  shown during playback.
*/
const SITE_CONTENT = {

  coupleFirstName: "Adele",
  coupleSecondName: "Oliver",

  date: {
    celebrationLine: "in the celebration of their",
    month: "august",
    weekday: "saturday",
    day: "24",
    time: "at 2:00 pm",
    year: "20XX",
    receptionLine: "reception to follow"
  },

  timeline: {
    heading: "timeline",
    items: [
      { label: "seating begins", time: "1:00" },
      { label: "ceremony", time: "2:00" },
      { label: "reception", time: "3:00" },
      { label: "party time", time: "4:30" },
      { label: "fireworks", time: "19:30" }
    ]
  },

  details: {
    headingSans: "the",
    headingScript: "details",
    registry: {
      title: "registry",
      items: [
        { label: "target", symbol: "qr-pattern-a" },
        { label: "amazon", symbol: "qr-pattern-b" }
      ]
    },
    dressCode: {
      title: "dress code",
      label: "formal attire"
    },
    hotel: {
      title: "recommended hotel",
      name: "the white pearl hotel miami",
      lines: ["398 ne 5th street", "miami, fl 33132"]
    }
  },

  rsvp: {
    please: "please",
    by: "by july 16, 20xx",
    email: "eliart@mail.com",
    note: "please include the names of all guests attending in your rsvp.",
    form: {
      namePlaceholder: "full name(s)",
      attendYes: "joyfully accepts",
      attendNo: "regretfully declines",
      guestsPlaceholder: "number of guests",
      messagePlaceholder: "a note for the couple (optional)",
      submit: "send rsvp",
      thanks: "thank you — your rsvp has been noted with love."
    }
  }

};
