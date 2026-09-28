document.addEventListener("DOMContentLoaded", () => {

    // Elementos da cena
    const scene = document.querySelector("#ar-scene");
    const target = document.querySelector("#target");
    const cameraElement = document.querySelector("#ar-camera");


    // Elementos da interface
    const status = document.querySelector("#status");
    const badge = document.querySelector("#badge");

    const panel = document.querySelector("#info-panel");
    const panelTitle = document.querySelector("#info-title");
    const panelText = document.querySelector("#info-text");
    const panelDetail = document.querySelector("#info-detail");

    const closeButton = document.querySelector("#close-panel");


    // Botões interativos
    const hotspots = Array.from(
        document.querySelectorAll(".hotspot")
    );


    // Verifica se o target está sendo reconhecido
    let tracking = false;


    // Informações de cada componente do torno
    const information = {

        placa: {
            title: "Cabeçote e placa",
            text: "A placa fixa a peça e o cabeçote fornece o movimento de rotação necessário ao torneamento.",
            detail: "A fixação correta é essencial para a precisão e a segurança."
        },

        torre: {
            title: "Torre de ferramentas",
            text: "A torre organiza as ferramentas de corte e permite selecionar a ferramenta necessária em cada etapa do programa CNC.",
            detail: "A indexação da torre pode integrar a sequência automática de usinagem."
        },

        comando: {
            title: "Painel de comando CNC",
            text: "O painel é a interface entre o operador, o programa CNC e o sistema de controle da máquina.",
            detail: "Os dados apresentados nesta experiência são didáticos."
        },

        seguranca: {
            title: "Proteção e segurança",
            text: "Portas, proteções e intertravamentos ajudam a separar o operador da região de usinagem.",
            detail: "A realidade aumentada não substitui o treinamento nem a documentação do fabricante."
        }

    };


    // Mostra as informações selecionadas
    function showInformation(topicName) {

        const selected = information[topicName];

        if (!selected) {
            return;
        }

        panelTitle.textContent = selected.title;

        panelText.textContent = selected.text;

        panelDetail.textContent = selected.detail;

        panel.classList.remove("hidden");
    }


    // Esconde o painel de informações
    function hideInformation() {

        panel.classList.add("hidden");
    }


    // Evento de toque nos pontos numerados
    hotspots.forEach((button) => {

        button.addEventListener("pointerup", (event) => {

            event.preventDefault();
            event.stopPropagation();

            const topicName = button.dataset.topic;

            showInformation(topicName);
        });

    });


    // Fecha o painel
    closeButton.addEventListener("pointerup", (event) => {

        event.preventDefault();

        hideInformation();
    });


    // Quando a realidade aumentada estiver pronta
    scene.addEventListener("arReady", () => {

        status.textContent =
            "Câmera pronta. Aponte para a imagem do torno.";

        badge.textContent = "PROCURANDO ALVO";
    });


    // Caso ocorra um erro ao iniciar
    scene.addEventListener("arError", () => {

        status.textContent =
            "Não foi possível iniciar a câmera. Verifique as permissões.";

        badge.textContent = "ERRO";
    });


    // Quando a imagem do torno for reconhecida
    target.addEventListener("targetFound", () => {

        tracking = true;

        status.textContent =
            "Torno reconhecido. Toque em um ponto numerado.";

        badge.textContent = "● RA ATIVA";


        hotspots.forEach((button) => {

            button.classList.add("visible");

        });

    });


    // Quando a imagem deixar de ser reconhecida
    target.addEventListener("targetLost", () => {

        tracking = false;

        status.textContent =
            "Alvo perdido. Aponte novamente para a imagem.";

        badge.textContent = "PROCURANDO ALVO";


        hotspots.forEach((button) => {

            button.classList.remove("visible");

        });


        hideInformation();
    });


    // Atualiza a posição dos pontos na tela
    function updateHotspotPositions() {

        requestAnimationFrame(updateHotspotPositions);


        if (!tracking) {
            return;
        }


        const camera =
            cameraElement.getObject3D("camera");


        if (!camera || !target.object3D) {
            return;
        }


        target.object3D.updateMatrixWorld(true);

        camera.updateMatrixWorld(true);


        hotspots.forEach((button) => {

            // Lê as coordenadas definidas no HTML
            const localPoint = new THREE.Vector3(

                Number(button.dataset.x),

                Number(button.dataset.y),

                Number(button.dataset.z)

            );


            // Converte a posição local para o espaço 3D
            const worldPoint =
                target.object3D.localToWorld(localPoint);


            // Converte a posição 3D para a visão da câmera
            const projectedPoint =
                worldPoint
                    .clone()
                    .project(camera);


            // Converte as coordenadas para pixels
            const screenX =
                (projectedPoint.x * 0.5 + 0.5) *
                window.innerWidth;


            const screenY =
                (-projectedPoint.y * 0.5 + 0.5) *
                window.innerHeight;


            // Posiciona o botão na tela
            button.style.left =
                `${screenX}px`;

            button.style.top =
                `${screenY}px`;


            // Verifica se o ponto está dentro da tela
            const insideScreen =
                projectedPoint.z > -1 &&
                projectedPoint.z < 1 &&
                screenX > -80 &&
                screenX < window.innerWidth + 80 &&
                screenY > -80 &&
                screenY < window.innerHeight + 80;


            button.style.visibility =
                insideScreen
                    ? "visible"
                    : "hidden";

        });

    }


    // Inicia as atualizações de posição
    updateHotspotPositions();

});