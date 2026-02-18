class CatalogItem {
  constructor({ title, type, author, year, genre, rating, description }) {
    this.title = title;
    this.type = type;
    this.author = author;
    this.year = Number(year);
    this.genre = genre;
    this.rating = Number(rating);
    this.description = description;
  }

  matchesFilter({ type, genre, query }) {
    const typeOk = !type || this.type.toLowerCase() === type.toLowerCase();
    const genreOk = !genre || this.genre.toLowerCase() === genre.toLowerCase();

    const q = (query || "").trim().toLowerCase();
    const queryOk =
      !q ||
      this.title.toLowerCase().includes(q) ||
      this.author.toLowerCase().includes(q) ||
      this.genre.toLowerCase().includes(q) ||
      this.type.toLowerCase().includes(q);

    return typeOk && genreOk && queryOk;
  }

  toCard(onClick) {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3";

    const card = document.createElement("div");
    card.className = "card item-card h-100";
    card.tabIndex = 0;
    
    card.addEventListener("click", () => onClick(this));
    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            onClick(this);
        }
    });

    const cardBody = document.createElement("div");
    cardBody.className = "card-body d-flex flex-column";

    const topRow = document.createElement("div");
    topRow.className = "d-flex justify-content-between align-items-start gap-2";

    const titleEl = document.createElement("h5");
    titleEl.className = "card-title mb-1";
    titleEl.textContent = this.title;

    const badge = document.createElement("span");
    badge.className = "badge badge-soft";
    badge.textContent = this.type;

    topRow.appendChild(titleEl);
    topRow.appendChild(badge);

    const meta = document.createElement("div");
    meta.className = "meta-line mt-2";
    meta.innerHTML = `
        <span><strong>Author:</strong> ${escapeHtml(this.author)}</span>
        <span><strong>Year:</strong> ${this.year}</span>
        <span><strong>Genre:</strong> ${escapeHtml(this.genre)}</span>
        <span><strong>Rating:</strong> ⭐${this.rating}</span>
    `;

    const hint = document.createElement("div");
    hint.className = "text-muted small mt-3 w-100";
    hint.textContent = this.description;

    cardBody.appendChild(topRow);
    cardBody.appendChild(meta);
    cardBody.appendChild(hint);
    card.appendChild(cardBody);
    col.appendChild(card);
    return col;
  }
}

let allItems = [];
let viewItems = [];

const elements = {
  fileInput: document.getElementById("csvFile"),
  searchInput: document.getElementById("searchInput"),
  typeFilter: document.getElementById("typeFilter"),
  genreFilter: document.getElementById("genreFilter"),
  sortSelect: document.getElementById("sortSelect"),
  resetBtn: document.getElementById("resetBtn"),
  demoBtn: document.getElementById("demoBtn"),
  statusArea: document.getElementById("statusArea"),
  resultCount: document.getElementById("resultCount"),
  activeFilters: document.getElementById("activeFilters"),
  resultsGrid: document.getElementById("resultsGrid"),
  emptyState: document.getElementById("emptyState"),
};

const detailsModal = new bootstrap.Modal(document.getElementById("detailsModal"));
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalDescription = document.getElementById("modalDescription");

function parseCSV(text) {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) return [];

  const header = lines[0];
  const expectedHeader = "title,type,author,year,genre,rating,description";
  if (header !== expectedHeader) {
    throw new Error(
      `Invalid header.\nExpected: ${expectedHeader}\nFound:    ${header}`
    );
  }

  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(",").map(p => p.trim());
    if (parts.length !== 7) {
      throw new Error(`Invalid number of fields on line ${i + 1}`);
    }
    
    const [title, type, author, year, genre, rating, description] = parts;
    items.push(
        new CatalogItem({ 
            title: title.trim(), 
            type: type.trim(), 
            author: author.trim(), 
            year: year.trim(), 
            genre: genre.trim(), 
            rating: rating.trim(), 
            description: description.trim() 
        })
    );
  }

  return items;
}

function setStatus(kind, message) {
    elements.statusArea.className = `alert alert-${kind}`;
    elements.statusArea.textContent = message;
    elements.statusArea.style.display = "block";
}

