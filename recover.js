(function () {
  const config = window.GREAT_FOLDER_SITE || {};
  const deliveryConfig = config.delivery || {};
  const apiBaseUrl = String(deliveryConfig.apiBaseUrl || "").trim().replace(/\/$/, "");
  const supportEmail = String(deliveryConfig.supportEmail || "").trim();

  const form = document.getElementById("recover-form");
  const emailInput = document.getElementById("recover-email");
  const submitButton = document.getElementById("recover-submit");
  const feedback = document.getElementById("recover-feedback");
  const requestState = document.getElementById("recover-request-state");
  const claimState = document.getElementById("recover-claim-state");
  const claimFeedback = document.getElementById("recover-claim-feedback");
  const loadingText = document.getElementById("recover-loading-text");
  const statusIcon = document.getElementById("recover-status-icon");
  const resultPanel = document.getElementById("recover-result");
  const licenseKeysNode = document.getElementById("recover-license-keys");
  const downloadButton = document.getElementById("recover-download-button");
  const copyButton = document.getElementById("recover-copy-button");
  const downloadTxtButton = document.getElementById("recover-download-txt-button");
  const localeButtons = document.querySelectorAll("[data-locale-button]");
  const metaDescription = document.querySelector('meta[name="description"]');

  const PLACEHOLDER = "-----------";
  let copied = false;
  let latestLicenseKeys = [];

  const translations = {
    "pt-BR": {
      page_title: "Recuperar licença | Great Folder",
      page_description: "Recupere sua licença do Great Folder pelo email da compra.",
      recover_eyebrow: "Recuperação",
      recover_title: "Recupere sua licença",
      recover_copy: "Digite o email usado na compra. Se existir uma licença vinculada a ele, nós enviaremos um link seguro de recuperação.",
      recover_email_label: "Email da compra",
      recover_submit: "Enviar link de recuperação",
      recover_submit_loading: "Enviando...",
      recover_hint: "Use o mesmo email cadastrado na Kiwify.",
      recover_success: "Se existir uma licença para este email, nós enviaremos um link de recuperação.",
      recover_error: "Não foi possível enviar seu link agora.",
      recover_missing_api: "A recuperação ainda não foi configurada.",
      recover_loading: "Validando seu link...",
      recover_claim_hint: "Aguarde o carregamento das suas licenças.",
      recover_claim_error: "Este link é inválido ou expirou.",
      recover_keys_label: "Licenças",
      recover_copy_button: "Copiar licenças",
      recover_copy_success: "Licenças copiadas!",
      redeem_download: "Baixar para Windows",
      support_hint: supportEmail ? `Se isso persistir, responda ${supportEmail}.` : "Se isso persistir, responda ao email de recuperação.",
    },
    "en-US": {
      page_title: "Recover license | Great Folder",
      page_description: "Recover your Great Folder license using the purchase email.",
      recover_eyebrow: "Recovery",
      recover_title: "Recover your license",
      recover_copy: "Enter the email used for purchase. If a license exists for it, we will send a secure recovery link.",
      recover_email_label: "Purchase email",
      recover_submit: "Send recovery link",
      recover_submit_loading: "Sending...",
      recover_hint: "Use the same email registered on Kiwify.",
      recover_success: "If a license exists for this email, we will send a recovery link.",
      recover_error: "Could not send your link right now.",
      recover_missing_api: "Recovery has not been configured yet.",
      recover_loading: "Validating your link...",
      recover_claim_hint: "Please wait while your licenses load.",
      recover_claim_error: "This link is invalid or expired.",
      recover_keys_label: "Licenses",
      recover_copy_button: "Copy licenses",
      recover_copy_success: "Licenses copied!",
      redeem_download: "Download for Windows",
      support_hint: supportEmail ? `If this persists, reply to ${supportEmail}.` : "If this persists, reply to the recovery email.",
    },
  };

  let currentLocale = getInitialLocale();

  function getInitialLocale() {
    const savedLocale = window.localStorage.getItem("great-folder-locale");
    if (savedLocale && translations[savedLocale]) {
      return savedLocale;
    }
    const browserLocale = String(window.navigator.language || "pt-BR");
    return browserLocale.toLowerCase().startsWith("en") ? "en-US" : "pt-BR";
  }

  function t(key) {
    return (translations[currentLocale] && translations[currentLocale][key]) || key;
  }

  function parseQuery() {
    const params = new URLSearchParams(window.location.search);
    return { token: params.get("token") || "" };
  }

  function setStatusPending() {
    if (!statusIcon) return;
    statusIcon.className = "redeem-spinner";
    statusIcon.textContent = "";
  }

  function setStatusComplete() {
    if (!statusIcon) return;
    statusIcon.className = "redeem-status-check";
    statusIcon.textContent = "✅";
  }

  function setDownloadReady(downloadUrl) {
    downloadButton.href = downloadUrl;
    downloadButton.classList.remove("is-disabled");
    downloadButton.removeAttribute("aria-disabled");
  }

  function setDownloadDisabled() {
    downloadButton.href = "#";
    downloadButton.classList.add("is-disabled");
    downloadButton.setAttribute("aria-disabled", "true");
  }

  function updateCopyButtonLabel() {
    copyButton.textContent = copied ? t("recover_copy_success") : t("recover_copy_button");
  }

  function downloadLicenseTxt(licenseKeys) {
    if (!Array.isArray(licenseKeys) || !licenseKeys.length) {
      return;
    }
    const blob = new Blob([`${licenseKeys.join("\n")}\n`], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "great-folder-licencas.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  function applyLocale() {
    document.documentElement.lang = currentLocale;
    document.title = t("page_title");
    if (metaDescription) {
      metaDescription.setAttribute("content", t("page_description"));
    }
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (key) {
        node.textContent = t(key);
      }
    });
    localeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-locale-button") === currentLocale);
    });
    updateCopyButtonLabel();
  }

  async function postJson(path, payload) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let body = {};
    try {
      body = await response.json();
    } catch (_error) {
      body = {};
    }
    if (!response.ok) {
      const detail = String(body.detail || "").trim();
      throw new Error(detail || t("recover_error"));
    }
    return body;
  }

  function showClaimMode() {
    requestState.hidden = true;
    claimState.hidden = false;
    resultPanel.hidden = true;
    setStatusPending();
    setDownloadDisabled();
    copyButton.disabled = true;
    downloadTxtButton.disabled = true;
    copied = false;
    latestLicenseKeys = [];
    updateCopyButtonLabel();
    licenseKeysNode.textContent = PLACEHOLDER;
  }

  function showClaimResult(payload) {
    const licenseKeys = Array.isArray(payload.license_keys) ? payload.license_keys : [];
    latestLicenseKeys = licenseKeys;
    licenseKeysNode.textContent = licenseKeys.join("\n") || PLACEHOLDER;
    copyButton.disabled = !licenseKeys.length;
    downloadTxtButton.disabled = !licenseKeys.length;
    copied = false;
    updateCopyButtonLabel();
    setStatusComplete();
    if (payload.download_url) {
      setDownloadReady(String(payload.download_url));
    }
    resultPanel.hidden = false;
    claimFeedback.textContent = "";
    downloadLicenseTxt(licenseKeys);
  }

  async function claimRecoveryToken(token) {
    showClaimMode();
    loadingText.textContent = t("recover_loading");
    try {
      const payload = await postJson("/v1/licenses/recover/claim", { token });
      showClaimResult(payload);
    } catch (error) {
      claimFeedback.textContent = `${error.message || t("recover_claim_error")} ${t("support_hint")}`.trim();
      claimFeedback.classList.add("is-error");
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = String(emailInput.value || "").trim();
    if (!apiBaseUrl) {
      feedback.textContent = t("recover_missing_api");
      feedback.classList.add("is-error");
      return;
    }
    submitButton.disabled = true;
    submitButton.textContent = t("recover_submit_loading");
    feedback.classList.remove("is-error");
    try {
      await postJson("/v1/licenses/recover", { email });
      feedback.textContent = t("recover_success");
    } catch (error) {
      feedback.textContent = `${error.message || t("recover_error")} ${t("support_hint")}`.trim();
      feedback.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = t("recover_submit");
    }
  });

  copyButton.addEventListener("click", async () => {
    const keys = String(licenseKeysNode.textContent || "").trim();
    if (!keys || keys === PLACEHOLDER) return;
    await navigator.clipboard.writeText(keys);
    copied = true;
    updateCopyButtonLabel();
  });

  downloadTxtButton.addEventListener("click", () => {
    downloadLicenseTxt(latestLicenseKeys);
  });

  localeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextLocale = button.getAttribute("data-locale-button");
      if (!nextLocale || !translations[nextLocale]) {
        return;
      }
      currentLocale = nextLocale;
      window.localStorage.setItem("great-folder-locale", currentLocale);
      applyLocale();
    });
  });

  applyLocale();
  const query = parseQuery();
  if (query.token) {
    claimRecoveryToken(query.token);
  }
})();
