"use strict";

/*
==================================================
CONFIGURAÇÃO COMERCIAL
==================================================

Preço de referência informado: 35.000 AOA.

Para ativar uma promoção verdadeira:
1. Define PROMO_ENABLED como true.
2. Introduz o preço promocional confirmado.
3. Introduz a data final verdadeira em ISO 8601.
4. Utiliza um fuso horário explícito.

Exemplo de formato de data:
2026-12-31T23:59:59+01:00

O exemplo é apenas ilustrativo.
Não o utilizes como prazo real sem confirmação.

A configuração inicial não apresenta promoção.
*/

const PRODUCT_CONFIG = {
    name: "Compliance Nível Básico",

    regularPriceAOA: 35000,

    promoEnabled: false,

    promoPriceAOA: null,

    promoEndAt: null,

    checkoutUrl:
        "https://pay.kursinha.com/c/6a8a4a89295332d42e7bfa1b?afiliateId=6ac389dd7d7288b38e701a51",

    livePurchaseNotificationsEnabled: false
};


/*
==================================================
FORMATAÇÃO DE MOEDA
==================================================
*/

function formatAOA(value) {
    return (
        new Intl.NumberFormat("pt-PT", {
            maximumFractionDigits: 0
        }).format(value) + " AOA"
    );
}


/*
==================================================
CONFIGURAÇÃO DO PREÇO
==================================================
*/

function configurePrice() {
    const regularPriceElement =
        document.getElementById("regularPrice");

    const regularPriceContainer =
        document.getElementById("regularPriceContainer");

    const promoPriceContainer =
        document.getElementById("promoPriceContainer");

    const promoPriceElement =
        document.getElementById("promoPrice");

    const savingsElement =
        document.getElementById("savings");

    const countdownContainer =
        document.getElementById("countdownContainer");

    if (
        !regularPriceElement ||
        !regularPriceContainer ||
        !promoPriceContainer ||
        !promoPriceElement ||
        !savingsElement ||
        !countdownContainer
    ) {
        return;
    }

    regularPriceElement.textContent =
        formatAOA(PRODUCT_CONFIG.regularPriceAOA);

    promoPriceContainer.hidden = true;
    countdownContainer.hidden = true;

    if (!PRODUCT_CONFIG.promoEnabled) {
        return;
    }

    const promoPrice = PRODUCT_CONFIG.promoPriceAOA;

    const promoEndTimestamp =
        PRODUCT_CONFIG.promoEndAt
            ? Date.parse(PRODUCT_CONFIG.promoEndAt)
            : NaN;

    const validPrice =
        Number.isFinite(promoPrice) &&
        promoPrice > 0 &&
        promoPrice < PRODUCT_CONFIG.regularPriceAOA;

    const validDate =
        Number.isFinite(promoEndTimestamp) &&
        promoEndTimestamp > Date.now();

    if (!validPrice || !validDate) {
        console.warn(
            "Promoção não ativada: verifica o preço e a data de expiração."
        );

        return;
    }

    const savings =
        PRODUCT_CONFIG.regularPriceAOA - promoPrice;

    const percentage =
        Math.round(
            (savings / PRODUCT_CONFIG.regularPriceAOA) * 100
        );

    promoPriceElement.textContent = formatAOA(promoPrice);

    savingsElement.textContent =
        "Poupe " + formatAOA(savings) +
        " (" + percentage + "% de desconto)";

    promoPriceContainer.hidden = false;

    countdownContainer.hidden = false;

    startCountdown(promoEndTimestamp);
}


/*
==================================================
CRONÓMETRO PROMOCIONAL
==================================================

O cronómetro não reinicia automaticamente.

Quando a data terminar, a promoção deixa de aparecer.
*/

let countdownInterval = null;

