// ---------- calendar ----------
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const daysEl = document.getElementById("days");
const titleEl = document.getElementById("cal-title");
const clockEl = document.getElementById("clock");

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

function renderCalendar() {
    const now = new Date();
    daysEl.textContent = "";
    titleEl.textContent = MONTHS[viewMonth] + " " + viewYear;

    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay(); // 0 = sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();
    const cells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    for (let i = 0; i < cells; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        const day = i - firstWeekday + 1;

        if (day < 1) {
            btn.textContent = daysInPrev + day;
            btn.className = "other";
        } else if (day > daysInMonth) {
            btn.textContent = day - daysInMonth;
            btn.className = "other";
        } else {
            btn.textContent = day;
            const isToday = day === now.getDate() &&
                viewMonth === now.getMonth() &&
                viewYear === now.getFullYear();
            if (isToday) btn.className = "today";
        }
        daysEl.appendChild(btn);
    }
}

function shiftMonth(delta) {
    viewMonth += delta;
    if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
    }
    if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
    }
    renderCalendar();
}

document.getElementById("cal-prev").addEventListener("click", () => shiftMonth(-1));
document.getElementById("cal-next").addEventListener("click", () => shiftMonth(1));
titleEl.addEventListener("click", () => {
    viewYear = new Date().getFullYear();
    viewMonth = new Date().getMonth();
    renderCalendar();
});
renderCalendar();

// ---------- navigation ----------
const pageFiles = {
    "index": "index.html",
    "about me": "about.html",
    "about": "about.html",
    "wishlist": "wish.html",
    "wish": "wish.html",
    "log": "log.html",
    "moodboard": "mood.html",
    "mood": "mood.html",
    "games": "games.html",
    "video games": "games.html",
    "diary": "games.html",
    "credits": "credits.html",
    "websites": "websites.html",
    "cool websites": "websites.html",
    "music": "music.html",
};

function navigateWithTransition(destination) {
    if (document.body.classList.contains("page-leaving")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.location.assign(destination);
        return;
    }

    document.body.classList.add("page-leaving");
    window.setTimeout(() => window.location.assign(destination), 180);
}

function loadPage(page) {
    if (typeof page !== "string") return;
    const pageKey = page.trim().toLowerCase().replace(/\.html$/, "");

    if (pageKey === "guestbook") {
        navigateWithTransition("index.html#guestbook");
        return;
    }

    const file = pageFiles[pageKey];
    if (file) navigateWithTransition(file);
}

// Route local page buttons; leave external-link buttons to their anchors.
document.querySelectorAll("[data-page]").forEach((el) => {
    el.addEventListener("click", () => loadPage(el.dataset.page));
});

// ---------- clock ----------
function tick() {
    if (!clockEl) return;
    clockEl.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}
tick();
setInterval(tick, 1000);