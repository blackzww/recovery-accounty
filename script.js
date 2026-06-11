// script.js

const startBtn =
document.getElementById("startBtn");

const homeScreen =
document.getElementById("homeScreen");

const loadingScreen =
document.getElementById("loadingScreen");

const resultScreen =
document.getElementById("resultScreen");

const progressBar =
document.getElementById("progressBar");

const percent =
document.getElementById("percent");

const terminal =
document.getElementById("terminal");

const usernameInput =
document.getElementById("username");

const accessCode =
document.getElementById("accessCode");

const resultUser =
document.getElementById("resultUser");

const regenBtn =
document.getElementById("regenBtn");

const accessTitle =
document.getElementById("accessTitle");

const warning =
document.getElementById("warning");

const accessDescription =
document.getElementById("accessDescription");

const clickSound =
document.getElementById("clickSound");

const successSound =
document.getElementById("successSound");

const sessionCount =
document.getElementById("sessionCount");

const lines = [

"[SYSTEM] Connecting recovery node...",
"[SECURE] Initializing protected session...",
"[DATABASE] Verificando histórico da conta...",
"[CLOUD] Buscando sessões antigas...",
"[SYNC] Consultando backups disponíveis...",
"[SYSTEM] Validando informações sincronizadas...",
"[RECOVERY] Tentando restaurar sessão anterior...",

"ERROR",

"[SYSTEM] Erro ao processar recuperação.",
"[SYSTEM] Tentando novamente...",

"ERROR_END",

"[SECURE] Nova sessão localizada.",
"[DATABASE] Verificando integridade dos dados...",
"[SYNC] Sincronizando credenciais...",
"[CLOUD] Restaurando acesso temporário...",
"[SYSTEM] Conta encontrada.",
"[SECURE] Preparando sessão segura...",
"[RECOVERY] Recuperação disponível."

];

function generateRecovery(username){

    const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let random = "";

    for(let i = 0; i < 7; i++){

        random += chars[
        Math.floor(Math.random() * chars.length)
        ];

    }

    return `${username}#RECOVERY!${random}`;

}

function addLine(text,type="normal"){

    const div =
    document.createElement("div");

    div.className = "line";

    if(type === "success"){
        div.classList.add("success");
    }

    if(type === "error"){
        div.classList.add("error");
    }

    div.innerText = text;

    terminal.appendChild(div);

    terminal.scrollTop =
    terminal.scrollHeight;

}

startBtn.onclick = () => {

    const username =
    usernameInput.value.trim();

    if(!username) return;

    clickSound.play();

    homeScreen.classList.add("hidden");

    loadingScreen.classList.remove("hidden");

    let progress = 0;

    let lineIndex = 0;

    let paused = false;

    let sessions = 0;

    const progressInterval = setInterval(() => {

        if(paused) return;

        if(progress < 20){

            progress += 0.12;

        }else if(progress < 45){

            progress += 0.06;

        }else if(progress < 70){

            progress += 0.03;

        }else if(progress < 90){

            progress += 0.015;

        }else{

            progress += 0.006;

        }

        if(progress > 100){
            progress = 100;
        }

        progressBar.style.width =
        progress + "%";

        percent.innerText =
        Math.floor(progress) + "%";

        sessions++;

        sessionCount.innerText =
        sessions;

        if(progress >= 100){

            clearInterval(progressInterval);

            clearInterval(textInterval);

            successSound.play();

            setTimeout(() => {

                loadingScreen.classList.add("hidden");

                resultScreen.classList.remove("hidden");

                resultUser.innerText =
                "Usuário: " + username;

                setTimeout(() => {

                    accessTitle
                    .classList.remove("hidden");

                },1800);

                setTimeout(() => {

                    accessCode
                    .classList.remove("hidden");

                    accessCode.innerText =
                    generateRecovery(username);

                },3400);

                setTimeout(() => {

                    accessDescription
                    .classList.remove("hidden");

                },4200);

                setTimeout(() => {

                    regenBtn
                    .classList.remove("hidden");

                    warning
                    .classList.remove("hidden");

                },5200);

            },2600);

        }

    },120);

    const textInterval = setInterval(() => {

        if(lineIndex >= lines.length)
        return;

        const current =
        lines[lineIndex];

        if(current === "ERROR"){

            paused = true;

            lineIndex++;

            return;

        }

        if(current === "ERROR_END"){

            paused = false;

            lineIndex++;

            return;

        }

        if(paused){

            addLine(current,"error");

            lineIndex++;

            return;

        }

        if(
            current.includes("Conta encontrada") ||
            current.includes("Recuperação disponível")
        ){

            addLine(current,"success");

        }else{

            addLine(current);

        }

        lineIndex++;

    },2800);

};

regenBtn.onclick = () => {

    const username =
    usernameInput.value.trim();

    accessCode.innerText =
    generateRecovery(username);

};
