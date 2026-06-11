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

const lines = [

"Conectando aos servidores...",
"Verificando banco de dados...",
"Buscando sessões antigas...",
"Analisando credenciais...",
"Verificando backups...",
"Restaurando informações...",
"Sincronizando sessão...",
"Conta encontrada.",
"Preparando acesso...",
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
        text.includes("encontrada") ||
        text.includes("disponível")
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

    homeScreen.classList.add("hidden");

    loadingScreen.classList.remove("hidden");

    let progress = 0;
    let lineIndex = 0;

    const interval = setInterval(() => {

        progress +=
        Math.floor(Math.random() * 10) + 5;

        if(progress > 100){
            progress = 100;
        }

        progressBar.style.width =
        progress + "%";

        percent.innerText =
        progress + "%";

        if(lineIndex < lines.length){

            addLine(lines[lineIndex]);

            lineIndex++;

        }

        if(progress >= 100){

            clearInterval(interval);

            setTimeout(() => {

                loadingScreen.classList.add("hidden");

                resultScreen.classList.remove("hidden");

                resultUser.innerText =
                "Usuário: " + username;

                accessCode.innerText =
                generateRecovery(username);

            },1200);

        }

    },900);

};

regenBtn.onclick = () => {

    const username =
    usernameInput.value.trim();

    accessCode.innerText =
    generateRecovery(username);

};
