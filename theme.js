
(function () {
    const root = document.documentElement;
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    function apply(dark) {
        if (dark) root.dataset.theme = "dark";
        else delete root.dataset.theme;
        btn.textContent = dark ? "light mode" : "dark mode";
        btn.setAttribute("aria-pressed", String(dark));
    }

    apply(root.dataset.theme === "dark");

    btn.addEventListener("click", () => {
        const dark = root.dataset.theme !== "dark";
        apply(dark);
        try {
            localStorage.setItem("theme", dark ? "dark" : "light");
        } catch (e) { /* storage blocked: toggle still works for this visit */ }
    });
})();