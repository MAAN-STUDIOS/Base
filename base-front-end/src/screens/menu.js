import { navigate } from "@utils/router.js";

export default function () {
  return `
    <section style="text-align:center;">
      <h1>Cosmonavt</h1>
      <button onclick=${() => navigate('play')}>Start Game</button>
    </section>
  `;
}
