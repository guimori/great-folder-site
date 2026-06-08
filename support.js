(function () {
  const config = window.GREAT_FOLDER_SITE || {};
  const deliveryConfig = config.delivery || {};
  const supportEmail = String(deliveryConfig.supportEmail || "").trim();
  const localeButtons = document.querySelectorAll("[data-locale-button]");
  const metaDescription = document.querySelector('meta[name="description"]');
  const form = document.getElementById("support-form");
  const feedback = document.getElementById("support-feedback");
  const copyButton = document.getElementById("support-copy");

  const fields = {
    name: document.getElementById("support-name"),
    email: document.getElementById("support-email"),
    version: document.getElementById("support-version"),
    problem: document.getElementById("support-problem"),
    steps: document.getElementById("support-steps"),
    expected: document.getElementById("support-expected"),
    actual: document.getElementById("support-actual"),
  };

  const translations = {
    "pt-BR": {
      page_title: "Suporte | Great Folder",
      page_description: "Relate um problema do Great Folder com detalhes para análise.",
      support_page_eyebrow: "Suporte",
      support_page_title: "Relate um problema",
      support_page_copy: "Descreva o que aconteceu com o máximo de detalhe possível. Vamos preparar a mensagem para envio por email.",
      support_name_label: "Seu nome",
      support_email_label: "Seu email",
      support_version_label: "Versão do app",
      support_problem_label: "Problema",
      support_steps_label: "O que você estava fazendo?",
      support_expected_label: "O que você esperava?",
      support_actual_label: "O que aconteceu de fato?",
      support_submit: "Abrir email de suporte",
      support_copy: "Copiar relato",
      support_copied: "Relato copiado.",
      support_hint: supportEmail ? `Preencha os campos e abra o email para ${supportEmail}.` : "Preencha os campos e abra o email com a mensagem pronta.",
      support_missing_email: "O email de suporte ainda não foi configurado.",
      support_subject: "Relato de problema - Great Folder",
      support_opened: supportEmail ? `Seu app de email foi aberto para enviar o relato para ${supportEmail}.` : "Seu app de email foi aberto com o relato.",
    },
    "en-US": {
      page_title: "Support | Great Folder",
      page_description: "Report a Great Folder issue with enough detail for review.",
      support_page_eyebrow: "Support",
      support_page_title: "Report a problem",
      support_page_copy: "Describe what happened with as much detail as possible. We will prepare the message for email delivery.",
      support_name_label: "Your name",
      support_email_label: "Your email",
      support_version_label: "App version",
      support_problem_label: "Problem",
      support_steps_label: "What were you doing?",
      support_expected_label: "What did you expect?",
      support_actual_label: "What actually happened?",
      support_submit: "Open support email",
      support_copy: "Copy report",
      support_copied: "Report copied.",
      support_hint: supportEmail ? `Fill in the fields and open the email to ${supportEmail}.` : "Fill in the fields and open the prepared email.",
      support_missing_email: "Support email has not been configured yet.",
      support_subject: "Problem report - Great Folder",
      support_opened: supportEmail ? `Your email app was opened to send the report to ${supportEmail}.` : "Your email app was opened with the report.",
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
      const isActive = button.getAttribute("data-locale-button") === currentLocale;
      button.classList.toggle("is-active", isActive);
    });
  }

  function buildReportText() {
    return [
      "Great Folder - Relato de problema",
      "",
      `Nome: ${String(fields.name.value || "").trim() || "-"}`,
      `Email: ${String(fields.email.value || "").trim() || "-"}`,
      `Versão: ${String(fields.version.value || "").trim() || "-"}`,
      `Problema: ${String(fields.problem.value || "").trim() || "-"}`,
      "",
      "O que eu estava fazendo:",
      String(fields.steps.value || "").trim() || "-",
      "",
      "O que eu esperava:",
      String(fields.expected.value || "").trim() || "-",
      "",
      "O que aconteceu de fato:",
      String(fields.actual.value || "").trim() || "-",
    ].join("\n");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!supportEmail) {
      feedback.textContent = t("support_missing_email");
      feedback.classList.add("is-error");
      return;
    }
    feedback.classList.remove("is-error");
    const subject = encodeURIComponent(t("support_subject"));
    const body = encodeURIComponent(buildReportText());
    window.location.href = `mailto:${encodeURIComponent(supportEmail)}?subject=${subject}&body=${body}`;
    feedback.textContent = t("support_opened");
  });

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(buildReportText());
    feedback.classList.remove("is-error");
    feedback.textContent = t("support_copied");
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
