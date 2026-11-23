class RelojExamen extends HTMLElement {

  connectedCallback() {
    const minutos = Number(this.getAttribute("minutos"));
    // Guardamos la HORA EXACTA en que termina el examen
    this.fin = Date.now() + minutos * 60 * 1000;

    this.actualizar();
    this.intervalo = setInterval(() => this.actualizar(), 1000);
  }

  // Se ejecuta cuando la etiqueta SALE de la página: detiene el reloj
  disconnectedCallback() {
    clearInterval(this.intervalo);
  }

  actualizar() {
    const restante = Math.max(0, Math.round((this.fin - Date.now()) / 1000));
    const min = String(Math.floor(restante / 60)).padStart(2, "0");
    const seg = String(restante % 60).padStart(2, "0");

    this.textContent = `⏱ ${min}:${seg}`;
    this.classList.toggle("poco-tiempo", restante <= 60); // rojo en el último minuto

    if (restante === 0) {
      clearInterval(this.intervalo);
      this.dispatchEvent(new CustomEvent("tiempo-agotado", { bubbles: true }));
    }
  }
}

customElements.define("reloj-examen", RelojExamen);