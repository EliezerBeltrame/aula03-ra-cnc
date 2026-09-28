document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Todo o código da aplicação
         * ficará dentro desta função.
         */


        // Referência para a cena do A-Frame.
        const scene =
            document.querySelector("#ar-scene");


        // Referência para o target do MindAR.
        const target =
            document.querySelector("#target");


        // Referência para a câmera.
        const cameraElement =
            document.querySelector("#ar-camera");


        // Referência para o texto de status.
        const trackingStatus =
            document.querySelector("#status");


        // Referência para o indicador de tracking.
        const trackingBadge =
            document.querySelector("#badge");


        // Referência para o painel de informações.
        const infoPanel =
            document.querySelector("#info-panel");


        // Referência para o título do painel.
        const panelTitle =
            document.querySelector("#info-title");


        // Referência para o texto principal.
        const panelText =
            document.querySelector("#info-text");


        // Referência para o texto detalhado.
        const panelDetail =
            document.querySelector("#info-detail");


        // Referência para o botão de fechar.
        const closeButton =
            document.querySelector("#close-panel");


        // Referência para todos os hotspots.
        const hotspots =
            document.querySelectorAll(".hotspot");


        /*
         * false significa que o target ainda
         * não foi encontrado.
         */
        let tracking = false;


        /*
         * Informações apresentadas em cada hotspot.
         */
        const information = {

            placa: {
                title: "Placa",
                text: "A placa é responsável por prender a peça durante a usinagem.",
                detail: "Antes de iniciar o processo, verifique se a peça está corretamente fixada."
            },

            torre: {
                title: "Torre de ferramentas",
                text: "A torre de ferramentas possui as ferramentas utilizadas no processo de usinagem.",
                detail: "Cada ferramenta deve estar posicionada corretamente para realizar sua operação."
            },

            comando: {
                title: "Comando CNC",
                text: "O comando CNC controla os movimentos e as operações realizadas pela máquina.",
                detail: "O operador deve conferir o programa antes de iniciar a usinagem."
            },

            seguranca: {
                title: "Segurança",
                text: "A segurança é fundamental durante a operação do torno CNC.",
                detail: "Utilize os equipamentos de proteção e nunca opere a máquina sem seguir os procedimentos de segurança."
            }

        };


        /*
         * Exibe o painel com as informações
         * do hotspot selecionado.
         */
        function showInformation(topicName) {

            const topic =
                information[topicName];


            // Verifica se o tópico existe.
            if (!topic) {
                return;
            }


            // Coloca as informações no painel.
            panelTitle.textContent =
                topic.title;

            panelText.textContent =
                topic.text;

            panelDetail.textContent =
                topic.detail;


            // Mostra o painel.
            infoPanel.classList.remove("hidden");
        }


        /*
         * Esconde o painel de informações.
         */
        function hideInformation() {

            infoPanel.classList.add("hidden");
        }


        /*
         * Configura o toque em cada hotspot.
         */
        hotspots.forEach(
            (hotspot) => {

                hotspot.addEventListener(
                    "pointerup",
                    () => {

                        const topicName =
                            hotspot.dataset.topic;

                        showInformation(topicName);
                    }
                );
            }
        );


        /*
         * Fecha o painel quando o botão
         * de fechar é pressionado.
         */
        closeButton.addEventListener(
            "pointerup",
            () => {

                hideInformation();
            }
        );


        /*
         * Informa que a realidade aumentada
         * está pronta para funcionar.
         */
        scene.addEventListener(
            "arReady",
            () => {

                trackingStatus.textContent =
                    "Aponte a câmera para o marcador";

                trackingBadge.textContent =
                    "RA pronta";
            }
        );


        /*
         * Trata possíveis erros da inicialização
         * da realidade aumentada.
         */
        scene.addEventListener(
            "arError",
            (event) => {

                console.error(
                    "Erro ao iniciar o MindAR:",
                    event
                );

                trackingStatus.textContent =
                    "Erro ao iniciar a câmera";

                trackingBadge.textContent =
                    "Erro";
            }
        );


        /*
         * Ativa os hotspots quando o target
         * é encontrado pela câmera.
         */
        target.addEventListener(
            "targetFound",
            () => {

                tracking = true;


                trackingStatus.textContent =
                    "Marcador encontrado";


                trackingBadge.textContent =
                    "Detectado";


                hotspots.forEach(
                    (hotspot) => {

                        hotspot.classList.add(
                            "visible"
                        );
                    }
                );
            }
        );


        /*
         * Esconde os hotspots quando o target
         * deixa de ser encontrado.
         */
        target.addEventListener(
            "targetLost",
            () => {

                tracking = false;


                trackingStatus.textContent =
                    "Aponte a câmera para o marcador";


                trackingBadge.textContent =
                    "Procurando...";


                hotspots.forEach(
                    (hotspot) => {

                        hotspot.classList.remove(
                            "visible"
                        );
                    }
                );


                hideInformation();
            }
        );


        /*
         * Atualiza continuamente a posição
         * dos hotspots na tela.
         */
        function updateHotspotPositions() {

            requestAnimationFrame(
                updateHotspotPositions
            );


            // Não atualiza se o target não estiver sendo rastreado.
            if (!tracking) {
                return;
            }


            // Obtém a câmera do A-Frame.
            const camera =
                cameraElement.getObject3D("camera");


            // Verifica se a câmera e o target existem.
            if (
                !camera ||
                !target.object3D
            ) {
                return;
            }


            // Atualiza as matrizes do target e da câmera.
            target.object3D.updateMatrixWorld(true);

            camera.updateMatrixWorld(true);


            /*
             * Atualiza cada hotspot
             * individualmente.
             */
            hotspots.forEach(
                (button) => {

                    /*
                     * Pega a posição local do hotspot
                     * usando os valores armazenados
                     * nos atributos data-x, data-y e data-z.
                     */
                    const localPoint =
                        new THREE.Vector3(
                            Number(button.dataset.x),
                            Number(button.dataset.y),
                            Number(button.dataset.z)
                        );


                    /*
                     * Converte a posição local do target
                     * para uma posição no mundo 3D.
                     */
                    const worldPoint =
                        target.object3D.localToWorld(
                            localPoint
                        );


                    /*
                     * Converte a posição 3D
                     * para coordenadas da câmera.
                     */
                    const projectedPoint =
                        worldPoint
                            .clone()
                            .project(camera);


                    /*
                     * Converte a coordenada X
                     * para pixels da tela.
                     */
                    const screenX =
                        (projectedPoint.x + 1) /
                        2 *
                        window.innerWidth;


                    /*
                     * Converte a coordenada Y
                     * para pixels da tela.
                     */
                    const screenY =
                        (1 - projectedPoint.y) /
                        2 *
                        window.innerHeight;


                    /*
                     * Posiciona o botão
                     * na tela.
                     */
                    button.style.left =
                        `${screenX}px`;

                    button.style.top =
                        `${screenY}px`;


                    /*
                     * Verifica se o ponto está
                     * dentro da área visível.
                     */
                    const insideScreen =
                        projectedPoint.z >= -1 &&
                        projectedPoint.z <= 1 &&
                        screenX >= 0 &&
                        screenX <= window.innerWidth &&
                        screenY >= 0 &&
                        screenY <= window.innerHeight;


                    /*
                     * Esconde o hotspot quando
                     * ele estiver fora da tela.
                     */
                    button.style.visibility =
                        insideScreen
                            ? "visible"
                            : "hidden";
                }
            );
        }


        /*
         * Inicia a atualização contínua
         * da posição dos hotspots.
         */
        updateHotspotPositions();

    }
);