// Smooth Scroll to Section
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Booking Form Event
document.querySelector('.booking-form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert("🎯 Slot booked successfully!");
    this.reset();
});
/* script.js
   Complete frontend JS for Sports Allocation System
   - Save as script.js and include in index.html (already present)
*/

/* ---------------------------
   Helper / Utility functions
   --------------------------- */
function qs(selector, root = document) {
  return root.querySelector(selector);
}
function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}
function safeJSONParse(s, fallback) {
  try { return JSON.parse(s) ?? fallback; } catch { return fallback; }
}

/* ---------------------------
   Smooth scroll helper
   --------------------------- */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth' });
}

/* ---------------------------
   Local storage keys & helpers
   --------------------------- */
const LS_KEYS = {
  BOOKINGS: 'sas_bookings_v1',       // array of booking objects
  REGISTRATIONS: 'sas_registrations_v1' // array of registrations
};

function loadBookings() {
  return safeJSONParse(localStorage.getItem(LS_KEYS.BOOKINGS), []);
}
function saveBookings(arr) {
  localStorage.setItem(LS_KEYS.BOOKINGS, JSON.stringify(arr));
}
function loadRegistrations() {
  return safeJSONParse(localStorage.getItem(LS_KEYS.REGISTRATIONS), []);
}
function saveRegistrations(arr) {
  localStorage.setItem(LS_KEYS.REGISTRATIONS, JSON.stringify(arr));
}

/* ---------------------------
   DOM-updating for Reports
   --------------------------- */
function updateReports() {
  // Grab dynamic values and set in the UI if elements exist
  const bookings = loadBookings();
  const regs = loadRegistrations();

  // derive stats
  const totalEvents = qsa('.event-card').length || 0;
  const totalParticipants = regs.length;
  const slotsBooked = bookings.length;

  // compute most popular sport
  const sportCount = bookings.reduce((acc, b) => {
    if (!b.sport) return acc;
    acc[b.sport] = (acc[b.sport] || 0) + 1;
    return acc;
  }, {});
  const mostPopularSport = Object.keys(sportCount).length
    ? Object.entries(sportCount).sort((a,b)=> b[1]-a[1])[0][0]
    : 'Football';

  // update report cards (simple approach: map by header text)
  qsa('.report-card').forEach(card => {
    const heading = (qs('h3', card)?.textContent || '').toLowerCase();
    if (heading.includes('total events')) {
      qs('p', card).textContent = totalEvents;
    } else if (heading.includes('total participants')) {
      qs('p', card).textContent = totalParticipants;
    } else if (heading.includes('slots booked')) {
      qs('p', card).textContent = slotsBooked;
    } else if (heading.includes('most popular sport')) {
      qs('p', card).textContent = mostPopularSport;
    }
  });
}

/* ---------------------------
   Booking Form
   --------------------------- */
function initBookingForm() {
  const form = qs('.booking-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const sport = form.querySelector('select')?.value || '';
    const date = form.querySelector('input[type="date"]')?.value || '';
    const time = form.querySelector('input[type="time"]')?.value || '';

    // basic validation
    if (!sport || !date || !time) {
      alert('Please select sport, date and time for the booking.');
      return;
    }

    // Create booking object
    const booking = {
      id: 'b_' + Date.now(),
      sport,
      date,
      time,
      createdAt: new Date().toISOString()
    };

    const bookings = loadBookings();
    bookings.push(booking);
    saveBookings(bookings);

    alert(`🎯 Slot booked successfully for ${sport} on ${date} at ${time}!`);
    form.reset();
    updateReports();
  });
}

/* ---------------------------
   Event Registration Form
   --------------------------- */
function initEventRegistrationForm() {
  const form = qs('.event-register-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const select = form.querySelector('select');
    const name = form.querySelector('input[type="text"]')?.value?.trim();
    const email = form.querySelector('input[type="email"]')?.value?.trim();
    const phone = form.querySelector('input[type="tel"]')?.value?.trim();

    if (!select?.value || !name || !email || !phone) {
      alert('Please fill all fields correctly for event registration.');
      return;
    }
    // simple phone pattern check (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      alert('Please enter a valid 10-digit contact number.');
      return;
    }

    const reg = {
      id: 'r_' + Date.now(),
      event: select.value,
      name,
      email,
      phone,
      createdAt: new Date().toISOString()
    };

    const regs = loadRegistrations();
    regs.push(reg);
    saveRegistrations(regs);

    alert(`✅ Registered ${name} to "${select.value}" successfully!`);
    form.reset();
    updateReports();
  });
}

