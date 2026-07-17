const productForm = document.querySelector("#product-form");
const imageInput = document.querySelector("#product-images");
const uploadZone = document.querySelector(".upload-zone");
const imagePreview = document.querySelector("#image-preview");
const formMessage = document.querySelector("#form-message");
const inventoryList = document.querySelector("#inventory-list");
const inventoryCount = document.querySelector("#inventory-count");
const importInput = document.querySelector("#import-catalog");
const githubForm = document.querySelector("#github-form");
const connectionStatus = document.querySelector("#connection-status");
const connectionDot = document.querySelector("#connection-dot");

let processedImages = [];
let imageTask = Promise.resolve([]);
let githubConnected = false;
let busy = false;

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const formatPrice = (price) => `${new Intl.NumberFormat("pl-PL").format(Number(price) || 0)} zł`;

const showMessage = (message, isError = false) => {
  formMessage.textContent = message;
  formMessage.classList.toggle("error", isError);
};

const setBusy = (nextBusy) => {
  busy = nextBusy;
  productForm.querySelector(".admin-submit").disabled = busy;
  githubForm.querySelector(".github-connect").disabled = busy;
  inventoryList.querySelectorAll("button").forEach((button) => {
    button.disabled = busy;
  });
};

const setConnection = (connected, message, isError = false) => {
  githubConnected = connected;
  connectionDot.classList.toggle("connected", connected);
  connectionStatus.textContent = message;
  connectionStatus.classList.toggle("error", isError);
};

const compressImage = (file) => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  image.onload = () => {
    const maxSize = 1400;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.fillStyle = "#f1efe9";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    URL.revokeObjectURL(objectUrl);
    resolve(canvas.toDataURL("image/jpeg", 0.8));
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error(`Nie udało się odczytać pliku ${file.name}.`));
  };

  image.src = objectUrl;
});

const renderImagePreview = () => {
  imagePreview.innerHTML = processedImages.map((image, index) => `
    <figure>
      <img src="${image}" alt="Podgląd zdjęcia ${index + 1}" />
      <span>${index + 1}</span>
    </figure>
  `).join("");
};

const processFiles = async (fileList) => {
  const files = Array.from(fileList)
    .filter((file) => file.type.startsWith("image/"))
    .slice(0, 4);

  if (!files.length) {
    processedImages = [];
    renderImagePreview();
    showMessage("Wybierz przynajmniej jedno zdjęcie telefonu.", true);
    return [];
  }

  showMessage("Przygotowuję zdjęcia…");
  try {
    processedImages = await Promise.all(files.map(compressImage));
    renderImagePreview();
    showMessage(`Gotowe: ${processedImages.length} ${processedImages.length === 1 ? "zdjęcie" : "zdjęcia"}.`);
    return processedImages;
  } catch (error) {
    processedImages = [];
    renderImagePreview();
    showMessage(error.message, true);
    return [];
  }
};

const selectFiles = (files) => {
  imageTask = processFiles(files);
};

imageInput.addEventListener("change", () => selectFiles(imageInput.files));

["dragenter", "dragover"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadZone.classList.remove("is-dragging");
  });
});

uploadZone.addEventListener("drop", (event) => selectFiles(event.dataTransfer.files));

const renderInventory = () => {
  const products = window.AurenzoCatalog.get();
  inventoryCount.textContent = products.length;
  inventoryList.innerHTML = products.length ? products.map((product) => `
    <article class="inventory-item ${product.active ? "" : "is-hidden-product"}" data-id="${escapeHtml(product.id)}">
      <div class="inventory-thumb">
        ${product.images?.[0]
          ? `<img src="${escapeHtml(product.images[0])}" alt="" />`
          : `<span>${escapeHtml(product.title.replace("iPhone", "").trim().slice(0, 2) || "A")}</span>`}
      </div>
      <div class="inventory-details">
        <span>${product.active ? "Widoczny w sklepie" : "Ukryty"} · ${escapeHtml(product.condition)}</span>
        <h3>${escapeHtml(product.title)}</h3>
        <p>${escapeHtml(product.storage)} · ${formatPrice(product.price)}</p>
        <div class="inventory-actions">
          <button type="button" data-action="toggle">${product.active ? "Ukryj" : "Pokaż"}</button>
          <button class="delete-product" type="button" data-action="delete">Usuń</button>
        </div>
      </div>
    </article>
  `).join("") : "<p class=\"inventory-empty\">Brak telefonów w katalogu.</p>";
};

const publishProducts = async (products, message) => {
  const normalized = window.AurenzoCatalog.normalize(products);
  if (githubConnected) {
    await window.AurenzoGitHub.saveCatalog(normalized, message);
    return true;
  }
  window.AurenzoCatalog.set(normalized);
  return false;
};

githubForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(githubForm);
  setBusy(true);
  setConnection(false, "Łączę z repozytorium…");

  try {
    window.AurenzoGitHub.configure({
      owner: data.get("owner"),
      repo: data.get("repo"),
      branch: data.get("branch"),
    }, data.get("token"));
    await window.AurenzoGitHub.connect();
    githubForm.querySelector("[name=token]").value = "";
    githubForm.querySelector("[name=token]").placeholder = "Token aktywny w tej karcie";
    const settings = window.AurenzoGitHub.getSettings();
    setConnection(true, `Połączono z ${settings.owner}/${settings.repo}. Zmiany będą publikowane na branchu ${settings.branch}.`);
    showMessage("Oferta z GitHuba została wczytana.");
  } catch (error) {
    setConnection(false, error.message, true);
  } finally {
    setBusy(false);
  }
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const images = await imageTask;
  if (!images.length) {
    showMessage("Najpierw dodaj przynajmniej jedno zdjęcie telefonu.", true);
    return;
  }

  const data = new FormData(productForm);
  const title = String(data.get("title")).trim();
  const price = Number(data.get("price"));
  const id = `phone-${Date.now()}`;
  setBusy(true);

  try {
    showMessage(githubConnected ? "Wysyłam zdjęcia i publikuję ofertę…" : "Zapisuję lokalny podgląd…");
    const imagePaths = githubConnected
      ? await window.AurenzoGitHub.uploadImages(id, images)
      : images;
    const product = {
      id,
      title,
      price,
      year: data.get("year"),
      storage: data.get("storage"),
      color: String(data.get("color")).trim(),
      condition: data.get("condition"),
      battery: String(data.get("battery")).trim(),
      badge: String(data.get("badge")).trim(),
      className: "phone-natural",
      categories: [title.toLowerCase().includes("pro") ? "pro" : "", price <= 3500 ? "value" : ""].filter(Boolean),
      images: imagePaths,
      active: true,
    };
    const nextProducts = [product, ...window.AurenzoCatalog.get()];
    const published = await publishProducts(nextProducts, `Aurenzo: dodaj ${title}`);
    productForm.reset();
    processedImages = [];
    imageTask = Promise.resolve([]);
    renderImagePreview();
    showMessage(published
      ? `${title} został opublikowany. GitHub Pages może potrzebować około minuty na odświeżenie.`
      : `${title} zapisano tylko lokalnie. Połącz GitHub, aby ofertę widzieli klienci.`);
    document.querySelector("#inventory-title").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    setBusy(false);
  }
});

inventoryList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || busy) return;
  const item = button.closest(".inventory-item");
  const id = item.dataset.id;
  const products = window.AurenzoCatalog.get();
  const product = products.find((entry) => entry.id === id);
  if (!product) return;

  if (button.dataset.action === "delete" && !window.confirm(`Usunąć ${product.title} z katalogu?`)) return;
  const nextProducts = button.dataset.action === "toggle"
    ? products.map((entry) => entry.id === id ? { ...entry, active: !entry.active } : entry)
    : products.filter((entry) => entry.id !== id);

  setBusy(true);
  try {
    const action = button.dataset.action === "toggle" ? "zmień widoczność" : "usuń";
    const published = await publishProducts(nextProducts, `Aurenzo: ${action} ${product.title}`);
    showMessage(published ? "Zmiana została opublikowana." : "Zmiana jest widoczna tylko w lokalnym podglądzie.");
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    setBusy(false);
  }
});

document.querySelector("#export-catalog").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(window.AurenzoCatalog.get(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `aurenzo-katalog-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

importInput.addEventListener("change", async () => {
  const [file] = importInput.files;
  if (!file) return;
  setBusy(true);

  try {
    const products = window.AurenzoCatalog.normalize(JSON.parse(await file.text()));
    const published = await publishProducts(products, "Aurenzo: import katalogu");
    showMessage(published ? "Zaimportowany katalog został opublikowany." : "Katalog zaimportowano tylko do lokalnego podglądu.");
  } catch (error) {
    showMessage(error.message || "Nie udało się zaimportować katalogu.", true);
  } finally {
    importInput.value = "";
    setBusy(false);
  }
});

document.querySelector("#reset-catalog").addEventListener("click", async () => {
  if (!window.confirm("Przywrócić cztery przykładowe telefony? Obecna lista zostanie zastąpiona.")) return;
  setBusy(true);

  try {
    const published = await publishProducts(window.AurenzoCatalog.defaults, "Aurenzo: przywróć przykładową ofertę");
    showMessage(published ? "Przykładowa oferta została opublikowana." : "Przywrócono lokalną ofertę przykładową.");
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    setBusy(false);
  }
});

window.addEventListener("aurenzo:catalog-change", renderInventory);
window.addEventListener("storage", async (event) => {
  if (event.key === window.AurenzoCatalog.previewKey) {
    await window.AurenzoCatalog.load({ force: true });
    renderInventory();
  }
});

const initialize = async () => {
  const savedSettings = window.AurenzoGitHub.getSettings();
  githubForm.querySelector("[name=owner]").value = savedSettings.owner || "";
  githubForm.querySelector("[name=repo]").value = savedSettings.repo || "";
  githubForm.querySelector("[name=branch]").value = savedSettings.branch || "main";
  await window.AurenzoCatalog.load();
  renderInventory();

  if (window.AurenzoGitHub.hasSessionToken() && savedSettings.owner && savedSettings.repo) {
    setBusy(true);
    setConnection(false, "Odnawiam połączenie z GitHubem…");
    try {
      await window.AurenzoGitHub.connect();
      setConnection(true, `Połączono z ${savedSettings.owner}/${savedSettings.repo}.`);
    } catch (error) {
      setConnection(false, error.message, true);
    } finally {
      setBusy(false);
    }
  }
};

initialize();
