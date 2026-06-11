(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const wizardScreen = $("#wizardScreen");
  const loadingScreen = $("#loadingScreen");
  const resultScreen = $("#resultScreen");
  const form = $("#recoveryForm");

  const usernameInput = $("#username");
  const displayNameInput = $("#displayName");
  const robuxRange = $("#robuxRange");
  const robuxValue = $("#robuxValue");

  const backBtn = $("#backBtn");
  const nextBtn = $("#nextBtn");
  const copyBtn = $("#copyBtn");
  const restartBtn = $("#restartBtn");
  const skipBtn = $("#skipBtn");

  const stepLabel = $("#stepLabel");
  const stepTitle = $("#stepTitle");
  const stepPanels = $$(".step-panel");
  const stepDots = $$(".step-dot");
  const stepLines = $$(".step-line");

  const progressBar = $("#progressBar");
  const percent = $("#percent");
  const timeRemaining = $("#timeRemaining");
  const terminal = $("#terminal");
  const terminalStatus = $("#terminalStatus");

  const CONFIG = {
    loadingDurationMs: 120000,
    errorPauseMs: 5200,
    skipUnlockSeconds: 10,
    skipAmountMs: 5000,
    finishDelayMs: 900
  };

  const stepTitles = [
    "Identificar conta",
    "Confirmar apelido",
    "Estimar saldo",
    "Confirmar período"
  ];

  const robuxOptions = [
    "0 Robux",
    "1–100 Robux",
    "100–500 Robux",
    "1.000 Robux",
    "1.000–10.000 Robux",
    "10.000–100.000 Robux",
    "100.000+ Robux"
  ];

  let currentStep = 1;
  let loadingController = null;
  let audioContext = null;

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          "aria-hidden": "true"
        }
      });
    }
  }

  function playTone(type = "click") {
    try {
      audioContext ||= new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

      const now = audioContext.currentTime;
      const gain = audioContext.createGain();
      const oscillator = audioContext.createOscillator();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        type === "success" ? 660 : 430,
        now
      );

      gain.gain.setValueAtTime(0.0001, now);

      gain.gain.exponentialRampToValueAtTime(
        type === "success" ? 0.055 : 0.025,
        now + 0.01
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + (type === "success" ? 0.24 : 0.08)
      );

      if (type === "success") {
        oscillator.frequency.exponentialRampToValueAtTime(
          880,
          now + 0.18
        );
      }

      oscillator.start(now);

      oscillator.stop(
        now + (type === "success" ? 0.25 : 0.09)
      );
    } catch {
      // Continua funcionando sem som.
    }
  }

  function showScreen(screen) {
    [wizardScreen, loadingScreen, resultScreen]
      .filter(Boolean)
      .forEach((element) => {
        element.classList.add("hidden");
      });

    screen?.classList.remove("hidden");
  }

  function updateStep() {
    stepPanels.forEach((panel, index) => {
      panel.classList.toggle(
        "active",
        index === currentStep - 1
      );
    });

    stepDots.forEach((dot, index) => {
      dot.classList.toggle(
        "active",
        index === currentStep - 1
      );

      dot.classList.toggle(
        "done",
        index < currentStep - 1
      );
    });

    stepLines.forEach((line, index) => {
      line.classList.toggle(
        "done",
        index < currentStep - 1
      );
    });

    if (stepLabel) {
      stepLabel.textContent = `Etapa ${currentStep} de 4`;
    }

    if (stepTitle) {
      stepTitle.textContent = stepTitles[currentStep - 1];
    }

    backBtn?.classList.toggle(
      "hidden",
      currentStep === 1
    );

    const text = nextBtn?.querySelector("span");

    if (text) {
      text.textContent =
        currentStep === 4
          ? "Iniciar recuperação"
          : "Continuar";
    }
  }

  function validateUsername() {
    const value = usernameInput?.value.trim() || "";
    const error = $("#usernameError");

    const pattern =
      /^(?=.{3,20}$)(?!_)(?!.*_$)(?!.*_.*_)[A-Za-z0-9_]+$/;

    if (!value) {
      error.textContent = "Digite um nome de usuário.";
      return false;
    }

    if (!pattern.test(value)) {
      error.textContent =
        "Use 3–20 caracteres, letras, números e no máximo um “_”, sem começar ou terminar com ele.";

      return false;
    }

    error.textContent = "";
    return true;
  }

  function validateDisplayName() {
    const value = displayNameInput?.value.trim() || "";
    const error = $("#displayNameError");

    if (value.length < 3 || value.length > 20) {
      error.textContent =
        "Digite um apelido entre 3 e 20 caracteres.";

      return false;
    }

    error.textContent = "";
    return true;
  }

  function validateLostTime() {
    const selected =
      $('input[name="lostTime"]:checked');

    const error = $("#lostTimeError");

    if (!selected) {
      error.textContent =
        "Escolha há quanto tempo perdeu o acesso.";

      return false;
    }

    error.textContent = "";
    return true;
  }

  function validateCurrentStep() {
    if (currentStep === 1) {
      return validateUsername();
    }

    if (currentStep === 2) {
      return validateDisplayName();
    }

    if (currentStep === 4) {
      return validateLostTime();
    }

    return true;
  }

  function updateRobux() {
    if (!robuxRange || !robuxValue) return;

    const index = Number(robuxRange.value);
    const maximum = Number(robuxRange.max);
    const fill = (index / maximum) * 100;

    robuxValue.textContent = robuxOptions[index];

    robuxRange.style.background =
      `linear-gradient(to right, var(--text) ${fill}%, var(--border) ${fill}%)`;

    $$(".preset").forEach((button) => {
      button.classList.toggle(
        "selected",
        Number(button.dataset.range) === index
      );
    });
  }

  function formatTime(seconds) {
    const safeSeconds = Math.max(0, Math.ceil(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const rest = safeSeconds % 60;

    return (
      `${String(minutes).padStart(2, "0")}:` +
      `${String(rest).padStart(2, "0")}`
    );
  }

  function addLog(tag, message, type = "") {
    if (!terminal) return;

    const row = document.createElement("div");
    const tagElement = document.createElement("span");
    const messageElement = document.createElement("span");

    row.className = `log-line ${type}`.trim();

    tagElement.className = "tag";
    tagElement.textContent = tag;

    messageElement.textContent = message;

    row.append(tagElement, messageElement);
    terminal.appendChild(row);

    terminal.scrollTop = terminal.scrollHeight;
  }

  function generateKey(username) {
    const alphabet =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    const numbers = new Uint32Array(7);

    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(numbers);
    } else {
      for (let index = 0; index < numbers.length; index++) {
        numbers[index] =
          Math.floor(Math.random() * 0xffffffff);
      }
    }

    const randomPart = [...numbers]
      .map((number) => {
        return alphabet[number % alphabet.length];
      })
      .join("");

    const safeUsername = username
      .replace(/[^A-Za-z0-9_]/g, "")
      .slice(0, 20);

    return `${safeUsername}#RECOVERY-DEMO!${randomPart}`;
  }

  function finishLoading() {
    const username =
      usernameInput?.value.trim() || "usuario";

    const displayName =
      displayNameInput?.value.trim() || "Sem apelido";

    const resultUsername = $("#resultUsername");
    const resultDisplayName = $("#resultDisplayName");
    const resultRobux = $("#resultRobux");
    const recoveryKey = $("#recoveryKey");

    if (resultUsername) {
      resultUsername.textContent = username;
    }

    if (resultDisplayName) {
      resultDisplayName.textContent = displayName;
    }

    if (resultRobux && robuxRange) {
      resultRobux.textContent =
        robuxOptions[Number(robuxRange.value)];
    }

    if (recoveryKey) {
      recoveryKey.textContent =
        generateKey(username);
    }

    showScreen(resultScreen);
    playTone("success");
    refreshIcons();
  }

  function startLoading() {
    loadingController?.abort();

    loadingController = new AbortController();

    const { signal } = loadingController;

    showScreen(loadingScreen);

    terminal?.replaceChildren();

    progressBar.style.width = "0%";
    percent.textContent = "0%";

    timeRemaining.textContent = formatTime(
      CONFIG.loadingDurationMs / 1000 +
      (CONFIG.errorPauseMs * 2) / 1000
    );

    terminalStatus.textContent = "Em execução";
    terminalStatus.classList.remove("error");

    const startedAt = performance.now();

    let pausedTotalMs = 0;
    let pauseStartedAt = null;
    let currentPause = null;

    let completed = false;
    let skipUnlocked = false;
    let skipUsed = false;
    let skipCountdown = CONFIG.skipUnlockSeconds;

    /*
      Esse valor é somado ao tempo decorrido.
      Assim, clicar realmente pula cinco segundos.
    */
    let skipCreditMs = 0;

    const firedEvents = new Set();

    const events = [
      {
        at: 0.02,
        tag: "INÍCIO",
        message: "Criando uma sessão local protegida."
      },
      {
        at: 0.08,
        tag: "DADOS",
        message: "Validando o formato do nome de usuário informado."
      },
      {
        at: 0.15,
        tag: "PERFIL",
        message: "Comparando o apelido e as informações declaradas."
      },
      {
        at: 0.23,
        tag: "SALDO",
        message: "Organizando a estimativa de Robux selecionada."
      },
      {
        at: 0.31,
        tag: "SISTEMA",
        message: "Preparando a primeira etapa do processamento."
      },
      {
        at: 0.34,
        tag: "ERRO 01",
        message: "Falha ao processar a etapa local. Tentando novamente.",
        type: "error",
        pause: true
      },
      {
        at: 0.40,
        tag: "RETOMADA",
        message: "Processamento local restabelecido.",
        type: "success"
      },
      {
        at: 0.49,
        tag: "HISTÓRICO",
        message: "Verificando a consistência do período informado."
      },
      {
        at: 0.58,
        tag: "CHAVE",
        message: "Reservando um identificador temporário."
      },
      {
        at: 0.66,
        tag: "VALIDAÇÃO",
        message: "Conferindo a integridade dos dados locais."
      },
      {
        at: 0.71,
        tag: "ERRO 02",
        message: "Tempo limite interno excedido. Repetindo a verificação.",
        type: "error",
        pause: true
      },
      {
        at: 0.77,
        tag: "RETOMADA",
        message: "Segunda tentativa concluída com sucesso.",
        type: "success"
      },
      {
        at: 0.84,
        tag: "SEGURANÇA",
        message: "Finalizando o canal protegido do navegador."
      },
      {
        at: 0.92,
        tag: "RESULTADO",
        message: "Gerando a chave temporária."
      },
      {
        at: 0.98,
        tag: "CONCLUÍDO",
        message: "Processamento pronto para exibição.",
        type: "success"
      }
    ];

    addLog(
      "AVISO",
      "Nenhuma senha, cookie ou token é processado."
    );

    if (skipBtn) {
      skipBtn.classList.remove("hidden");
      skipBtn.classList.remove("ready");
      skipBtn.disabled = true;
      skipBtn.textContent =
        `Pular em ${skipCountdown}s`;
    }

    const skipTimer = window.setInterval(() => {
      if (
        signal.aborted ||
        completed ||
        skipUsed ||
        !skipBtn
      ) {
        window.clearInterval(skipTimer);
        return;
      }

      skipCountdown -= 1;

      if (skipCountdown <= 0) {
        skipUnlocked = true;
        skipBtn.disabled = false;
        skipBtn.classList.add("ready");
        skipBtn.textContent =
          "Pular 5s do carregamento";

        window.clearInterval(skipTimer);
        return;
      }

      skipBtn.textContent =
        `Pular em ${skipCountdown}s`;
    }, 1000);

    signal.addEventListener(
      "abort",
      () => {
        window.clearInterval(skipTimer);
      },
      { once: true }
    );

    if (skipBtn) {
      skipBtn.onclick = () => {
        if (
          !skipUnlocked ||
          skipUsed ||
          completed
        ) {
          return;
        }

        skipCreditMs += CONFIG.skipAmountMs;

        skipUsed = true;
        skipUnlocked = false;

        skipBtn.disabled = true;
        skipBtn.classList.remove("ready");
        skipBtn.textContent =
          "5 segundos pulados";

        playTone("click");

        addLog(
          "ATALHO",
          "Cinco segundos foram reduzidos do processamento.",
          "success"
        );
      };
    }

    function beginPause(eventIndex) {
      if (currentPause !== null) return;

      currentPause = eventIndex;
      pauseStartedAt = performance.now();

      terminalStatus.textContent = "Erro detectado";
      terminalStatus.classList.add("error");

      window.setTimeout(() => {
        if (signal.aborted) return;

        if (pauseStartedAt !== null) {
          pausedTotalMs +=
            performance.now() - pauseStartedAt;
        }

        pauseStartedAt = null;
        currentPause = null;

        terminalStatus.textContent = "Em execução";
        terminalStatus.classList.remove("error");
      }, CONFIG.errorPauseMs);
    }

    function calculateVisualRatio(rawRatio) {
      /*
        Começa mais rápido e desacelera
        conforme se aproxima do final.
      */
      if (rawRatio < 0.55) {
        return rawRatio * 0.78;
      }

      const normalized =
        (rawRatio - 0.55) / 0.45;

      return (
        0.429 +
        Math.pow(normalized, 1.85) * 0.571
      );
    }

    function frame(now) {
      if (signal.aborted || completed) return;

      const currentPauseMs =
        pauseStartedAt !== null
          ? now - pauseStartedAt
          : 0;

      const activeElapsedMs = Math.max(
        0,
        now -
          startedAt -
          pausedTotalMs -
          currentPauseMs +
          skipCreditMs
      );

      const rawRatio = Math.min(
        1,
        activeElapsedMs /
          CONFIG.loadingDurationMs
      );

      const visualRatio = Math.min(
        1,
        calculateVisualRatio(rawRatio)
      );

      const percentage = Math.floor(
        visualRatio * 100
      );

      progressBar.style.width =
        `${percentage}%`;

      percent.textContent =
        `${percentage}%`;

      const remainingActiveSeconds =
        Math.max(
          0,
          (
            CONFIG.loadingDurationMs -
            activeElapsedMs
          ) / 1000
        );

      const pendingPauses = events.filter(
        (event, index) => {
          return (
            event.pause &&
            !firedEvents.has(index)
          );
        }
      ).length;

      const currentPauseRemaining =
        pauseStartedAt !== null
          ? Math.max(
              0,
              (
                CONFIG.errorPauseMs -
                currentPauseMs
              ) / 1000
            )
          : 0;

      const remainingPauseSeconds =
        pendingPauses *
          (CONFIG.errorPauseMs / 1000) +
        currentPauseRemaining;

      timeRemaining.textContent =
        formatTime(
          remainingActiveSeconds +
          remainingPauseSeconds
        );

      events.forEach((event, index) => {
        if (
          visualRatio >= event.at &&
          !firedEvents.has(index)
        ) {
          firedEvents.add(index);

          addLog(
            event.tag,
            event.message,
            event.type
          );

          if (event.pause) {
            beginPause(index);
          }
        }
      });

      /*
        Usa o tempo real para finalizar.
        Assim não fica travado em 99%.
      */
      if (
        rawRatio >= 1 &&
        currentPause === null
      ) {
        completed = true;

        window.clearInterval(skipTimer);

        skipBtn?.classList.add("hidden");

        progressBar.style.width = "100%";
        percent.textContent = "100%";
        timeRemaining.textContent = "00:00";

        terminalStatus.textContent = "Concluído";
        terminalStatus.classList.remove("error");

        window.setTimeout(() => {
          if (!signal.aborted) {
            finishLoading();
          }
        }, CONFIG.finishDelayMs);

        return;
      }

      window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
  }

  nextBtn?.addEventListener("click", () => {
    playTone("click");

    if (!validateCurrentStep()) return;

    if (currentStep < 4) {
      currentStep += 1;
      updateStep();
      return;
    }

    startLoading();
  });

  backBtn?.addEventListener("click", () => {
    playTone("click");

    if (currentStep > 1) {
      currentStep -= 1;
      updateStep();
    }
  });

  usernameInput?.addEventListener("input", () => {
    $("#usernameError").textContent = "";
  });

  displayNameInput?.addEventListener("input", () => {
    $("#displayNameError").textContent = "";
  });

  $$('input[name="lostTime"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      $("#lostTimeError").textContent = "";
    });
  });

  robuxRange?.addEventListener(
    "input",
    updateRobux
  );

  $$(".preset").forEach((button) => {
    button.addEventListener("click", () => {
      if (!robuxRange) return;

      robuxRange.value =
        button.dataset.range;

      updateRobux();
    });
  });

  copyBtn?.addEventListener("click", async () => {
    const key =
      $("#recoveryKey")?.textContent || "";

    const label =
      copyBtn.querySelector("span");

    try {
      await navigator.clipboard.writeText(key);
    } catch {
      const textarea =
        document.createElement("textarea");

      textarea.value = key;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);

      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    if (label) {
      label.textContent = "Copiado ✓";
    }

    playTone("click");

    window.setTimeout(() => {
      if (label) {
        label.textContent = "Copiar chave";
      }
    }, 1800);
  });

  restartBtn?.addEventListener("click", () => {
    loadingController?.abort();
    loadingController = null;

    form?.reset();

    currentStep = 1;

    if (robuxRange) {
      robuxRange.value = "3";
    }

    updateRobux();
    updateStep();

    $("#usernameError").textContent = "";
    $("#displayNameError").textContent = "";
    $("#lostTimeError").textContent = "";

    if (skipBtn) {
      skipBtn.onclick = null;
      skipBtn.classList.add("hidden");
    }

    showScreen(wizardScreen);
    playTone("click");
    refreshIcons();
  });

  function createStarfield() {
    const canvas = $("#starfield");

    if (!canvas) return;

    const context = canvas.getContext(
      "2d",
      { alpha: true }
    );

    if (!context) return;

    const darkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const stars = [];

    let width = 0;
    let height = 0;
    let lastFrame = 0;

    const fpsInterval = 1000 / 30;

    function starColor() {
      return darkMode.matches
        ? "255,255,255"
        : "15,15,18";
    }

    function resetStar(star, randomY = false) {
      star.x = Math.random() * width;

      star.y = randomY
        ? Math.random() * height
        : height + Math.random() * 40;

      star.radius =
        0.35 + Math.random() * 1.15;

      star.speed =
        reducedMotion.matches
          ? 0
          : 0.05 + Math.random() * 0.18;

      star.alpha =
        0.12 + Math.random() * 0.55;

      star.twinkle =
        0.004 + Math.random() * 0.012;

      star.direction =
        Math.random() > 0.5 ? 1 : -1;
    }

    function resize() {
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        1.5
      );

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      const totalStars = Math.min(
        90,
        Math.max(
          45,
          Math.floor(
            (width * height) / 14000
          )
        )
      );

      while (stars.length < totalStars) {
        const star = {};

        resetStar(star, true);
        stars.push(star);
      }

      stars.length = totalStars;
    }

    function draw(timestamp) {
      window.requestAnimationFrame(draw);

      if (
        timestamp - lastFrame <
        fpsInterval
      ) {
        return;
      }

      lastFrame = timestamp;

      context.clearRect(
        0,
        0,
        width,
        height
      );

      const color = starColor();

      stars.forEach((star) => {
        star.y -= star.speed;

        star.alpha +=
          star.twinkle * star.direction;

        if (
          star.alpha > 0.68 ||
          star.alpha < 0.06
        ) {
          star.direction *= -1;
        }

        if (
          star.y < -30 ||
          Math.random() < 0.00018
        ) {
          resetStar(star);
        }

        context.beginPath();

        context.arc(
          star.x,
          star.y,
          star.radius,
          0,
          Math.PI * 2
        );

        context.fillStyle =
          `rgba(${color},${Math.max(
            0.04,
            star.alpha
          )})`;

        context.fill();
      });
    }

    resize();

    window.addEventListener(
      "resize",
      resize,
      { passive: true }
    );

    window.requestAnimationFrame(draw);
  }

  refreshIcons();
  updateStep();
  updateRobux();
  createStarfield();
})();
