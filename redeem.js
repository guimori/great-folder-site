(function () {
  const config = window.GREAT_FOLDER_SITE || {};
  const deliveryConfig = config.delivery || {};
  const apiBaseUrl = String(deliveryConfig.apiBaseUrl || "").trim().replace(/\/$/, "");
  const supportEmail = String(deliveryConfig.supportEmail || "").trim();
  const fallbackDownloadUrl = String(deliveryConfig.fallbackDownloadUrl || "").trim();

  const feedback = document.getElementById("redeem-feedback");
  const loadingText = document.getElementById("redeem-loading-text");
  const licenseKeyNode = document.getElementById("license-key");
  const orderCodeNode = document.getElementById("order-code");
  const downloadButton = document.getElementById("download-button");
  const copyButton = document.getElementById("copy-button");
  const activationHint = document.getElementById("redeem-activation-hint");
  const localeButtons = document.querySelectorAll("[data-locale-button]");
  const metaDescription = document.querySelector('meta[name="description"]');

  const translations = {
    "pt-BR": {
      page_title: "Resgatar compra | Great Folder",
      page_description: "Resgate sua licença e download do Great Folder após a compra.",
      redeem_eyebrow: "Pós-compra",
      redeem_title: "Sua licença está sendo preparada",
      redeem_copy: "Aguarde alguns segundos enquanto geramos sua licença e liberamos o download do Great Folder.",
      redeem_loading: "Gerando sua licença...",
      redeem_hint: "Se isso demorar mais do que o normal, volte para a área da Kiwify e abra este link novamente.",
      redeem_order_label: "Número do pedido",
      redeem_license_label: "Chave",
      redeem_download: "Baixar para Windows",
      redeem_copy_button: "Copiar chave",
      redeem_activation_hint: "Assim que a chave aparecer, abra o app e cole na tela de ativação.",
      lookup_missing_api: "A página de resgate ainda não foi conectada à API de entregas.",
      lookup_missing_order: "Ainda não recebemos o número do pedido nesta página.",
      lookup_loading: "Gerando sua licença...",
      lookup_retry: "Estamos finalizando sua licença...",
      lookup_not_found: "Ainda não encontramos sua licença. Atualize a página em alguns instantes.",
      lookup_error: "Não foi possível preparar sua licença agora.",
      lookup_ready: "Licença gerada com sucesso.",
      copy_success: "Chave copiada.",
      support_hint: supportEmail ? `Se isso persistir, fale com ${supportEmail}.` : "Se isso persistir, fale com o suporte.",
    },
    "en-US": {
      page_title: "Claim purchase | Great Folder",
      page_description: "Claim your Great Folder license and download after purchase.",
      redeem_eyebrow: "Post-purchase",
      redeem_title: "Your license is being prepared",
      redeem_copy: "Please wait a few seconds while we generate your license and unlock the Great Folder download.",
      redeem_loading: "Generating your license...",
      redeem_hint: "If this takes longer than usual, return to your Kiwify area and open this link again.",
      redeem_order_label: "Order number",
      redeem_license_label: "Key",
      redeem_download: "Download for Windows",
      redeem_copy_button: "Copy key",
      redeem_activation_hint: "As soon as the key appears, open the app and paste it into the activation screen.",
      lookup_missing_api: "The redemption page is not connected to the delivery API yet.",
      lookup_missing_order: "We did not receive the order number on this page yet.",
      lookup_loading: "Generating your license...",
      lookup_retry: "We are finishing your license...",
      lookup_not_found: "We still could not find your license. Refresh this page in a moment.",
      lookup_error: "Could not prepare your license right now.",
      lookup_ready: "License generated successfully.",
      copy_success: "Key copied.",
      support_hint: supportEmail ? `If this persists, contact ${supportEmail}.` : "If this persists, contact support.",
    },
  };

  const POLL_MAX_ATTEMPTS = 8;
  const POLL_INTERVAL_MS = 1800;
  const PLACEHOLDER = "-----------";

  function getInitialLocale() {
    const savedLocale = window.localStorage.getItem("great-folder-locale");
    if (savedLocale && translations[savedLocale]) {
      return savedLocale;
    }
    const browserLocale = String(window.navigator.language || "pt-BR");
    return browserLocale.toLowerCase().startsWith("en") ? "en-US" : "pt-BR";
  }

  let currentLocale = getInitialLocale();

  function t(key) {
    return (translations[currentLocale] && translations[currentLocale][key]) || key;
  }

  function setFeedback(message, isError) {
    if (!feedback) {
      return;
    }
    feedback.textContent = message;
    feedback.classList.toggle("is-error", Boolean(isError));
  }

  function setLoading(messageKey) {
    if (loadingText) {
      loadingText.textContent = t(messageKey);
    }
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
  }

  function parseQuery() {
    const params = new URLSearchParams(window.location.search);
    return {
      claimToken: params.get("claim_token") || params.get("claimToken") || "",
      orderId:
        params.get("order_id") ||
        params.get("orderId") ||
        params.get("order_code") ||
        params.get("transaction_id") ||
        params.get("sale_id") ||
        "",
    };
  }

  async function postJson(path, payload) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let payloadBody = {};
    try {
      payloadBody = await response.json();
    } catch (_error) {
      payloadBody = {};
    }
    if (!response.ok) {
      const detail = String(payloadBody.detail || "").trim();
      const error = new Error(detail || t("lookup_error"));
      error.status = response.status;
      throw error;
    }
    return payloadBody;
  }

  async function lookupDelivery(query) {
    if (query.claimToken) {
      return postJson("/v1/deliveries/claim", { claim_token: query.claimToken });
    }
    if (query.orderId) {
      return postJson("/v1/deliveries/lookup", { order_id: query.orderId });
    }
    throw new Error(t("lookup_missing_order"));
  }

  function showDelivery(payload) {
    const orderId = String(payload.order_id || "").trim();
    const licenseKey = String(payload.license_key || "").trim();
    const downloadUrl = String(payload.download_url || fallbackDownloadUrl || "").trim();

    orderCodeNode.textContent = orderId || PLACEHOLDER;
    licenseKeyNode.textContent = licenseKey || PLACEHOLDER;
    copyButton.disabled = !licenseKey;
    activationHint.hidden = !licenseKey;

    if (downloadUrl) {
      setDownloadReady(downloadUrl);
    } else {
      setDownloadDisabled();
    }

    setLoading("lookup_ready");
    setFeedback("", false);
  }

  async function pollForDelivery() {
    if (!apiBaseUrl) {
      setFeedback(t("lookup_missing_api"), true);
      return;
    }

    const query = parseQuery();
    orderCodeNode.textContent = query.orderId || PLACEHOLDER;
    licenseKeyNode.textContent = PLACEHOLDER;
    copyButton.disabled = true;
    activationHint.hidden = true;
    setDownloadDisabled();

    if (!query.claimToken && !query.orderId) {
      setLoading("lookup_missing_order");
      setFeedback(`${t("lookup_missing_order")} ${t("support_hint")}`.trim(), true);
      return;
    }

    for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
      setLoading(attempt === 0 ? "lookup_loading" : "lookup_retry");
      try {
        const payload = await lookupDelivery(query);
        showDelivery(payload);
        return;
      } catch (error) {
        if (error.status && error.status !== 404) {
          setFeedback(`${error.message || t("lookup_error")} ${t("support_hint")}`.trim(), true);
          return;
        }
      }
      await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
    }

    setLoading("lookup_not_found");
    setFeedback(`${t("lookup_not_found")} ${t("support_hint")}`.trim(), true);
  }

  copyButton.addEventListener("click", async () => {
    const key = licenseKeyNode.textContent.trim();
    if (!key || key === PLACEHOLDER) {
      return;
    }
    try {
      await navigator.clipboard.writeText(key);
      setFeedback(t("copy_success"), false);
    } catch (_error) {
      setFeedback(key, false);
    }
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
  pollForDelivery();
})();
