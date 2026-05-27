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

  const translations = {
    "pt-BR": {
      page_title: "Great Folder",
      page_description: "Organize arquivos e pastas no Windows com poucos cliques.",
      hero_eyebrow: "Organizacao automatica para Windows",
      hero_title: "Great Folder",
      hero_copy: "Organize Downloads, Desktop e outras pastas em segundos. Separe por tipo, extensao ou data e mantenha tudo limpo, sem precisar fazer isso na mao.",
      cta_buy: "Comprar por R$ 29",
      cta_how_it_works: "Ver como funciona",
      hero_point_1: "Pagamento unico",
      hero_point_2: "Sem assinatura",
      hero_point_3: "Com reversao",
      how_eyebrow: "Como funciona",
      how_title: "Organize sem complicar o Explorer",
      step_1_title: "Escolha a pasta",
      step_1_copy: "Abra uma pasta do Windows ou arraste para dentro do Great Folder.",
      step_2_title: "Veja a previa",
      step_2_copy: "Compare como a pasta esta agora e como ela vai ficar antes de executar.",
      step_3_title: "Organize e reverta",
      step_3_copy: "Execute a organizacao e volte atras, se quiser, com historico e reversao.",
      features_eyebrow: "Recursos",
      features_title: "Feito para quem quer ordem rapida no Windows",
      feature_1_title: "Organizacao por tipo",
      feature_1_copy: "Separe imagens, documentos, videos, executaveis e mais com poucos cliques.",
      feature_2_title: "Organizacao por extensao",
      feature_2_copy: "Crie uma estrutura objetiva para arquivos como PDF, ZIP, JPG, MP3 e outros.",
      feature_3_title: "Automacao",
      feature_3_copy: "Mantenha pastas sempre organizadas com regras que reaplicam o padrao automaticamente.",
      feature_4_title: "Previa antes de mover",
      feature_4_copy: "Veja o resultado previsto antes da execucao real e reduza o risco de bagunca.",
      feature_5_title: "Historico e reversao",
      feature_5_copy: "Confira o que foi executado e desfaça a ultima execucao ou tudo o que foi organizado.",
      feature_6_title: "Foco em produtividade",
      feature_6_copy: "Interface direta para organizar arquivos rapido, sem depender de fluxo manual no Explorer.",
      ideal_eyebrow: "Ideal para",
      ideal_title: "Downloads que vivem baguncados",
      ideal_copy: "Se voce baixa planilhas, PDFs, imagens, instaladores e arquivos soltos todos os dias, o Great Folder transforma isso em uma estrutura clara e previsivel.",
      ideal_list_title: "Use no dia a dia para:",
      ideal_list_1: "limpar a pasta Downloads",
      ideal_list_2: "separar documentos por tipo",
      ideal_list_3: "desempastar arquivos de subpastas",
      ideal_list_4: "manter regras automaticas ativas",
      pricing_eyebrow: "Pagamento unico",
      pricing_title: "Compre o Great Folder",
      pricing_copy: "Compre com checkout externo simples e receba o acesso ao Great Folder sem depender de checkout embutido no app.",
      pricing_list_1: "licenca vitalicia",
      pricing_list_2: "sem assinatura",
      pricing_list_3: "checkout externo seguro",
      price_label: "Pagamento unico",
      price_note: "Cole o link de checkout da Kiwify em site-config.js.",
      download_eyebrow: "Download",
      download_title: "Baixe o Great Folder para Windows",
      download_copy: "Esta pagina ja esta preparada para concentrar o instalador e as proximas versoes do programa.",
      download_note: "Depois, conecte a entrega do .exe ao pos-compra escolhido.",
      checkout_missing: "Checkout da Kiwify ainda nao configurado. Preencha checkoutUrl em site-config.js.",
      checkout_ready: "Checkout da Kiwify configurado e pronto para este pais.",
    },
    "en-US": {
      page_title: "Great Folder",
      page_description: "Organize files and folders on Windows in just a few clicks.",
      hero_eyebrow: "Automatic Windows organization",
      hero_title: "Great Folder",
      hero_copy: "Organize Downloads, Desktop, and other folders in seconds. Sort by type, extension, or date and keep everything clean without doing it by hand.",
      cta_buy: "Buy now",
      cta_how_it_works: "See how it works",
      hero_point_1: "One-time payment",
      hero_point_2: "No subscription",
      hero_point_3: "Undo included",
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
      pricing_title: "Buy Great Folder",
      pricing_copy: "Buy through a simple external checkout and get access to Great Folder without embedding checkout inside the app.",
      pricing_list_1: "lifetime license",
      pricing_list_2: "no subscription",
      pricing_list_3: "secure external checkout",
      price_label: "One-time payment",
      price_note: "Paste the Kiwify checkout link into site-config.js.",
      download_eyebrow: "Download",
      download_title: "Download Great Folder for Windows",
      download_copy: "This page is already prepared to host the installer and future program versions.",
      download_note: "Then connect .exe delivery to your chosen post-purchase flow.",
      checkout_missing: "Kiwify checkout is not configured yet. Fill in checkoutUrl in site-config.js.",
      checkout_ready: "Kiwify checkout is configured and ready for this country.",
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

  applyLocale();
})();
