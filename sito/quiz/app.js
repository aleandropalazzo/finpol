/* ==========================================================================
   Finpol Interactive Quiz Script - Deterministic Logic & Transition Effects
   ========================================================================== */

// --- CONFIGURATION BLOCK ---
// If you want to automatically send emails to a spreadsheet, Substack, or webhook (Make, Zapier, Formspree):
// Replace the URL below with your endpoint, or configure the fetch call in the submitEmail function.
const EMAIL_CAPTURE_ENDPOINT = "https://formspree.io/f/xgoqzgrv";

// Quiz Questions Data
const questions = [
    {
        id: "debiti",
        text: "Hai dei debiti attivi con tassi d'interesse elevati? (es. finanziamenti auto, prestiti personali)",
        options: [
            { value: "si", text: "Sì, ho finanziamenti o debiti con tasso elevato" },
            { value: "no", text: "Non ho debiti o ho solo debiti a tasso basso (es. mutuo, prestiti a tasso zero)." }
        ]
    },
    {
        id: "emergenza",
        text: "Se dovesse presentarsi un'emergenza finanziaria imprevista (perdita del lavoro, spese mediche, guasto auto, ecc.), saresti in grado di fronteggiarla con i tuoi risparmi attuali?",
        options: [
            { value: "si", text: "Sì" },
            { value: "no", text: "No" }
        ]
    },
    {
        id: "risparmio mensile",
        text: "Riesci a risparmiare regolarmente parte delle tue entrate?",
        options: [
            { value: "no", text: "No, ogni mese copro le spese a malapena." },
            { value: "si", text: "Si, ogni mese riesco a risparmiare più di 200 euro." }
        ]
    }
];

// App State
let currentQuestionIndex = 0;
const userAnswers = {};
let userEmail = "";

// Element Selectors
const welcomeScreen = document.getElementById("welcomeScreen");
const quizScreen = document.getElementById("quizScreen");
const emailScreen = document.getElementById("emailScreen");
const resultScreen = document.getElementById("resultScreen");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

/**
 * Handles screen transitions with a smooth fade-in/out effect
 */
function transitionScreen(fromScreen, toScreen, callback) {
    fromScreen.style.opacity = "0";
    fromScreen.style.transform = "translateY(-15px)";

    setTimeout(() => {
        fromScreen.style.display = "none";
        fromScreen.classList.remove("active");

        toScreen.style.display = "flex";
        toScreen.classList.add("active");

        // Trigger reflow for transition
        void toScreen.offsetWidth;

        toScreen.style.opacity = "1";
        toScreen.style.transform = "translateY(0)";

        if (callback) callback();
    }, 350); // Matches CSS transition speed
}

/**
 * Starts the quiz from the welcome screen
 */
function startQuiz() {
    currentQuestionIndex = 0;
    progressContainer.style.display = "flex";
    progressBar.style.width = "0%";

    transitionScreen(welcomeScreen, quizScreen, () => {
        renderQuestion();
    });
}

/**
 * Renders the current question and options
 */
function renderQuestion() {
    const question = questions[currentQuestionIndex];
    document.getElementById("questionTitle").innerText = question.text;

    // Update progress bar
    const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    progressText.innerHTML = `<span>Domanda ${currentQuestionIndex + 1} di ${questions.length}</span> <span>${Math.round(progressPercent)}%</span>`;

    const optionsContainer = document.getElementById("optionsContainer");
    optionsContainer.innerHTML = "";

    question.options.forEach((opt, idx) => {
        const optionLetter = String.fromCharCode(65 + idx); // A, B, C...

        const optionCard = document.createElement("button");
        optionCard.className = "option-card";
        optionCard.onclick = () => selectOption(question.id, opt.value, optionCard);

        optionCard.innerHTML = `
            <div class="option-badge">${optionLetter}</div>
            <div class="option-text">${opt.text}</div>
        `;

        optionsContainer.appendChild(optionCard);
    });
}

/**
 * Handles selection of an option and advances the quiz
 */
function selectOption(questionId, value, card) {
    userAnswers[questionId] = value;

    // Visual feedback for click
    card.classList.add("selected");

    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            // Smoothly transit to next question inside the same screen
            quizScreen.style.opacity = "0";
            setTimeout(() => {
                renderQuestion();
                quizScreen.style.opacity = "1";
            }, 200);
        } else {
            // End of questions, go to email capture screen
            progressBar.style.width = "100%";
            progressText.innerHTML = `<span>Completato</span> <span>100%</span>`;

            setTimeout(() => {
                progressContainer.style.opacity = "0";
                setTimeout(() => progressContainer.style.display = "none", 300);

                transitionScreen(quizScreen, emailScreen);
            }, 300);
        }
    }, 250);
}

/**
 * Handles form submission and email capture
 */
