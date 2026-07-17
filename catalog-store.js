(function () {
  const PREVIEW_KEY = "aurenzo-mobile-catalog-preview-v2";
  const CATALOG_URL = "data/catalog.json";

  const fallbackProducts = [
    { id: "15-pro-max", title: "iPhone 15 Pro Max", year: "2023", storage: "256 GB", condition: "A+", color: "Tytan naturalny", price: 4899, battery: "96%", badge: "Nowość", className: "phone-natural", categories: ["pro"], images: [], active: true },
    { id: "15-pro", title: "iPhone 15 Pro", year: "2023", storage: "128 GB", condition: "A", color: "Tytan czarny", price: 4199, battery: "94%", badge: "Top wybór", className: "phone-black", categories: ["pro"], images: [], active: true },
    { id: "14-pro-max", title: "iPhone 14 Pro Max", year: "2022", storage: "256 GB", condition: "A", color: "Głęboka purpura", price: 3399, battery: "91%", badge: "Ostatnia sztuka", className: "phone-purple", categories: ["pro", "value"], images: [], active: true },
    { id: "13", title: "iPhone 13", year: "2021", storage: "128 GB", condition: "A", color: "Niebieski", price: 2199, battery: "90%", badge: "Najlepsza cena", className: "phone-blue", categories: ["value"], images: [], active: true },
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const normalizeProduct = (product) => {
    const price = Number(product.price) || 0;
    const categories = new Set(Array.isArray(product.categories) ? product.categories.filter(Boolean) : []);
    if (String(product.title).toLowerCase().includes("pro")) categories.add("pro");
    if (price <= 3500) categories.add("value");

    return {
      id: String(product.id || `phone-${Date.now()}`),
      title: String(product.title || "iPhone"),
      year: String(product.year || new Date().getFullYear()),
      storage: String(product.storage || "—"),
      condition: String(product.condition || "A"),
      color: String(product.color || "Kolor nieokreślony"),
      price,
      battery: String(product.battery || "—"),
      badge: String(product.badge || "Dostępny"),
      className: String(product.className || "phone-natural"),
      categories: Array.from(categories),
      images: Array.isArray(product.images) ? product.images.slice(0, 4) : [],
      active: product.active !== false,
    };
  };

  const normalize = (products) => {
    if (!Array.isArray(products)) throw new Error("Katalog nie zawiera prawidłowej listy telefonów.");
    return products.map(normalizeProduct);
  };

  let state = normalize(fallbackProducts);
  let loaded = false;

  const isLocalPreview = () =>
    window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  const readPreview = () => {
    try {
      const saved = localStorage.getItem(PREVIEW_KEY);
      return saved ? normalize(JSON.parse(saved)) : null;
    } catch (error) {
      console.warn("Nie udało się odczytać lokalnego podglądu katalogu.", error);
      return null;
    }
  };

  const load = async ({ force = false } = {}) => {
    if (loaded && !force) return clone(state);

    if (isLocalPreview()) {
      const preview = readPreview();
      if (preview) {
        state = preview;
        loaded = true;
        return clone(state);
      }
    }

    try {
      const response = await fetch(`${CATALOG_URL}?v=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state = normalize(await response.json());
    } catch (error) {
      console.warn("Nie udało się pobrać katalogu. Używam danych zapasowych.", error);
      state = readPreview() || normalize(fallbackProducts);
    }

    loaded = true;
    return clone(state);
  };

  const set = (products, { savePreview = true } = {}) => {
    state = normalize(products);
    loaded = true;
    if (savePreview) {
      try {
        localStorage.setItem(PREVIEW_KEY, JSON.stringify(state));
      } catch (error) {
        throw new Error("Brakuje miejsca na lokalny podgląd zdjęć. Opublikuj ofertę na GitHubie albo dodaj mniejsze pliki.");
      }
    }
    window.dispatchEvent(new CustomEvent("aurenzo:catalog-change", { detail: clone(state) }));
    return clone(state);
  };

  const clearPreview = () => localStorage.removeItem(PREVIEW_KEY);
  const get = () => clone(state);
  const add = (product) => set([normalizeProduct(product), ...state]);
  const remove = (id) => set(state.filter((product) => product.id !== id));
  const toggle = (id) => set(state.map((product) => (
    product.id === id ? { ...product, active: !product.active } : product
  )));
  const reset = () => set(clone(fallbackProducts));

  window.AurenzoCatalog = {
    load,
    get,
    set,
    add,
    remove,
    toggle,
    reset,
    importData: set,
    normalize: (products) => clone(normalize(products)),
    clearPreview,
    defaults: clone(fallbackProducts),
    previewKey: PREVIEW_KEY,
    catalogUrl: CATALOG_URL,
  };
}());
