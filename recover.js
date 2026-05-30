(function () {
  const config = window.GREAT_FOLDER_SITE || {};
  const deliveryConfig = config.delivery || {};
  const apiBaseUrl = String(deliveryConfig.apiBaseUrl || "").trim().replace(/\/$/, "");
  const supportEmail = String(deliveryConfig.supportEmail || "").trim();

  const form = document.getElementById("recover-form");
  const emailInput = document.getElementById("recover-email");
  const submitButton = document.getElementById("recover-submit");
  const feedback = document.getElementById("recover-feedback");
  const localeButtons = document.querySelectorAll("[data-locale-button]");
  const metaDescription = document.querySelector('meta[name="description"]');

  const translations = {
    "pt-BR": {
      page_title: "Recuperar licença | Great Folder",
      page_description: "Recupere sua licença do Great Folder pelo email da compra.",
      recover_eyebrow: "Recuperação",
      recover_title: "Recupere sua licença",
      recover_copy: "Digite o email usado na compra. Se existir uma licença vinculada a ele, nós enviaremos agora.",
      recover_email_label: "Email da compra",
      recover_submit: "Enviar licença por email",
      recover_submit_loading: "Enviando...",
      recover_hint: "Use o mesmo email cadastrado na Kiwify.",
      recover_success: "Se existir uma licença para este email, nós enviamos agora.",
      recover_error: "Não foi possível enviar sua licença agora.",
      recover_missing_api: "A recuperação por email ainda não foi configurada.",
      support_hint: supportEmail ? `Se isso persistir, fale com ${supportEmail}.` : "Se isso persistir, fale com o suporte.",
    },
    "en-US": {
      page_title: "Recover license | Great Folder",
      page_description: "Recover your Great Folder license using the purchase email.",
      recover_eyebrow: "Recovery",
      recover_title: "Recover your license",
      recover_copy: "Enter the email used for purchase. If a license exists for it, we will send it now.",
      recover_email_label: "Purchase email",
      recover_submit: "Send license by email",
      recover_submit_loading: "Sending...",
      recover_hint: "Use the same email registered on Kiwify.",
      recover_success: "If a license exists for this email, we have just sent it.",
      recover_error: "Could not send your license right now.",
      recover_missing_api: "Email recovery has not been configured yet.",
      support_hint: supportEmail ? `If this persists, contact ${supportEmail}.` : "If this persists, contact support.",
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
})();
