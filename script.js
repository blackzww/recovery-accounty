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

const clickSound =
document.getElementById("clickSound");

const successSound =
document.getElementById("successSound");

const lines = [

"Conectando ao servidor principal...",
"Iniciando verificação segura...",
"Verificando histórico da conta...",
"Buscando sessões antigas...",
"Consultando backups disponíveis...",
"Validando informações sincronizadas...",
"Tentando restaurar sessão anterior...",

"ERROR_RED",

"Erro ao processar recuperação.",
"Tentando novamente...",

"ERROR_END",

"Nova sessão localizada.",
"Verificando integridade dos dados...",
"Sincronizando credenciais...",
"Restaurando acesso temporário...",
"Conta encontrada.",
"Preparando sessão segura...",
"Recuperação disponível."

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

    const progressInterval = setInterval(() => {

        if(paused) return;

        if(progress < 20){

            progress += 0.15;

        }else if(progress < 45){

            progress += 0.08;

        }else if(progress < 70){

            progress += 0.04;

        }else if(progress < 90){

            progress += 0.02;

        }else{

            progress += 0.008;

        }

        if(progress > 100){
            progress = 100;
        }

        progressBar.style.width =
        progress + "%";

        percent.innerText =
        Math.floor(progress) + "%";

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

                },3500);

                setTimeout(() => {

                    regenBtn
                    .classList.remove("hidden");

                    warning
                    .classList.remove("hidden");

                },5000);

            },2500);

        }

    },120);

    const textInterval = setInterval(() => {

        if(lineIndex >= lines.length)
        return;

        const current =
        lines[lineIndex];

        if(current === "ERROR_RED"){

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

    },2600);

};

regenBtn.onclick = () => {

    const username =
    usernameInput.value.trim();

    accessCode.innerText =
    generateRecovery(username);

};