/* ---------------------------
   Continuous Events Slider
   --------------------------- */
function initEventSlider() {
  const slider = qs('.event-slide');
  if (!slider) return;

  // only duplicate once
  if (!slider.dataset.duplicated) {
    const slideContent = slider.innerHTML;
    slider.innerHTML += slideContent;
    slider.dataset.duplicated = 'true';
  }

  // pause on hover for accessibility
  const parent = slider.parentElement;
  if (parent) {
    parent.addEventListener('mouseenter', () => {
      slider.style.animationPlayState = 'paused';
    });
    parent.addEventListener('mouseleave', () => {
      slider.style.animationPlayState = 'running';
    });
  }
}

/* ---------------------------
   Sports Card click -> Modal + prefill booking
   --------------------------- */
function createModal({ title, htmlContent, onClose }) {
  // simple accessible modal
  const overlay = document.createElement('div');
  overlay.className = 'sas-modal-overlay';
  overlay.style = `
    position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
    background:rgba(0,0,0,0.6); z-index:2000; padding:20px;
  `;

  const box = document.createElement('div');
  box.className = 'sas-modal';
  box.style = `
    background:white; color:#111; border-radius:10px; max-width:700px; width:100%;
    padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.3);
  `;
  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <h3 style="margin:0">${title}</h3>
      <button aria-label="Close modal" class="sas-modal-close" style="background:none;border:none;font-size:20px;cursor:pointer">✖</button>
    </div>
    <div style="margin-top:12px">${htmlContent}</div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  function close() {
    try { document.body.removeChild(overlay); } catch {}
    if (typeof onClose === 'function') onClose();
  }

  qs('.sas-modal-close', box).addEventListener('click', close);
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });

  return { close, overlay, box };
}

function initSportsCards() {
  const cards = qsa('.sports-grid .card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      // read sport name from h3 or alt attribute
      const sport = (qs('h3', card)?.textContent || qs('img', card)?.alt || 'Sport').trim();

      const content = `
        <p style="margin:8px 0">You selected <strong>${sport}</strong>.</p>
        <p style="margin:8px 0">Quick actions:</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="sas-book-now" style="background:#ffdd57;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">Book Slot for ${sport}</button>
          <button id="sas-view-info" style="background:#eee;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">View Sport Info</button>
        </div>
      `;

      const modal = createModal({
        title: sport,
        htmlContent: content
      });

      // hook buttons
      const btnBook = qs('#sas-book-now', modal.box);
      if (btnBook) {
        btnBook.addEventListener('click', () => {
          modal.close();
          // open page slot form and prefill sport
          const select = qs('.booking-form select');
          if (select) {
            select.value = sport;
            // gently scroll to form
            scrollToSection('slots');
            // focus date input
            setTimeout(() => qs('.booking-form input[type="date"]')?.focus(), 500);
          } else {
            alert('Booking form not found on this page.');
          }
        });
      }

      const btnInfo = qs('#sas-view-info', modal.box);
      if (btnInfo) {
        btnInfo.addEventListener('click', () => {
          alert(`${sport} is a great sport — have fun! (You can replace this with real info.)`);
        });
      }
    });
  });
}

/* ---------------------------
   Navigation: highlight active section
   --------------------------- */
