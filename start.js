// No download is offered until a real, versioned official artifact is configured.
fetch("release.json").then((response) => {
  if (!response.ok) throw new Error("Release unavailable");
  return response.json();
}).then((release) => {
  const url = new URL(release.downloadUrl);
  if (url.origin !== "https://github.com" || !/^\/honake\/quarter\/releases\/download\/[^/]+\/[^/]+\.exe$/.test(url.pathname)
    || url.search || url.hash || url.username || url.password || !/^[a-f0-9]{64}$/i.test(release.sha256)
    || !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(release.version)) return;
  if (url.pathname !== `/honake/quarter/releases/download/v${release.version}/QUARTER-${release.version}-unsigned-x64-setup.exe`) return;
  const link = document.querySelector("[data-download]");
  link.href = url.href;
  link.hidden = false;
  document.querySelector("[data-fallback-link]").hidden = true;
  document.querySelector("[data-release-note]").textContent = `バージョン ${release.version} / 未署名・手動更新`;
  const hash = document.querySelector("[data-release-hash]");
  hash.textContent = `SHA-256: ${release.sha256.toLowerCase()}`;
  hash.hidden = false;
}).catch(() => { /* The preparation notice remains usable without a release or network. */ });
