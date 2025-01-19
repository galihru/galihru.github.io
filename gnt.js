async function fetchGitHubRepos() {
    try {
        const response = await fetch("https://api.github.com/users/4211421036/repos");
        if (!response.ok) throw new Error("Failed to fetch GitHub repositories");
        const repos = await response.json();
        const container = document.getElementById("github-repos");

        if (!container) {
            console.error("Container 'github-repos' not found");
            return;
        }

        repos.forEach(repo => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img alt="GitHub" height="200" 
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
                    width="150"/>
                <p>${repo.name}</p>
                <p class="free">${repo.language || "No language"}</p>
                <p style="font-size: 12px">${repo.description || ""}</p>
                <a class="linkc" href="${repo.html_url}" target="_blank" 
                    style="color: #2d6cdf; text-decoration: none;">View Repository</a>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching GitHub repos:", error);
    }
}

function handleCardNavigation(direction) {
    const container = document.getElementById("github-repos");
    if (!container) {
        console.error("Container 'github-repos' not found");
        return;
    }

    const cards = Array.from(container.children);
    if (cards.length === 0) {
        console.warn("No cards found to navigate");
        return;
    }

    let cardToMove;
    if (direction === "next") {
        cardToMove = cards[0]; // Move the first card to the end
        if (cardToMove) {
            container.appendChild(cardToMove);
        }
    } else if (direction === "prev") {
        cardToMove = cards[cards.length - 1]; // Move the last card to the start
        if (cardToMove) {
            container.insertBefore(cardToMove, cards[0]);
        }
    }
}


async function fetchRepoImage(repo) {
    try {
        const response = await fetch(`https://api.github.com/repos/${repo.full_name}/contents`);
        if (!response.ok) throw new Error("Failed to fetch repository contents");
        const contents = await response.json();
        const imageFile = contents.find(file => 
            file.type === "file" && /\.(jpg|jpeg|png|gif)$/i.test(file.name)
        );
        return imageFile ? imageFile.download_url : "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";
    } catch (error) {
        console.error("Error fetching repository image:", error);
        return "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";
    }
}

async function updateCarouselContent() {
    try {
        let repos = await fetchGitHubRepos("4211421036");
        
        // Pastikan repos adalah array yang valid
        if (!Array.isArray(repos) || repos.length === 0) {
            console.error("No repositories found or invalid data format.");
            return; // Keluar jika repos tidak valid atau kosong
        }

        for (let i = 0; i < items.length && i < repos.length; i++) {
            let repo = repos[i];
            let image = await fetchRepoImage(repo);
            items[i].setAttribute("data-name", repo.name);
            items[i].setAttribute("data-description", repo.description || "No description available");
            items[i].setAttribute("data-url", repo.html_url);
            items[i].setAttribute("data-image", image);
            items[i].innerHTML = `
                <img src="${image}" alt="${repo.name}">
                <div class="overlay">
                    <h2>${repo.name}</h2>
                    <p>${repo.description || "No description available"}</p>
                    <button>
                        <a class="linkp" href="${repo.html_url}" target="_blank">View Repository</a>
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error updating carousel content:", error);
    }
}


function swapContent(direction) {
    const items = Array.from(document.querySelector(".carousel-track").children);

    if (direction === "next") {
        const firstItem = items[0];
        const firstItemData = {
            name: firstItem.getAttribute("data-name"),
            description: firstItem.getAttribute("data-description"),
            url: firstItem.getAttribute("data-url"),
            image: firstItem.getAttribute("data-image"),
        };

        for (let i = 0; i < items.length - 1; i++) {
            items[i].setAttribute("data-name", items[i + 1].getAttribute("data-name"));
            items[i].setAttribute("data-description", items[i + 1].getAttribute("data-description"));
            items[i].setAttribute("data-url", items[i + 1].getAttribute("data-url"));
            items[i].setAttribute("data-image", items[i + 1].getAttribute("data-image"));
            items[i].innerHTML = items[i + 1].innerHTML;
        }

        items[items.length - 1].setAttribute("data-name", firstItemData.name);
        items[items.length - 1].setAttribute("data-description", firstItemData.description);
        items[items.length - 1].setAttribute("data-url", firstItemData.url);
        items[items.length - 1].setAttribute("data-image", firstItemData.image);
        items[items.length - 1].innerHTML = `
            <img src="${firstItemData.image}" alt="${firstItemData.name}">
            <div class="overlay">
                <h2>${firstItemData.name}</h2>
                <p>${firstItemData.description}</p>
                <button>
                    <a class="linkp" href="${firstItemData.url}" target="_blank">View Repository</a>
                </button>
            </div>
        `;
    } else if (direction === "prev") {
        const lastItem = items[items.length - 1];
        const lastItemData = {
            name: lastItem.getAttribute("data-name"),
            description: lastItem.getAttribute("data-description"),
            url: lastItem.getAttribute("data-url"),
            image: lastItem.getAttribute("data-image"),
        };

        for (let i = items.length - 1; i > 0; i--) {
            items[i].setAttribute("data-name", items[i - 1].getAttribute("data-name"));
            items[i].setAttribute("data-description", items[i - 1].getAttribute("data-description"));
            items[i].setAttribute("data-url", items[i - 1].getAttribute("data-url"));
            items[i].setAttribute("data-image", items[i - 1].getAttribute("data-image"));
            items[i].innerHTML = items[i - 1].innerHTML;
        }

        items[0].setAttribute("data-name", lastItemData.name);
        items[0].setAttribute("data-description", lastItemData.description);
        items[0].setAttribute("data-url", lastItemData.url);
        items[0].setAttribute("data-image", lastItemData.image);
        items[0].innerHTML = `
            <img src="${lastItemData.image}" alt="${lastItemData.name}">
            <div class="overlay">
                <h2>${lastItemData.name}</h2>
                <p>${lastItemData.description}</p>
                <button>
                    <a class="linkp" href="${lastItemData.url}" target="_blank">View Repository</a>
                </button>
            </div>
        `;
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
    await fetchGitHubRepos();
    await updateCarouselContent();
});

document.querySelector(".repo-next")?.addEventListener("click", () => handleCardNavigation("next"));
document.querySelector(".repo-prev")?.addEventListener("click", () => handleCardNavigation("prev"));

const nextButton = document.querySelector(".carousel-next");
const prevButton = document.querySelector(".carousel-prev");

nextButton?.addEventListener("click", () => swapContent("next"));
prevButton?.addEventListener("click", () => swapContent("prev"));
