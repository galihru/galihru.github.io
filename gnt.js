async function fetchGitHubRepos() {
    try {
        let t = await (await fetch("https://api.github.com/users/4211421036/repos")).json(), e = document.getElementById("github-repos"); t.forEach(t => {
            let i = document.createElement("div"); i.className = "card", i.innerHTML = `
    <img alt="GitHub" height="200" 
        src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
        width="150"/>
    <p>${t.name}</p>
    <p class="free">${t.language || "No language"}</p>
    <p style="font-size: 12px">${t.description || ""}</p>
    <a class="linkc" href="${t.html_url}" target="_blank" 
    style="color: #2d6cdf; text-decoration: none;">View Repository</a>
    `, e.appendChild(i)
        })
    } catch (i) { console.error("Error fetching GitHub repos:", i) }
} function handleCardNavigation(t) { let e = document.getElementById("github-repos"), i = Array.from(e.children); "next" === t ? e.appendChild(i[0]) : e.insertBefore(i[i.length - 1], i[0]) } document.querySelector(".repo-next").addEventListener("click", () => handleCardNavigation("next")), document.querySelector(".repo-prev").addEventListener("click", () => handleCardNavigation("prev")), fetchGitHubRepos(); const track = document.querySelector(".carousel-track"), items = Array.from(track.children), nextButton = document.querySelector(".carousel-next"), prevButton = document.querySelector(".carousel-prev"); let currentIndex = 0; function updateCarousel() { let t = items[currentIndex].getBoundingClientRect().width; track.style.transform = `translateX(-${currentIndex * t}px)` } async function fetchGitHubRepos(t) { let e = await fetch("https://api.github.com/users/4211421036/repos"); if (!e.ok) throw Error("Failed to fetch GitHub repositories"); return e.json() } async function fetchRepoImage(t) { let e = await fetch(`https://api.github.com/repos/${t.full_name}/contents`); if (!e.ok) throw Error("Failed to fetch repository contents"); let i = (await e.json()).find(t => "file" === t.type && /\.(jpg|jpeg|png|gif)$/i.test(t.name)); return i ? i.download_url : "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" } async function updateCarouselContent() {
    try {
        let t = await fetchGitHubRepos("4211421036"); for (let e = 0; e < items.length && !(e >= t.length); e++) {
            let i = t[e], a = await fetchRepoImage(i); items[e].setAttribute("data-name", i.name), items[e].setAttribute("data-description", i.description || "No description available"), items[e].setAttribute("data-url", i.html_url), items[e].setAttribute("data-image", a), items[e].innerHTML = `
                <img src="${a}" alt="${i.name}">
                <div class="overlay">
                    <h2>${i.name}</h2>
                    <p>${i.description || "No description available"}</p>
                    <button>
                        <a class="linkp" href="${i.html_url}" target="_blank">View Repository</a>
                    </button>
                </div>
            `}
    } catch (r) { console.error("Error fetching GitHub data:", r) }
} function swapContent(t) {
    if ("next" === t) {
        let e = { name: items[0].getAttribute("data-name"), description: items[0].getAttribute("data-description"), url: items[0].getAttribute("data-url"), image: items[0].getAttribute("data-image") }; for (let i = 0; i < items.length - 1; i++)items[i].setAttribute("data-name", items[i + 1].getAttribute("data-name")), items[i].setAttribute("data-description", items[i + 1].getAttribute("data-description")), items[i].setAttribute("data-url", items[i + 1].getAttribute("data-url")), items[i].setAttribute("data-image", items[i + 1].getAttribute("data-image")), items[i].innerHTML = items[i + 1].innerHTML; items[items.length - 1].setAttribute("data-name", e.name), items[items.length - 1].setAttribute("data-description", e.description), items[items.length - 1].setAttribute("data-url", e.url), items[items.length - 1].setAttribute("data-image", e.image), items[items.length - 1].innerHTML = `
            <img src="${e.image}" alt="${e.name}">
            <div class="overlay">
                <h2>${e.name}</h2>
                <p>${e.description}</p>
                <button>
                    <a class="linkp" href="${e.url}" target="_blank">View Repository</a>
                </button>
            </div>
        `} else {
        let a = { name: items[items.length - 1].getAttribute("data-name"), description: items[items.length - 1].getAttribute("data-description"), url: items[items.length - 1].getAttribute("data-url"), image: items[items.length - 1].getAttribute("data-image") }; for (let r = items.length - 1; r > 0; r--)items[r].setAttribute("data-name", items[r - 1].getAttribute("data-name")), items[r].setAttribute("data-description", items[r - 1].getAttribute("data-description")), items[r].setAttribute("data-url", items[r - 1].getAttribute("data-url")), items[r].setAttribute("data-image", items[r - 1].getAttribute("data-image")), items[r].innerHTML = items[r - 1].innerHTML; items[0].setAttribute("data-name", a.name), items[0].setAttribute("data-description", a.description), items[0].setAttribute("data-url", a.url), items[0].setAttribute("data-image", a.image), items[0].innerHTML = `
            <img src="${a.image}" alt="${a.name}">
            <div class="overlay">
                <h2>${a.name}</h2>
                <p>${a.description}</p>
                <button>
                    <a class="linkp" href="${a.url}" target="_blank">View Repository</a>
                </button>
            </div>
        `}
} nextButton.addEventListener("click", () => { swapContent("next") }), prevButton.addEventListener("click", () => { swapContent("prev") }), document.addEventListener("DOMContentLoaded", async () => { await updateCarouselContent(), updateCarousel() });