function initNavHighlighting() {
  const navLinks = qsa('header nav a[href^="#"]');
  const sections = navLinks.map(a => {
    const id = a.getAttribute('href')?.slice(1);
    return { link: a, section: id ? document.getElementById(id) : null };
  });

  function onScroll() {
    const y = window.scrollY + (window.innerHeight * 0.2);
    let found = null;
    for (const pair of sections) {
      const el = pair.section;
      if (!el) continue;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (y >= top && y < bottom) { found = pair; break; }
    }

    sections.forEach(p => p.link.classList.toggle('active', p === found));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // run once
  onScroll();
}

/* ---------------------------
   Floating icons slight randomizer
   --------------------------- */
function initFloatingBgRandomizer() {
  const nodes = qsa('.floating-bg span');
  if (!nodes.length) return;
  nodes.forEach((n, i) => {
    // randomize small variations
    const delay = Math.random() * 12;
    const scale = 1 + Math.random() * 0.8;
    n.style.animationDelay = `${delay}s`;
    n.style.transform = `scale(${scale})`;
  });
  // refresh positions occasionally for visual interest
  setInterval(() => {
    nodes.forEach((n) => {
      n.style.left = `${10 + Math.random() * 80}%`;
      n.style.top = `${5 + Math.random() * 85}%`;
    });
  }, 8000);
}

/* ---------------------------
   Header shrinking on scroll (visual)
   --------------------------- */
function initHeaderScrollEffect() {
  const header = qs('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.style.padding = '8px 20px';
      header.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    } else {
      header.style.padding = '15px 30px';
      header.style.boxShadow = 'none';
    }
  }, { passive: true });
}

/* ---------------------------
   Small accessibility/help: keyboard shortcut to open booking (b)
   --------------------------- */
function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      scrollToSection('slots');
      qs('.booking-form select')?.focus();
    }
  });
}

/* ---------------------------
   Initialize everything
   --------------------------- */
function initAll() {
  initBookingForm();
  initEventRegistrationForm();
  initEventSlider();
  initSportsCards();
  initNavHighlighting();
  initFloatingBgRandomizer();
  initHeaderScrollEffect();
  initKeyboardShortcuts();

  // make sure reports reflect stored data
  updateReports();

  // animated sections: add small stagger for fade-up/fade-in classes
  document.querySelectorAll('.fade-in, .fade-up, .zoom').forEach((el, idx) => {
    el.style.animationDelay = `${Math.min(0.8, idx * 0.05)}s`;
  });

  // optional: reveal hero button after load
  setTimeout(() => qs('.hero button')?.classList.add('visible'), 400);
}

/* ---------------------------
   Defensive: wait for DOM
   --------------------------- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

/* ---------------------------
   Expose scrollToSection on window (index.html uses it inline)
   --------------------------- */
window.scrollToSection = scrollToSection;

// Event Registration Form Submission
document.querySelector('.event-register-form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert("✅ You have successfully registered for the event!");
    this.reset();
});

// Continuous Event Slider
const slider = document.querySelector('.event-slide');
const slideContent = slider.innerHTML;

// Duplicate content to create infinite loop
slider.innerHTML += slideContent;

// Optional: Pause slider on hover
slider.parentElement.addEventListener('mouseenter', () => {
    slider.style.animationPlayState = 'paused';
});
slider.parentElement.addEventListener('mouseleave', () => {
    slider.style.animationPlayState = 'running';
});

function initDetailedReports() {
  const btn = document.getElementById('view-detailed-reports');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const bookings = loadBookings();
    const regs = loadRegistrations();

    // Breakdown of bookings per sport
    const sportCount = bookings.reduce((acc, b) => {
      acc[b.sport] = (acc[b.sport] || 0) + 1;
      return acc;
    }, {});
    let sportList = Object.entries(sportCount)
      .map(([sport, count]) => `<li>${sport}: ${count}</li>`)
      .join('') || '<li>No bookings yet</li>';

    // List of upcoming events
    let eventsList = qsa('.event-card')
      .map(card => `<li>${qs('h3', card).textContent} — ${qs('p', card).textContent}</li>`)
      .join('');

    // Participant list (just names)
    let participants = regs.map(r => `<li>${r.name} (${r.event})</li>`).join('') || '<li>No participants yet</li>';

    createModal({
      title: 'Detailed Reports',
      htmlContent: `
        <h4>Bookings per Sport</h4>
        <ul>${sportList}</ul>
        <h4>Upcoming Events</h4>
        <ul>${eventsList}</ul>
        <h4>Registered Participants</h4>
        <ul>${participants}</ul>
      `
    });
  });
}
initDetailedReports();
