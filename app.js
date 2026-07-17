const body = document.body;
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileLinks = document.querySelectorAll(".mobile-nav a");
const productGrid = document.querySelector("#product-grid");
const catalogEmpty = document.querySelector("#catalog-empty");
const productModal = document.querySelector("#product-modal");
const serviceModal = document.querySelector("#service-modal");
const toast = document.querySelector(".toast");

const formatPrice = (price) => `${new Intl.NumberFormat("pl-PL").format(Number(price) || 0)} zł`;
const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const phoneVisual = (product) => {
  if (product.images?.length) {
    return `<img class="product-photo" src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.title)}" />`;
  }

  const cameraClass = product.className === "phone-blue" ? "camera-island camera-dual" : "camera-island";
  const lenses = product.className === "phone-blue"
    ? "<i></i><i></i>"
    : "<i></i><i></i><i></i><b></b>";
  return `<div class="phone-visual ${escapeHtml(product.className)}" aria-hidden="true"><div class="${cameraClass}">${lenses}</div></div>`;
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

let activeFilter = "all";

const applyFilter = () => {
  document.querySelectorAll(".product-card").forEach((card) => {
    const visible = activeFilter === "all" || card.dataset.category.split(" ").includes(activeFilter);
    card.classList.toggle("is-hidden", !visible);
  });
};

const renderCatalog = () => {
  const products = window.AurenzoCatalog.get().filter((product) => product.active);
  productGrid.innerHTML = products.map((product) => `
    <article class="product-card reveal-card" data-category="${escapeHtml(product.categories.join(" "))}" data-product="${escapeHtml(product.id)}">
      <div class="product-badges"><span>${escapeHtml(product.badge)}</span><span>${escapeHtml(product.condition)}</span></div>
      ${phoneVisual(product)}
      <div class="product-info">
        <div><span>Apple · ${escapeHtml(product.year)}</span><h3>${escapeHtml(product.title)}</h3></div>
        <div><span>cena</span><strong>${formatPrice(product.price)}</strong></div>
      </div>
      <button class="card-action" type="button">Zobacz urządzenie <span>↗</span></button>
    </article>
  `).join("");

  catalogEmpty.hidden = products.length > 0;
  productGrid.hidden = products.length === 0;
  productGrid.querySelectorAll(".reveal-card").forEach((element) => revealObserver.observe(element));
  applyFilter();
};

const setModalVisual = (product) => {
  const visual = productModal.querySelector(".modal-visual");
  if (!product.images?.length) {
    visual.innerHTML = phoneVisual(product);
    return;
  }

  visual.innerHTML = `
    <div class="modal-gallery">
      <img class="modal-main-photo" src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.title)}" />
      ${product.images.length > 1 ? `
        <div class="modal-thumbnails">
          ${product.images.map((image, index) => `
            <button class="${index === 0 ? "active" : ""}" type="button" data-image="${escapeHtml(image)}" aria-label="Pokaż zdjęcie ${index + 1}">
              <img src="${escapeHtml(image)}" alt="" />
            </button>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;

  visual.querySelectorAll(".modal-thumbnails button").forEach((button) => {
    button.addEventListener("click", () => {
      visual.querySelector(".modal-main-photo").src = button.dataset.image;
      visual.querySelectorAll(".modal-thumbnails button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });
};

const setModalLock = () => {
  body.classList.toggle("modal-open", productModal.open || serviceModal.open);
};

const openProductModal = (id) => {
  const product = window.AurenzoCatalog.get().find((item) => item.id === id && item.active);
  if (!product) return;

  setModalVisual(product);
  productModal.querySelector("h2").textContent = product.title;
  productModal.querySelector(".modal-description").textContent =
    `${product.color} · ${product.storage} · kondycja ${product.condition}`;
  productModal.querySelector(".modal-specs strong").textContent = product.battery;
  productModal.querySelector(".modal-price strong").textContent = formatPrice(product.price);
  productModal.showModal();
  setModalLock();
};

window.addEventListener("load", () => {
  window.setTimeout(() => document.querySelector(".page-loader").classList.add("is-hidden"), 260);
});

const handleHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
handleHeader();
window.addEventListener("scroll", handleHeader, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Zamknij menu" : "Otwórz menu");
});

mobileLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    applyFilter();
  });
});

productGrid.addEventListener("click", (event) => {
  const action = event.target.closest(".card-action");
  if (!action) return;
  openProductModal(action.closest(".product-card").dataset.product);
});

const closeDialog = (dialog) => {
  dialog.close();
  setModalLock();
};

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.querySelector(".modal-close").addEventListener("click", () => closeDialog(dialog));
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (outside) closeDialog(dialog);
  });
  dialog.addEventListener("close", setModalLock);
});

const openServiceModal = (service = "") => {
  serviceModal.showModal();
  if (service) serviceModal.querySelector("select[name='repair']").value = service;
  setModalLock();
};

document.querySelector("#service-cta").addEventListener("click", () => openServiceModal());
document.querySelectorAll("[data-service]").forEach((button) => {
  button.addEventListener("click", () => openServiceModal(button.dataset.service));
});

document.querySelectorAll(".accordion-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".accordion-item");
    const wasOpen = item.classList.contains("open");
    document.querySelectorAll(".accordion-item").forEach((other) => {
      other.classList.remove("open");
      other.querySelector("button").setAttribute("aria-expanded", "false");
    });
    if (!wasOpen) {
      item.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

let toastTimer;
const showToast = (message) => {
  toast.querySelector("p").textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4200);
};

document.querySelector("#valuation-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const model = new FormData(event.currentTarget).get("model");
  showToast(`Wycena ${model} została przyjęta. Wrócimy z ofertą.`);
  event.currentTarget.reset();
});

document.querySelector("#service-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const device = new FormData(event.currentTarget).get("device");
  closeDialog(serviceModal);
  showToast(`Zgłoszenie dla ${device} zostało zapisane. Skontaktujemy się z Tobą.`);
  event.currentTarget.reset();
});

productModal.querySelector(".modal-copy .button").addEventListener("click", () => {
  closeDialog(productModal);
});

window.addEventListener("aurenzo:catalog-change", renderCatalog);
window.addEventListener("storage", async (event) => {
  if (event.key === window.AurenzoCatalog.previewKey) {
    await window.AurenzoCatalog.load({ force: true });
    renderCatalog();
  }
});

(async () => {
  await window.AurenzoCatalog.load();
  renderCatalog();
})();
