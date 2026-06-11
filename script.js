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
"Erro ao processar recuperação.",
"Tentando novamente...",
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

function addLine(text){

    const div =
    document.createElement("div");

    div.className = "line";

    if(
        text.includes("Conta encontrada") ||
        text.includes("Recuperação disponível")
    ){
        div.classList.add("success");
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

    const interval = setInterval(() => {

        if(progress < 25){

            progress += 1;

        }else if(progress < 60){

            progress += 0.6;

        }else if(progress < 85){

            progress += 0.3;

        }else{

            progress += 0.1;

        }

        if(progress > 100){
            progress = 100;
        }

        progressBar.style.width =
        progress + "%";

        percent.innerText =
        Math.floor(progress) + "%";

        if(
            lineIndex < lines.length &&
            Math.random() > 0.55
        ){

            addLine(lines[lineIndex]);

            lineIndex++;

        }

        if(progress >= 100){

            clearInterval(interval);

            successSound.play();

            setTimeout(() => {

                loadingScreen.classList.add("hidden");

                resultScreen.classList.remove("hidden");

                resultUser.innerText =
                "Usuário: " + username;

                setTimeout(() => {

                    accessTitle
                    .classList.remove("hidden");

                },1200);

                setTimeout(() => {

                    accessCode
                    .classList.remove("hidden");

                    accessCode.innerText =
                    generateRecovery(username);

                },2200);

                setTimeout(() => {

                    regenBtn
                    .classList.remove("hidden");

                    warning
                    .classList.remove("hidden");

                },3200);

            },1800);

        }

    },220);

};

regenBtn.onclick = () => {

    const username =
    usernameInput.value.trim();

    accessCode.innerText =
    generateRecovery(username);

};
