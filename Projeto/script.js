document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const gerarBtn = document.getElementById("gerarTeste");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const telefone = document.getElementById("telefone").value.replace(/\D/g, "");
      const senha = document.getElementById("senha").value;

      try {
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telefone, senha })
        });

        const json = await res.json();
        if (json.sucesso) {
          localStorage.setItem("usuario", telefone);
          window.location.href = "painel.html";
        } else {
          alert("Login inválido.");
        }
      } catch (error) {
        alert("Erro de conexão com servidor.");
      }
    });
  }

  if (gerarBtn) {
    const resposta = document.getElementById("resposta");
    const envioBtns = document.getElementById("envioBtns");

    gerarBtn.addEventListener("click", async () => {
      const telefone = localStorage.getItem("usuario");
      resposta.textContent = "Gerando teste...";

      try {
        const res = await fetch("http://localhost:3000/api/gerar-teste-api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telefone: telefone, minutos: 60 })
        });

        const json = await res.json();
        if (json.sucesso) {
          resposta.innerHTML = `<strong>Teste gerado:</strong> ${json.codigo}`;
          localStorage.setItem("codigoTeste", json.codigo);
          envioBtns.classList.remove("hidden");
          carregarHistorico(telefone);
        } else {
          resposta.textContent = "Erro ao gerar teste.";
        }
      } catch (error) {
        resposta.textContent = "Erro na conexão com o servidor.";
      }
    });

    document.getElementById("enviarTelegram").addEventListener("click", async () => {
      const chat_id = document.getElementById("chat_id").value;
      const codigo = localStorage.getItem("codigoTeste");

      const res = await fetch("http://localhost:3000/api/enviar-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, codigo })
      });

      const json = await res.json();
      alert(json.sucesso ? "Enviado via Telegram!" : "Erro no envio Telegram.");
    });

    document.getElementById("enviarWhatsApp").addEventListener("click", async () => {
      const telefone = document.getElementById("telefoneZap").value;
      const codigo = localStorage.getItem("codigoTeste");

      const res = await fetch("http://localhost:3000/api/enviar-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefone, codigo })
      });

      const json = await res.json();
      alert(json.sucesso ? "Enviado via WhatsApp!" : "Erro no envio WhatsApp.");
    });

    const user = localStorage.getItem("usuario");
    document.getElementById("dadosUsuario").textContent = "Usuário: " + user;

    carregarHistorico(user);
  }
});

async function carregarHistorico(telefone) {
  const lista = document.getElementById("historico");
  try {
    const res = await fetch(`http://localhost:3000/api/testes/${telefone}`);
    const json = await res.json();
    if (Array.isArray(json)) {
      lista.innerHTML = json.map(item => `<li>🧪 ${item.codigo} - ${item.criado_em}</li>`).join("");
    }
  } catch {
    lista.innerHTML = "<li>Erro ao carregar histórico</li>";
  }
}
