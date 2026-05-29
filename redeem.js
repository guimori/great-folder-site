(function () {
  const config = window.GREAT_FOLDER_SITE || {};
  const deliveryConfig = config.delivery || {};
  const apiBaseUrl = String(deliveryConfig.apiBaseUrl || "").trim().replace(/\/$/, "");
  const supportEmail = String(deliveryConfig.supportEmail || "").trim();
  const fallbackDownloadUrl = String(deliveryConfig.fallbackDownloadUrl || "").trim();

  const form = document.getElementById("delivery-form");
  const feedback = document.getElementById("redeem-feedback");
  const result = document.getElementById("redeem-result");
  const licenseKeyNode = document.getElementById("license-key");
  const downloadButton = document.getElementById("download-button");
  const copyButton = document.getElementById("copy-button");
  const orderInput = document.getElementById("order_id");
  const localeButtons = document.querySelectorAll("[data-locale-button]");
  const metaDescription = document.querySelector('meta[name="description"]');

  const translations = {
    "pt-BR": {
      page_title: "Resgatar compra | Great Folder",
      page_description: "Resgate sua licença e download do Great Folder após a compra.",
      redeem_eyebrow: "Pós-compra",
      redeem_title: "Resgate sua licença",
      redeem_copy: "Se a licença não aparecer automaticamente, informe o número do pedido para ver sua chave e baixar o Great Folder.",
      redeem_order_label: "Número do pedido",
      redeem_submit: "Ver minha licença",
      redeem_hint: "Se o preenchimento automático não acontecer, copie o número do pedido na Kiwify e cole aqui.",
      redeem_result_eyebrow: "Entrega encontrada",
      redeem_result_title: "Sua licença está pronta",
      redeem_license_label: "Chave",
      redeem_download: "Baixar para Windows",
      redeem_copy_button: "Copiar chave",
      redeem_activation_hint: "Abra o app e cole a chave na tela de ativação.",
      lookup_missing_api: "A página de resgate ainda não foi conectada à API de entregas.",
      lookup_loading: "Buscando sua licença...",
      lookup_missing_fields: "Preencha o número do pedido.",
      lookup_not_found: "Não encontramos essa entrega. Confira os dados da compra.",
      lookup_error: "Não foi possível buscar sua entrega agora.",
      copy_success: "Chave copiada.",
      support_hint: supportEmail ? `Se continuar falhando, fale com ${supportEmail}.` : "Se continuar falhando, fale com o suporte.",
    },
    "en-US": {
      page_title: "Claim purchase | Great Folder",
      page_description: "Claim your Great Folder license and download after purchase.",
      redeem_eyebrow: "Post-purchase",
      redeem_title: "Claim your license",
      redeem_copy: "If your license does not appear automatically, enter the order number to see your key and download Great Folder.",
      redeem_order_label: "Order number",
      redeem_submit: "Show my license",
      redeem_hint: "If auto-fill does not happen, copy the order number from Kiwify and paste it here.",
      redeem_result_eyebrow: "Delivery found",
      redeem_result_title: "Your license is ready",
      redeem_license_label: "Key",
      redeem_download: "Download for Windows",
      redeem_copy_button: "Copy key",
      redeem_activation_hint: "Open the app and paste the key into the activation screen.",
      lookup_missing_api: "The delivery page is not connected to the delivery API yet.",
      lookup_loading: "Looking up your license...",
      lookup_missing_fields: "Fill in your order number.",
      lookup_not_found: "We could not find that delivery. Check your purchase details.",
      lookup_error: "Could not load your delivery right now.",
      copy_success: "Key copied.",
      support_hint: supportEmail ? `If this keeps failing, contact ${supportEmail}.` : "If this keeps failing, contact support.",
    },
  };

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

  function prefillFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const claimToken = params.get("claim_token") || params.get("claimToken") || "";
    const orderId =
      params.get("order_id") ||
      params.get("orderId") ||
      params.get("order_code") ||
      params.get("transaction_id") ||
      params.get("sale_id") ||
      "";
    if (orderId) {
      orderInput.value = orderId;
    }
    return { claimToken, orderId };
  }

  async function postJson(path, payload) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let payload = {};
    try {
      payload = await response.json();
    } catch (_error) {
      payload = {};
    }
    if (!response.ok) {
      const detail = String(payload.detail || "").trim();
      if (response.status === 404) {
        throw new Error(`${t("lookup_not_found")} ${t("support_hint")}`.trim());
      }
      throw new Error(detail || `${t("lookup_error")} ${t("support_hint")}`.trim());
    }
    return payload;
  }

  async function lookupByOrder(orderId) {
    return postJson("/v1/deliveries/lookup", { order_id: orderId });
  }

  async function lookupByClaimToken(claimToken) {
    return postJson("/v1/deliveries/claim", { claim_token: claimToken });
  }

  function showDelivery(payload) {
    const licenseKey = String(payload.license_key || "").trim();
    const downloadUrl = String(payload.download_url || fallbackDownloadUrl || "").trim();
    licenseKeyNode.textContent = licenseKey;
    downloadButton.href = downloadUrl || "#";
    downloadButton.toggleAttribute("aria-disabled", !downloadUrl);
    result.hidden = false;
    setFeedback("", false);
  }

  async function tryAutomaticLookup(initial) {
    if (!apiBaseUrl) {
      setFeedback(t("lookup_missing_api"), true);
      return;
    }
    try {
      if (initial.claimToken) {
        setFeedback(t("lookup_loading"), false);
        showDelivery(await lookupByClaimToken(initial.claimToken));
        return;
      }
      if (initial.orderId) {
        setFeedback(t("lookup_loading"), false);
        showDelivery(await lookupByOrder(initial.orderId));
        return;
      }
    } catch (_error) {
      setFeedback("", false);
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    result.hidden = true;

    if (!apiBaseUrl) {
      setFeedback(t("lookup_missing_api"), true);
      return;
    }

    const orderId = orderInput.value.trim();
    if (!orderId) {
      setFeedback(t("lookup_missing_fields"), true);
      return;
    }

    setFeedback(t("lookup_loading"), false);
    try {
      showDelivery(await lookupByOrder(orderId));
    } catch (error) {
      setFeedback(error.message || t("lookup_error"), true);
    }
  });

  copyButton.addEventListener("click", async () => {
    const key = licenseKeyNode.textContent.trim();
    if (!key) {
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
  tryAutomaticLookup(prefillFromQuery());
})();