function startCountdown(endTimestamp) {
    const countdownContainer =
        document.getElementById("countdownContainer");

    const regularPriceContainer =
        document.getElementById("regularPriceContainer");

    const promoPriceContainer =
        document.getElementById("promoPriceContainer");

    const daysElement =
        document.getElementById("days");

    const hoursElement =
        document.getElementById("hours");

    const minutesElement =
        document.getElementById("minutes");

    const secondsElement =
        document.getElementById("seconds");

    function updateCountdown() {
        const remaining = endTimestamp - Date.now();

        if (remaining <= 0) {
            clearInterval(countdownInterval);

            countdownContainer.hidden = true;

            promoPriceContainer.hidden = true;

            regularPriceContainer.hidden = false;

            /*
            A promoção expirada não é reiniciada.

            Para ativar uma nova promoção, atualiza a
            configuração com condições comerciais reais.
            */

            return;
        }

        const totalSeconds =
            Math.floor(remaining / 1000);

        const days =
            Math.floor(totalSeconds / 86400);

        const hours =
            Math.floor((totalSeconds % 86400) / 3600);

        const minutes =
            Math.floor((totalSeconds % 3600) / 60);

        const seconds =
            totalSeconds % 60;

        daysElement.textContent =
            String(days).padStart(2, "0");

        hoursElement.textContent =
            String(hours).padStart(2, "0");

        minutesElement.textContent =
            String(minutes).padStart(2, "0");

        secondsElement.textContent =
            String(seconds).padStart(2, "0");
    }

    updateCountdown();

    countdownInterval = setInterval(
        updateCountdown,
        1000
    );
}


/*
==================================================
LINKS DE CHECKOUT
==================================================
*/

function configureCheckoutLinks() {
    const checkoutLinks =
        document.querySelectorAll(".checkout-link");

    checkoutLinks.forEach((link) => {
        link.href = PRODUCT_CONFIG.checkoutUrl;
    });
}


/*
==================================================
ANO AUTOMÁTICO DO RODAPÉ
==================================================
*/

function configureFooterYear() {
    const yearElement =
        document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent =
            new Date().getFullYear();
    }
}


/*
==================================================
BARRA DE PROGRESSO DE LEITURA
==================================================
*/

function configureReadingProgress() {
    const progress =
        document.getElementById("readingProgress");

    if (!progress) {
        return;
    }

    let ticking = false;

    function updateProgress() {
        const scrollTop =
            window.scrollY || document.documentElement.scrollTop;

        const scrollableHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const percentage =
            scrollableHeight > 0
                ? (scrollTop / scrollableHeight) * 100
                : 0;

        progress.style.width =
            Math.min(100, Math.max(0, percentage)) + "%";

        ticking = false;
    }

    window.addEventListener(
        "scroll",
        () => {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        },
        { passive: true }
    );

    updateProgress();
}


/*
==================================================
BOTÃO FIXO PARA TELEMÓVEIS
==================================================

O botão desaparece quando o visitante está perto
da oferta ou do rodapé.

Isto evita sobrepor o botão principal de compra.
*/

function configureMobileCTA() {
    const mobileCTA =
        document.getElementById("mobileCTA");

    const offerSection =
        document.getElementById("oferta");

    const footer =
        document.querySelector(".footer");

    if (!mobileCTA || !offerSection || !footer) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const visibleSections = new Set();

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleSections.add(entry.target);
                } else {
                    visibleSections.delete(entry.target);
                }
            });

            const shouldHide =
                visibleSections.has(offerSection) ||
                visibleSections.has(footer);

            mobileCTA.classList.toggle(
                "is-hidden",
                shouldHide
            );
        },
        {
            threshold: 0.05
        }
    );

    observer.observe(offerSection);

    observer.observe(footer);
}


/*
==================================================
INICIALIZAÇÃO
==================================================
*/

document.addEventListener("DOMContentLoaded", () => {
    configureCheckoutLinks();

    configurePrice();

    configureFooterYear();

    configureReadingProgress();

    configureMobileCTA();
});
