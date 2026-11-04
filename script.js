// ---------- calendar ----------
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const daysEl = document.getElementById("days");
const titleEl = document.getElementById("cal-title");

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

function renderCalendar() {
    const now = new Date();
    daysEl.textContent = "";
    titleEl.textContent = MONTHS[viewMonth] + " " + viewYear;

    const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
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

document.getElementById("cal-prev")?.addEventListener("click", () => shiftMonth(-1));
document.getElementById("cal-next")?.addEventListener("click", () => shiftMonth(1));
titleEl?.addEventListener("click", () => {
    viewYear = new Date().getFullYear();
    viewMonth = new Date().getMonth();
    renderCalendar();
});
renderCalendar();

// ---------- clock ----------
const clockEl = document.getElementById("clock");

function tick() {
    clockEl.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}
tick();
setInterval(tick, 1000);

// ---------- navigation ----------
const noticeEl = document.getElementById("notice");
const navButtons = document.querySelectorAll(".link-list button");
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
    "diary": "games.html",
    "credits": "credits.html",
    "websites": "websites.html",
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
    const pageKey = page.trim().toLowerCase().replace(/\.html$/, "");
    if (pageKey === "guestbook") {
        noticeEl.textContent = "guestbook is open — leave a note below!";
        document.getElementById("guestbook").scrollIntoView({
            behavior: "smooth"
        });
        return;
    }

    const file = pageFiles[pageKey];
    if (file) {
        navigateWithTransition(file);
        return;
    }

    navButtons.forEach((btn) => {
        btn.classList.toggle("selected", btn.dataset.page === page);
    });
    if (noticeEl) noticeEl.textContent = page + " page selected!";
}

// Route every directory button and the welcome-bar guestbook button.
document.querySelectorAll("[data-page]").forEach((el) => {
    el.addEventListener("click", () => loadPage(el.dataset.page));
});

// ---------- guestbook (Supabase) ----------
// Paste your project URL here (Supabase dashboard > Project Settings > API),
// e.g. "https://abcdefghijklmnop.supabase.co"
const SUPABASE_URL = "https://cfjkfrabsllolhpyfdyf.supabase.co";
const SUPABASE_KEY = "sb_publishable_sLWtGG0ylM3Lay-BJH7CnQ_wwduSbCT";

const GB_ENDPOINT = SUPABASE_URL + "/rest/v1/guestbook";
const GB_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json",
};

const gbForm = document.getElementById("guestbook-form");
const gbList = document.getElementById("gb-entries");

function renderEntries(rows) {
    gbList.textContent = "";

    if (!rows.length) {
        const empty = document.createElement("p");
        empty.className = "gb-empty";
        empty.textContent = "no entries yet... be the first to sign!";
        gbList.appendChild(empty);
        return;
    }

    rows.forEach((row) => {
        const entry = document.createElement("article");
        entry.className = "gb-entry";

        const head = document.createElement("b");
        const star = document.createElement("span");
        star.textContent = "*";
        const when = document.createElement("time");
        when.textContent = new Date(row.created_at).toLocaleString([], {
            month: "2-digit",
            day: "2-digit",
            year: "2-digit",
            hour: "numeric",
            minute: "2-digit",
        });
        // textContent (not innerHTML) so visitors can't inject HTML
        head.append(star, " " + row.name, when);

        const msg = document.createElement("p");
        msg.textContent = row.message;

        entry.append(head, msg);
        gbList.appendChild(entry);
    });
}

async function loadGuestbook() {
    if (SUPABASE_URL.startsWith("PASTE_")) {
        gbList.textContent = "";
        const note = document.createElement("p");
        note.className = "gb-empty";
        note.textContent = "guestbook not connected yet: add your SUPABASE_URL in the script.";
        gbList.appendChild(note);
        return;
    }
    try {
        const res = await fetch(GB_ENDPOINT + "?select=*&order=created_at.desc&limit=50", {
            headers: GB_HEADERS,
        });
        if (!res.ok) throw new Error(res.status);
        renderEntries(await res.json());
    } catch (err) {
        console.error("guestbook load failed:", err);
        noticeEl.textContent = "couldn't load the guestbook right now :(";
    }
}

gbForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = gbForm.elements.name.value.trim();
    const message = gbForm.elements.message.value.trim();
    if (!name || !message) return;

    const submitBtn = gbForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
        const res = await fetch(GB_ENDPOINT, {
            method: "POST",
            headers: {
                ...GB_HEADERS,
                Prefer: "return=minimal"
            },
            body: JSON.stringify({
                name,
                message
            }),
        });
        if (!res.ok) throw new Error(res.status);

        noticeEl.textContent = "thank you for signing my guestbook! <3";
        gbForm.reset();
        loadGuestbook();
    } catch (err) {
        console.error("guestbook sign failed:", err);
        noticeEl.textContent = "oops, your note didn't go through. try again?";
    } finally {
        submitBtn.disabled = false;
    }
});

loadGuestbook();