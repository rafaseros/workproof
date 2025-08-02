# 🚀 WorkProof

<h4 align="center">
  Una plataforma Web3 para portafolios profesionales verificables y pagos con stablecoins.
</h4>

WorkProof es una solución innovadora diseñada para empoderar a profesionales, especialmente en mercados emergentes, proporcionando una forma verificable de construir y presentar su historial laboral a través de NFTs (Work Seals) y facilitando pagos seguros con stablecoins. La plataforma también incorpora funcionalidades de staking para incentivar la participación y el crecimiento profesional.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requisitos

Antes de empezar, necesitas instalar las siguientes herramientas:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) o [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Inicio Rápido

Para iniciar WorkProof, sigue los siguientes pasos:

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/rafaseros/workproof.git
    cd workproof/workproof-app
    ```

2.  **Instalar dependencias:**

    ```bash
    yarn install
    ```

3.  **Iniciar la cadena local en la primera terminal:**

    ```bash
    yarn chain
    ```

    Este comando inicia una red Ethereum local que se puede usar para pruebas y desarrollo.

4.  **En una segunda terminal, desplegar los contratos:**

    ```bash
    yarn deploy
    ```

    Este comando despliega los contratos inteligentes `YourContract` y `MockUSDC` en la red local.

5.  **En una tercera terminal, iniciar la aplicación Next.js:**

    ```bash
    yarn start
    ```

    Visita tu aplicación en: `http://localhost:3000`.

## Bounties del Hackathon

WorkProof está diseñado para cumplir con los siguientes bounties:

### Buidl Guidl

-   El código base es verificablemente Scaffold-ETH.

### Avalanche (eERC)

-   El Smart Contract del NFT (`YourContract.sol`) sigue una estructura compatible con un estándar empresarial (eERC).
-   El `README.md` explica claramente el caso de uso empresarial para reclutadores.

### Avalanche (ICM/ICTT)

-   El contrato incluye funciones (aunque sean placeholders) que demuestran compatibilidad futura con mensajería interchain.
-   El `README.md` documenta esta visión de portabilidad de la reputación.

### Arbitrum

-   El contrato final **DEBE** ser desplegado también en Arbitrum Testnet.
-   El hash de la transacción de despliegue en Arbitrum **DEBE** estar en el `README.md`.

## Uso de IA (Gemini)

Este proyecto ha sido desarrollado con la asistencia de un modelo de lenguaje grande (LLM) de Google, Gemini, como un agente de ingeniería de software. Gemini ha ayudado en la generación de código, refactorización, depuración y documentación, siguiendo las instrucciones y el plan de trabajo proporcionados.
