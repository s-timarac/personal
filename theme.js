
(function () {
    const root = document.documentElement;
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    function apply(dark) {
        if (dark) root.dataset.theme = "dark";
        else delete root.dataset.theme;
        btn.textContent = dark ? "light mode" : "dark mode";
        btn.setAttribute("aria-pressed", String(dark));
        document.querySelectorAll("iframe[data-theme-aware]").forEach((iframe) => {
            const embedUrl = new URL(iframe.src);
            embedUrl.searchParams.set("theme", dark ? "0" : "1");
            if (iframe.src !== embedUrl.href) iframe.src = embedUrl.href;
        });
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