function escapeHtml(text) {
    return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uniqueSorted(values) {
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function setControlsEnabled(enabled) {
  const controls = [
    elements.typeFilter,
    elements.genreFilter,
    elements.sortSelect,
    elements.resetBtn,
  ];

  for (const el of controls) {
    if (!el) continue;

    if ("disabled" in el) {
      el.disabled = !enabled;
    }

    el.classList.toggle("disabled", !enabled);
    el.setAttribute("aria-disabled", (!enabled).toString());
  }
}

function getCriteria() {
  return {
    type: elements.typeFilter.value,
    genre: elements.genreFilter.value,
    query: elements.searchInput.value,
    sort: elements.sortSelect.value,
  };
}

function applyFiltersAndSort() {
  const criteria = getCriteria();

  viewItems = allItems.filter(item =>
    item.matchesFilter({
      type: criteria.type,
      genre: criteria.genre,
      query: criteria.query,
    })
  );

  sortItemsInPlace(viewItems, criteria.sort);

  render(viewItems, criteria);
}

function sortItemsInPlace(items, sortKey) {
  const byTitle = (a, b) => a.title.localeCompare(b.title);

  switch (sortKey) {
    case "year-asc":
      items.sort((a, b) => (a.year - b.year) || byTitle(a, b));
      break;
    case "year-desc":
      items.sort((a, b) => (b.year - a.year) || byTitle(a, b));
      break;
    case "rating-asc":
      items.sort((a, b) => (a.rating - b.rating) || byTitle(a, b));
      break;
    case "rating-desc":
      items.sort((a, b) => (b.rating - a.rating) || byTitle(a, b));
      break;
    case "title-desc":
      items.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "title-asc":
    default:
      items.sort(byTitle);
      break;
  }
}

function render(items, criteria) {
  elements.resultsGrid.innerHTML = "";

  elements.resultCount.textContent = String(items.length);

  const active = [];
  if (criteria.query.trim()) active.push(`Search: "${criteria.query.trim()}"`);
  if (criteria.type) active.push(`Type: ${criteria.type}`);
  if (criteria.genre) active.push(`Genre: ${criteria.genre}`);
  elements.activeFilters.textContent = active.length ? active.join(" • ") : "No filters";

  if (items.length === 0) {
    elements.emptyState.classList.remove("d-none");
    return;
  }
  elements.emptyState.classList.add("d-none");

  const frag = document.createDocumentFragment();
  for (const item of items) {
    frag.appendChild(item.toCard(openDetails));
  }
  elements.resultsGrid.appendChild(frag);
}

function openDetails(item) {
  modalTitle.textContent = item.title;
  modalMeta.innerHTML = `
    <span>${item.type}</span>
    <span>•</span>
    <span>${item.author}</span>
    <span>•</span>
    <span>${item.year}</span>
    <span>•</span>
    <span>${item.genre}</span>
    <span>•</span>
    <span class="text-nowrap">Rating ⭐${item.rating}</span>
    `;
  modalDescription.textContent = item.description;
  detailsModal.show();
}

function populateFilters(items) {
    const types = uniqueSorted(items.map(i => i.type).filter(t => t));
    elements.typeFilter.innerHTML = `<option value="">All</option>` + types.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("");

    const genres = uniqueSorted(items.map(i => i.genre).filter(g => g));
    elements.genreFilter.innerHTML = `<option value="">All</option>` + genres.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join("");
}

function loadItems(items) {
    allItems = items;

    if (allItems.length === 0) {
        setControlsEnabled(false);
        setStatus("warning", "No valid items found in the CSV.");
        render([], getCriteria());
        return;
    }

    setControlsEnabled(true);
    populateFilters(allItems);

    elements.typeFilter.value = "";
    elements.genreFilter.value = "";
    elements.searchInput.value = "";
    elements.sortSelect.value = "title-asc";

    setStatus("success", `Loaded ${allItems.length} items.`);
    applyFiltersAndSort();
}

elements.fileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const text = event.target.result;
            const items = parseCSV(text);
            loadItems(items);
        } catch (err) {
            console.error(err);
            setControlsEnabled(false);
            setStatus("danger", `Error parsing CSV: ${err.message}`);
            render([], getCriteria());
        }
    };

    reader.onerror = (event) => {
        console.error("File reading error:", event);
        setControlsEnabled(false);
        setStatus("danger", "Error reading file.");
    };

    reader.readAsText(file);
});

elements.searchInput.addEventListener("input", () => {
    applyFiltersAndSort();
});
elements.typeFilter.addEventListener("change", () => {
    applyFiltersAndSort();
});
elements.genreFilter.addEventListener("change", () => {
    applyFiltersAndSort();
});
elements.sortSelect.addEventListener("change", () => {
    applyFiltersAndSort();
});

elements.resetBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (!allItems.length) return;
  elements.searchInput.value = "";
  elements.typeFilter.value = "";
  elements.genreFilter.value = "";
  elements.sortSelect.value = "title-asc";
  applyFiltersAndSort();
});

elements.demoBtn.addEventListener("click", () => {
    const demoData = `title,type,author,year,genre,rating,description
Elden Ring,game,FromSoftware,2022,Action RPG,4.9,An open world fantasy action role playing game set in the Lands Between.
God of War Ragnarok,game,Santa Monica Studio,2022,Action Adventure,4.8,A cinematic mythological adventure following Kratos and Atreus.
Hades,game,Supergiant Games,2020,Roguelike,4.7,A fast paced dungeon crawler inspired by Greek mythology.
The Legend of Zelda Tears of the Kingdom,game,Nintendo,2023,Adventure,4.9,A vast open world adventure across sky islands and the kingdom of Hyrule.
Red Dead Redemption 2,game,Rockstar Games,2018,Open World,4.8,A story driven western epic set in a detailed open frontier world.
Stardew Valley,game,ConcernedApe,2016,Simulation,4.6,A farming simulation game focused on community crafting and exploration.
Cyberpunk 2077,game,CD Projekt Red,2020,RPG,4.2,A futuristic role playing game set in the sprawling Night City.
Minecraft,game,Mojang Studios,2011,Sandbox,4.8,A creative sandbox game where players build explore and survive in block worlds.
Hollow Knight,game,Team Cherry,2017,Metroidvania,4.7,A challenging atmospheric platform adventure set in a ruined kingdom.
Baldurs Gate 3,game,Larian Studios,2023,CRPG,4.9,A deep narrative driven role playing game based on Dungeons and Dragons.
`;
    try {
        const items = parseCSV(demoData);
        loadItems(items);
    } catch (err) {
        console.error(err);
        setControlsEnabled(false);
        setStatus("danger", `Error loading demo data: ${err.message}`);
        render([], getCriteria());
    }
});

setControlsEnabled(false);
setStatus("info", "Please upload a CSV file to get started.");
render([], getCriteria());