function submitEmail(event) {
    event.preventDefault();
    const emailInput = document.getElementById("userEmail");
    const emailError = document.getElementById("emailError");
    userEmail = emailInput.value.trim();

    if (!userEmail) return;

    // Email validation Regex (requires a dot and TLD like .it or .com)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(userEmail)) {
        emailError.innerText = "Inserisci una mail valida (es. nome@dominio.it)";
        emailError.style.display = "flex";
        emailInput.focus();
        emailInput.style.borderColor = "var(--accent-red)";
        return;
    } else {
        emailError.style.display = "none";
        emailInput.style.borderColor = "var(--border-light)";
    }

    // Disable button to prevent double submits
    const submitBtn = document.getElementById("btnSubmitEmail");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Elaborazione... <i class="fa-solid fa-circle-notch fa-spin icon-right"></i>`;

    // Submit to external endpoint if configured.
    // Only the email and the consent are sent: quiz answers and profile stay in the browser,
    // so that no personal financial profile is linked to an identifiable person.
    if (EMAIL_CAPTURE_ENDPOINT) {
        fetch(EMAIL_CAPTURE_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                email: userEmail,
                source: "Quiz - iscrizione newsletter",
                newsletter_consent: true,
                consent_timestamp: new Date().toISOString()
            })
        })
            .then(() => showResult())
            .catch(err => {
                console.error("Error submitting email:", err);
                // Show result anyway so user experience is not broken
                showResult();
            });
    } else {
        // Simulate network delay for premium feel
        setTimeout(() => {
            showResult();
        }, 1200);
    }
}

/**
 * Shows the result without subscribing to the newsletter
 */
function skipEmail() {
    document.getElementById("btnSkipEmail").disabled = true;
    showResult();
}

/**
 * Readiness check (Deterministic Rules)
 */
function calculateProfile() {
    // Rule 1: Debiti = si -> DEBITI (Semaforo Rosso)
    if (userAnswers.debiti === "si") {
        return "DEBITI";
    }

    // Rule 2: Debiti = no, Emergenza = no -> EMERGENZA (Semaforo Rosso)
    if (userAnswers.emergenza === "no") {
        return "EMERGENZA";
    }

    // Rule 3: Debiti = no, Emergenza = si, Risparmio = no -> NO_RISPARMIO (Semaforo Giallo)
    if (userAnswers["risparmio mensile"] === "no") {
        return "NO_RISPARMIO";
    }

    // Rule 4: Debiti = no, Emergenza = si, Risparmio = si -> PRONTO (Semaforo Verde)
    return "PRONTO";
}

/**
 * Computes and renders the result screen based on the profile
 */
function showResult(forcedProfile = null) {
    const profile = forcedProfile || calculateProfile();
    let resultHTML = "";

    const disclaimerHTML = `
        <div class="disclaimer-text" style="margin-bottom: 2rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 1rem; text-align: left; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
            <strong>Nota Educativa Importante:</strong> I risultati di questo test hanno scopo puramente educativo e didattico. Non costituiscono consulenza finanziaria personalizzata ai sensi del D.Lgs. 58/1998 (TUF) e della Direttiva MiFID II e non indicano alcuno strumento finanziario adatto a te. Il risultato si basa su 3 risposte semplificate e non considera la tua situazione complessiva (patrimonio, reddito, conoscenze ed esperienza, obiettivi, situazione fiscale). I principi descritti sono concetti generali di finanza personale. Prima di prendere decisioni, valuta la tua situazione con l'aiuto di un Consulente Finanziario Autonomo iscritto all'OCF.
        </div>
    `;

    if (profile === "DEBITI") {
        resultHTML = disclaimerHTML + `
            <div class="result-rosso">
                <div class="result-header">
                    <div class="result-icon-box">
                        <i class="fa-solid fa-circle-xmark"></i>
                    </div>
                    <div class="result-badge">
                        <i class="fa-solid fa-triangle-exclamation"></i> Semaforo Rosso
                    </div>
                    <h2 class="title">Priorità ai debiti</h2>
                </div>
                
                <div class="result-strategy-card">
                    <h3><i class="fa-solid fa-shield"></i> Principio di finanza personale:</h3>
                    <p>Dal punto di vista dell'educazione finanziaria, si ritiene solitamente inefficiente iniziare a investire nei mercati se si hanno contemporaneamente debiti attivi con tassi d'interesse elevati.</p>
                    <ul>
                        <li><strong>Rendimento matematico:</strong> Estinguere anticipatamente un debito al consumo equivale matematicamente a ottenere un rendimento certo pari al tasso d'interesse evitato (al netto di eventuali penali di estinzione anticipata).</li>
                        <li><strong>Flusso di cassa:</strong> Ridurre l'indebitamento libera flusso di cassa mensile, gettando le basi per un'eventuale futura pianificazione degli investimenti.</li>
                    </ul>
                </div>

                <a href="https://www.youtube.com/watch?v=IK5a_gfgqzQ" target="_blank" rel="noopener" class="btn btn-primary">
                    Guarda il video: i 4 casi in cui investire è dannoso <i class="fa-solid fa-arrow-right icon-right"></i>
                </a>
            </div>
        `;
    } else if (profile === "EMERGENZA") {
        resultHTML = disclaimerHTML + `
            <div class="result-rosso">
                <div class="result-header">
                    <div class="result-icon-box">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div class="result-badge">
                        <i class="fa-solid fa-shield-heart"></i> Fondo Emergenza
                    </div>
                    <h2 class="title">Costruisci la tua rete di sicurezza</h2>
                </div>
                
                <div class="result-strategy-card">
                    <h3><i class="fa-solid fa-vault"></i> Concetto chiave:</h3>
                    <p>La teoria della finanza personale suggerisce che, prima di allocare capitale in strumenti finanziari volatili, sia opportuno valutare la creazione di un fondo d'emergenza liquido.</p>
                    <ul>
                        <li><strong>Prevenzione:</strong> Un'adeguata liquidità di sicurezza riduce il rischio di dover liquidare prematuramente eventuali investimenti (magari in perdita) in caso di imprevisti.</li>
                        <li><strong>Pratica didattica:</strong> L'accantonamento di una quota pari a 3-6 mesi di spese correnti è considerata una base standard per stabilizzare la propria situazione patrimoniale iniziale.</li>
                    </ul>
                </div>

                <a href="https://www.youtube.com/watch?v=IK5a_gfgqzQ" target="_blank" rel="noopener" class="btn btn-primary">
                    Guarda il video: i 4 casi in cui investire è dannoso <i class="fa-solid fa-arrow-right icon-right"></i>
                </a>
            </div>
        `;
    } else if (profile === "NO_RISPARMIO") {
        resultHTML = disclaimerHTML + `
            <div class="result-giallo">
                <div class="result-header">
                    <div class="result-icon-box">
                        <i class="fa-solid fa-hand-holding-dollar"></i>
                    </div>
                    <div class="result-badge">
                        <i class="fa-solid fa-triangle-exclamation"></i> Attenzione
                    </div>
                    <h2 class="title">Aumenta le entrate prima di investire</h2>
                </div>
                
                <div class="result-strategy-card">
                    <h3><i class="fa-solid fa-arrow-up-right-from-square"></i> Teoria del risparmio:</h3>
                    <p>In assenza di una capacità di risparmio regolare, l'investimento finanziario sistematico potrebbe risultare prematuro o inefficace secondo i principi base di educazione finanziaria.</p>
                    <ul>
                        <li><strong>Focus sulle entrate:</strong> Molte strategie educative suggeriscono di dare prima priorità all'ottimizzazione del proprio reddito (competenze, carriera) o alla riduzione dei costi fissi.</li>
                        <li><strong>Margine positivo:</strong> Il prerequisito teorico per qualsiasi pianificazione degli investimenti è la generazione di una differenza positiva e costante tra entrate e uscite.</li>
                    </ul>
                </div>

                <a href="https://www.youtube.com/watch?v=IK5a_gfgqzQ" target="_blank" rel="noopener" class="btn btn-primary">
                    Guarda il video: i 4 casi in cui investire è dannoso <i class="fa-solid fa-arrow-right icon-right"></i>
                </a>
            </div>
        `;
    } else if (profile === "PRONTO") {
        resultHTML = disclaimerHTML + `
            <div class="result-verde">
                <div class="result-header">
                    <div class="result-icon-box">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <div class="result-badge">
                        <i class="fa-solid fa-circle"></i> Semaforo Verde
                    </div>
                    <h2 class="title">Hai le basi per iniziare a informarti</h2>
                </div>

                <div class="result-strategy-card">
                    <h3><i class="fa-solid fa-book-open"></i> Concetto chiave:</h3>
                    <p>Secondo i principi base della finanza personale, assenza di debiti costosi, un fondo d'emergenza e una capacità di risparmio regolare sono i prerequisiti da cui partire prima di valutare qualsiasi investimento.</p>
                    <ul>
                        <li><strong>Prossimo passo:</strong> Capire come funzionano le principali asset class (azioni, obbligazioni, liquidità, oro) e come cambia il rapporto tra rischio e rendimento al variare dell'orizzonte temporale.</li>
                        <li><strong>Da valutare con attenzione:</strong> I tuoi obiettivi, i tempi in cui potresti aver bisogno del denaro e quanto riusciresti a sopportare oscillazioni anche forti del valore investito.</li>
                    </ul>
                </div>

                <a href="../index.html#portafogli" class="btn btn-primary">
                    Scopri come si costruisce un portafoglio <i class="fa-solid fa-arrow-right icon-right"></i>
                </a>
            </div>
        `;
    }

    if (forcedProfile) {
        document.getElementById("resultScreen").innerHTML = resultHTML;
    } else {
        transitionScreen(emailScreen, resultScreen, () => {
            document.getElementById("resultScreen").innerHTML = resultHTML;
        });
    }
}

// Allow direct preview of results via URL parameter (e.g., ?result=PRONTO)
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const forcedResult = urlParams.get('result');
    if (forcedResult) {
        // Hide all screens
        document.querySelectorAll('.card').forEach(card => {
            card.style.display = 'none';
            card.classList.remove('active');
        });
        document.getElementById('progressContainer').style.display = 'none';

        // Show result screen
        const resultScreen = document.getElementById("resultScreen");
        resultScreen.style.display = 'flex';
        resultScreen.style.opacity = '1';
        resultScreen.classList.add('active');

        // Render the result HTML directly
        showResult(forcedResult);
    }
});
