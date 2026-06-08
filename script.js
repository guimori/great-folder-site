(function () {
  const config = window.GREAT_FOLDER_SITE || {};
  const kiwifyConfig = config.kiwify || {};
  const pricingConfig = config.pricing || {};
  const defaultCheckoutUrl = String(kiwifyConfig.checkoutUrl || "").trim();
  const checkoutUrls = kiwifyConfig.checkoutUrls || {};
  const checkoutButtons = document.querySelectorAll("[data-checkout-button]");
  const checkoutStatus = document.getElementById("checkout-status");
  const priceValue = document.querySelector("[data-price-value]");
  const localeButtons = document.querySelectorAll("[data-locale-button]");
  const metaDescription = document.querySelector('meta[name="description"]');
  const revealTargets = document.querySelectorAll("[data-reveal]");
  const faqTriggers = document.querySelectorAll(".faq-trigger");
  let revealArmed = false;
  let lastScrollY = window.scrollY;

  const translations = {
    "pt-BR": {
      page_title: "Great Folder",
      page_description: "Organize arquivos e pastas no Windows com poucos cliques.",
      hero_title: "Great Folder",
      hero_copy: "Documentos organizados em poucos cliques.\nPagamento único, e é seu pra sempre.",
      cta_buy: "Comprar por R$ 29",
      cta_how_it_works: "Ver como funciona",
      cta_recover_license: "Perdi minha licença",
      how_eyebrow: "Como funciona",
      how_title: "Organize sem complicar o Explorer",
      step_1_title: "Escolha a pasta",
      step_1_copy: "Abra uma pasta do Windows ou arraste para dentro do Great Folder.",
      step_2_title: "Veja a prévia",
      step_2_copy: "Compare como a pasta está agora e como ela vai ficar antes de executar.",
      step_3_title: "Organize e reverta",
      step_3_copy: "Execute a organização e volte atrás, se quiser, com histórico e reversão.",
      features_eyebrow: "Recursos",
      features_title: "Feito para quem quer ordem rápida no Windows",
      feature_1_title: "Organização por tipo",
      feature_1_copy: "Separe imagens, documentos, vídeos, executáveis e mais com poucos cliques.",
      feature_2_title: "Organização por extensão",
      feature_2_copy: "Crie uma estrutura objetiva para arquivos como PDF, ZIP, JPG, MP3 e outros.",
      feature_3_title: "Automação",
      feature_3_copy: "Mantenha pastas sempre organizadas com regras que reaplicam o padrão automaticamente.",
      feature_4_title: "Prévia antes de mover",
      feature_4_copy: "Veja o resultado previsto antes da execução real e reduza o risco de bagunça.",
      feature_5_title: "Histórico e reversão",
      feature_5_copy: "Confira o que foi executado e desfaça a última execução ou tudo o que foi organizado.",
      feature_6_title: "Foco em produtividade",
      feature_6_copy: "Interface direta para organizar arquivos rápido, sem depender de fluxo manual no Explorer.",
      ideal_eyebrow: "Ideal para",
      ideal_title: "Downloads que vivem bagunçados",
      ideal_copy: "Se você baixa planilhas, PDFs, imagens, instaladores e arquivos soltos todos os dias, o Great Folder transforma isso em uma estrutura clara e previsível.",
      ideal_list_title: "Use no dia a dia para:",
      ideal_list_1: "limpar a pasta Downloads",
      ideal_list_2: "separar documentos por tipo",
      ideal_list_3: "desempastar arquivos de subpastas",
      ideal_list_4: "manter regras automáticas ativas",
      pricing_eyebrow: "Pagamento único",
      pricing_title: "Compre uma vez e fique com o programa",
      pricing_copy: "Você paga uma vez, recebe sua licença e o Great Folder passa a ser seu.",
      pricing_list_1: "pague uma vez",
      pricing_list_2: "use para sempre",
      pricing_list_3: "receba sua licença após a compra",
      price_label: "Você paga uma vez só",
      download_eyebrow: "Download",
      download_title: "Baixe o Great Folder para Windows",
      download_copy: "Com sua licença, você baixa o instalador e usa o programa no seu PC.",
      faq_eyebrow: "FAQ",
      faq_title: "Dúvidas frequentes antes e depois da compra",
      faq_copy: "Respostas diretas para instalação, licença, automações, reversão e atualização.",
      faq_q1: "O Great Folder funciona em qualquer PC Windows?",
      faq_a1: "Ele foi feito para Windows. O ideal é usar uma versão atual do Windows com permissão normal de instalação por usuário.",
      faq_q2: "Eu pago uma vez ou é assinatura?",
      faq_a2: "É pagamento único. Você compra uma vez e a licença fica sua.",
      faq_q3: "Se eu trocar de computador, perco minha licença?",
      faq_a3: "Não. Você pode recuperar a licença e ativar novamente no PC novo seguindo o fluxo de recuperação.",
      faq_q4: "Posso desfazer uma organização?",
      faq_a4: "Sim. O app tem histórico e opções para reverter a última execução ou reverter toda a organização salva.",
      faq_q5: "As automações organizam tudo sozinhas?",
      faq_a5: "Sim. Depois de ativadas, elas monitoram a pasta e reorganizam os arquivos conforme a regra escolhida.",
      faq_q6: "O programa envia meus arquivos para a internet?",
      faq_a6: "Não. A organização dos seus arquivos acontece localmente no seu computador.",
      faq_q7: "Como recebo atualizações?",
      faq_a7: "O app pode verificar novas versões e atualizar por dentro das configurações, mantendo sua licença ativa.",
      faq_q8: "E se eu tiver um problema ou bug?",
      faq_a8: "Você pode abrir a página de suporte, escrever o problema com detalhes e enviar para análise.",
      support_eyebrow: "Suporte",
      support_title: "Encontrou um problema?",
      support_copy: "Abra a página de suporte e descreva com calma o que aconteceu. Quanto mais detalhe, melhor para corrigir rápido.",
      support_cta: "Relatar um problema",
      checkout_missing: "Checkout da Kiwify ainda não configurado. Preencha checkoutUrl em site-config.js.",
      checkout_ready: "",
    },
    "en-US": {
      page_title: "Great Folder",
      page_description: "Organize files and folders on Windows in just a few clicks.",
      hero_title: "Great Folder",
      hero_copy: "Documents organized in just a few clicks.\nOne-time payment, and it's yours forever.",
      cta_buy: "Buy now",
      cta_how_it_works: "See how it works",
      cta_recover_license: "I lost my license",
      how_eyebrow: "How it works",
      how_title: "Organize without fighting Explorer",
      step_1_title: "Pick a folder",
      step_1_copy: "Open a Windows folder or drag it into Great Folder.",
      step_2_title: "Preview the result",
      step_2_copy: "Compare how the folder looks now and how it will look before you run it.",
      step_3_title: "Organize and undo",
      step_3_copy: "Run the organization and roll it back later with history and undo.",
      features_eyebrow: "Features",
      features_title: "Built for fast order on Windows",
      feature_1_title: "Sort by file type",
      feature_1_copy: "Separate images, documents, videos, executables, and more in a few clicks.",
      feature_2_title: "Sort by extension",
      feature_2_copy: "Create a clear structure for files like PDF, ZIP, JPG, MP3, and more.",
      feature_3_title: "Automation",
      feature_3_copy: "Keep folders organized with rules that automatically reapply your chosen structure.",
      feature_4_title: "Preview before moving",
      feature_4_copy: "See the predicted result before the real run and reduce the risk of a mess.",
      feature_5_title: "History and undo",
      feature_5_copy: "Review what ran and undo the last run or everything that was organized.",
      feature_6_title: "Productivity first",
      feature_6_copy: "A direct interface to organize files fast without relying on manual Explorer work.",
      ideal_eyebrow: "Ideal for",
      ideal_title: "Downloads that are always messy",
      ideal_copy: "If you download spreadsheets, PDFs, images, installers, and loose files every day, Great Folder turns that into a clear and predictable structure.",
      ideal_list_title: "Use it daily to:",
      ideal_list_1: "clean your Downloads folder",
      ideal_list_2: "separate documents by type",
      ideal_list_3: "flatten files from subfolders",
      ideal_list_4: "keep automation rules active",
      pricing_eyebrow: "One-time payment",
      pricing_title: "Buy once and keep the program",
      pricing_copy: "You pay once, get your license, and Great Folder is yours.",
      pricing_list_1: "pay once",
      pricing_list_2: "use it forever",
      pricing_list_3: "get your license after purchase",
      price_label: "You only pay once",
      download_eyebrow: "Download",
      download_title: "Download Great Folder for Windows",
      download_copy: "With your license, you download the installer and use the program on your PC.",
      faq_eyebrow: "FAQ",
      faq_title: "Common questions before and after purchase",
      faq_copy: "Straight answers about installation, license, automations, undo, and updates.",
      faq_q1: "Does Great Folder work on any Windows PC?",
      faq_a1: "It was built for Windows. The ideal scenario is a current Windows version with normal per-user install permission.",
      faq_q2: "Is it a one-time payment or a subscription?",
      faq_a2: "It is a one-time payment. You buy it once and keep the license.",
      faq_q3: "If I change computers, do I lose my license?",
      faq_a3: "No. You can recover the license and activate it again on the new PC through the recovery flow.",
      faq_q4: "Can I undo an organization?",
      faq_a4: "Yes. The app has history and options to undo the last run or undo the whole saved organization.",
      faq_q5: "Do automations organize everything by themselves?",
      faq_a5: "Yes. Once enabled, they monitor the folder and reorganize files using the selected rule.",
      faq_q6: "Does the program send my files to the internet?",
      faq_a6: "No. Your file organization happens locally on your computer.",
      faq_q7: "How do I receive updates?",
      faq_a7: "The app can check for new versions and update from settings while keeping your license active.",
      faq_q8: "What if I find a problem or bug?",
      faq_a8: "You can open the support page, describe the issue in detail, and send it for review.",
      support_eyebrow: "Support",
      support_title: "Found a problem?",
      support_copy: "Open the support page and describe what happened. The more detail you provide, the faster it is to fix.",
      support_cta: "Report a problem",
      checkout_missing: "Kiwify checkout is not configured yet. Fill in checkoutUrl in site-config.js.",
      checkout_ready: "",
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

  function localePricing(locale) {
    return pricingConfig[locale] || pricingConfig["pt-BR"] || { amountLabel: "R$ 29", checkoutLabel: "Comprar por R$ 29" };
  }

  function localeCheckoutUrl(locale) {
    return String(checkoutUrls[locale] || defaultCheckoutUrl).trim();
  }

  function translate(key) {
    return (translations[currentLocale] && translations[currentLocale][key]) || key;
  }

  function setStatus(message) {
    if (checkoutStatus) {
      checkoutStatus.textContent = message;
    }
  }

  function applyLocale() {
    const pricing = localePricing(currentLocale);
    const localeStrings = translations[currentLocale];

    document.documentElement.lang = currentLocale;
    document.title = localeStrings.page_title;
    if (metaDescription) {
      metaDescription.setAttribute("content", localeStrings.page_description);
    }

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (!key) {
        return;
      }
      if ((node.getAttribute("data-checkout-button") || "") !== "") {
        node.textContent = pricing.checkoutLabel;
        return;
      }
      node.textContent = translate(key);
    });

    if (priceValue) {
      priceValue.textContent = pricing.amountLabel;
    }

    localeButtons.forEach((button) => {
      const isActive = button.getAttribute("data-locale-button") === currentLocale;
      button.classList.toggle("is-active", isActive);
    });

    if (!localeCheckoutUrl(currentLocale)) {
      setStatus(translate("checkout_missing"));
      return;
    }

    setStatus(translate("checkout_ready"));
  }

  function setupFaqAccordion() {
    if (!faqTriggers.length) {
      return;
    }

    faqTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.closest(".faq-item");
        const panel = item ? item.querySelector(".faq-panel") : null;
        const isExpanded = trigger.getAttribute("aria-expanded") === "true";

        faqTriggers.forEach((otherTrigger) => {
          otherTrigger.setAttribute("aria-expanded", "false");
          const otherItem = otherTrigger.closest(".faq-item");
          const otherPanel = otherItem ? otherItem.querySelector(".faq-panel") : null;
          if (otherItem) {
            otherItem.classList.remove("is-open");
          }
          if (otherPanel) {
            otherPanel.hidden = true;
          }
        });

        if (isExpanded || !item || !panel) {
          return;
        }

        trigger.setAttribute("aria-expanded", "true");
        item.classList.add("is-open");
        panel.hidden = false;
      });
    });
  }

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

  checkoutButtons.forEach((button) => {
    button.setAttribute("href", "#");
    button.addEventListener("click", (event) => {
      const checkoutUrl = localeCheckoutUrl(currentLocale);
      if (!checkoutUrl) {
        event.preventDefault();
        window.alert(translate("checkout_missing"));
        return;
      }
      window.location.href = checkoutUrl;
    });
  });

  function elementIsFullyVisible(entry) {
    const viewportHeight = entry.rootBounds ? entry.rootBounds.height : window.innerHeight;
    return entry.intersectionRatio >= 1 && entry.boundingClientRect.height <= viewportHeight;
  }

  function setupRevealOnScroll() {
    if (!revealTargets.length || !("IntersectionObserver" in window)) {
      revealTargets.forEach((element) => {
        element.classList.add("is-visible");
      });
      return;
    }

    document.body.classList.add("reveal-ready");
    revealTargets.forEach((element, index) => {
      element.style.setProperty("--reveal-delay", `${Math.min(index * 35, 180)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!revealArmed) {
            return;
          }
          if (!elementIsFullyVisible(entry)) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 1,
      }
    );

    revealTargets.forEach((element) => {
      observer.observe(element);
    });

    window.addEventListener(
      "scroll",
      () => {
        if (revealArmed) {
          return;
        }
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 12) {
          revealArmed = true;
        }
        lastScrollY = currentScrollY;
      },
      { passive: true }
    );
  }

  applyLocale();
  setupFaqAccordion();
  setupRevealOnScroll();
})();
