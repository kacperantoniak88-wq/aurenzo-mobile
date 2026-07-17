(function () {
  const SETTINGS_KEY = "aurenzo-github-settings-v1";
  const TOKEN_KEY = "aurenzo-github-token-session";
  const API_ROOT = "https://api.github.com";

  const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");

  const textToBase64 = (text) => {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }
    return btoa(binary);
  };

  const base64ToText = (base64) => {
    const binary = atob(base64.replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  const detectSettings = () => {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    if (saved.owner && saved.repo) return { branch: "main", ...saved };

    const githubPagesHost = window.location.hostname.match(/^([^.]+)\.github\.io$/i);
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    return {
      owner: githubPagesHost?.[1] || "",
      repo: githubPagesHost && pathParts[0] ? pathParts[0] : "",
      branch: "main",
    };
  };

  let settings = detectSettings();
  let token = sessionStorage.getItem(TOKEN_KEY) || "";

  const configure = (nextSettings, nextToken) => {
    settings = {
      owner: String(nextSettings.owner || "").trim(),
      repo: String(nextSettings.repo || "").trim(),
      branch: String(nextSettings.branch || "main").trim(),
    };
    token = String(nextToken || "").trim();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    sessionStorage.setItem(TOKEN_KEY, token);
  };

  const headers = () => ({
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2026-03-10",
  });

  const request = async (url, options = {}) => {
    if (!settings.owner || !settings.repo || !settings.branch || !token) {
      throw new Error("Uzupełnij dane repozytorium i token GitHub.");
    }

    const response = await fetch(url, {
      ...options,
      headers: { ...headers(), ...(options.headers || {}) },
    });

    if (response.status === 404 && options.allowNotFound) return null;

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const details = payload.message ? `: ${payload.message}` : "";
      if (response.status === 401) throw new Error("Token GitHub jest nieprawidłowy albo wygasł.");
      if (response.status === 403) throw new Error("Token nie ma uprawnienia Contents: Read and write do tego repozytorium.");
      if (response.status === 404) throw new Error("Nie znaleziono repozytorium lub pliku. Sprawdź właściciela, nazwę i branch.");
      throw new Error(`GitHub zwrócił błąd ${response.status}${details}`);
    }
    return payload;
  };

  const repositoryUrl = () => `${API_ROOT}/repos/${encodeURIComponent(settings.owner)}/${encodeURIComponent(settings.repo)}`;
  const contentUrl = (path) => `${repositoryUrl()}/contents/${encodePath(path)}`;

  const getFile = (path) => request(`${contentUrl(path)}?ref=${encodeURIComponent(settings.branch)}`, { allowNotFound: true });

  const putFile = async (path, content, message, sha = null) => request(contentUrl(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content,
      branch: settings.branch,
      ...(sha ? { sha } : {}),
    }),
  });

  const connect = async () => {
    await request(repositoryUrl());
    const catalogFile = await getFile("data/catalog.json");
    if (!catalogFile) return window.AurenzoCatalog.defaults;
    const products = JSON.parse(base64ToText(catalogFile.content));
    window.AurenzoCatalog.set(products, { savePreview: false });
    return products;
  };

  const uploadImages = async (productId, dataUrls) => {
    const paths = [];
    for (let index = 0; index < dataUrls.length; index += 1) {
      const path = `assets/catalog/${productId}-${index + 1}.jpg`;
      const base64 = dataUrls[index].split(",")[1];
      await putFile(path, base64, `Aurenzo: dodaj zdjęcie ${productId}`);
      paths.push(path);
    }
    return paths;
  };

  const saveCatalog = async (products, message = "Aurenzo: aktualizacja oferty") => {
    const existing = await getFile("data/catalog.json");
    const content = textToBase64(`${JSON.stringify(products, null, 2)}\n`);
    await putFile("data/catalog.json", content, message, existing?.sha);
    window.AurenzoCatalog.set(products, { savePreview: false });
    return products;
  };

  const disconnect = () => {
    token = "";
    sessionStorage.removeItem(TOKEN_KEY);
  };

  window.AurenzoGitHub = {
    configure,
    connect,
    disconnect,
    uploadImages,
    saveCatalog,
    getSettings: () => ({ ...settings }),
    hasSessionToken: () => Boolean(token),
  };
}());
