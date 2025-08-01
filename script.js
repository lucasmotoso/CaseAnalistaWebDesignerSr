// Ativa modo escuro
const html = document.documentElement;
const body = document.body;
const btnTheme = document.getElementById('toggle-theme');
const savedTheme = localStorage.getItem('theme') || 'light';

html.setAttribute('data-bs-theme', savedTheme);
if (savedTheme === 'dark') body.classList.add('theme-dark');

btnTheme.addEventListener('click', () => {
  const current = html.getAttribute('data-bs-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-bs-theme', next);
  localStorage.setItem('theme', next);
  body.classList.toggle('theme-dark');
});

// Lógica principal
let todosUsuarios = [];

fetch('https://jsonplaceholder.typicode.com/users')
  .then(res => res.json())
  .then(data => {
    todosUsuarios = data;
    document.getElementById('loading').classList.add('d-none');
    document.getElementById('user-list').classList.remove('d-none');
    aplicarFiltros();
  });

// Favoritos
function getFavoritos() {
  return JSON.parse(localStorage.getItem('favoritos')) || [];
}

function toggleFavorito(id) {
  let favs = getFavoritos();
  favs.includes(id) ? favs = favs.filter(f => f !== id) : favs.push(id);
  localStorage.setItem('favoritos', JSON.stringify(favs));
  aplicarFiltros();
}

// Renderização de cards
function renderizarUsuarios(lista) {
  const container = document.getElementById('user-list');
  container.innerHTML = '';
  const favs = getFavoritos();

  lista.forEach(u => {
    const card = document.createElement('div');
    card.className = 'col-12 col-md-6 col-lg-4';
    const isFav = favs.includes(u.id);
    const estrela = isFav ? 'bi-star-fill text-warning' : 'bi-star text-secondary';

    card.innerHTML = `
      <div class="card shadow-sm h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <h5 class="card-title">${u.name}</h5>
            <i class="bi ${estrela}" onclick="toggleFavorito(${u.id})" title="Favoritar"></i>
          </div>
          <p class="card-text">
            <strong>Email:</strong> ${u.email}<br>
            <strong>Cidade:</strong> ${u.address.city}<br>
            <strong>Empresa:</strong> ${u.company.name}
          </p>
          <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#userModal"
            onclick='exibirDetalhes(${JSON.stringify(u).replace(/'/g, "\\'")})'>
            Ver detalhes
          </button>
        </div>
        <div class="card-footer text-muted text-end">ID: ${u.id}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Filtros
function aplicarFiltros() {
  const nome = document.getElementById('filtro-nome').value.toLowerCase();
  const cidade = document.getElementById('filtro-cidade').value.toLowerCase();
  const empresa = document.getElementById('filtro-empresa').value.toLowerCase();
  const filtrados = todosUsuarios.filter(u =>
    u.name.toLowerCase().includes(nome) &&
    u.address.city.toLowerCase().includes(cidade) &&
    u.company.name.toLowerCase().includes(empresa)
  );
  renderizarUsuarios(filtrados);
}

document.querySelectorAll('#filtro-nome, #filtro-cidade, #filtro-empresa')
  .forEach(input => input.addEventListener('input', aplicarFiltros));

// Modal
function exibirDetalhes(u) {
  document.getElementById('modalContent').innerHTML = `
    <ul class="list-group">
      <li class="list-group-item"><strong>Nome:</strong> ${u.name}</li>
      <li class="list-group-item"><strong>Usuário:</strong> ${u.username}</li>
      <li class="list-group-item"><strong>Email:</strong> ${u.email}</li>
      <li class="list-group-item"><strong>Telefone:</strong> ${u.phone}</li>
      <li class="list-group-item"><strong>Website:</strong> <a href="http://${u.website}" target="_blank">${u.website}</a></li>
      <li class="list-group-item"><strong>Empresa:</strong> ${u.company.name}</li>
      <li class="list-group-item"><strong>Endereço:</strong> ${u.address.street}, ${u.address.suite}, ${u.address.city} - ${u.address.zipcode}</li>
    </ul>`;
}

// Exportações
function exportarCSV() {
  const rows = [["ID", "Nome", "Email", "Cidade", "Empresa"]];
  const nome = document.getElementById('filtro-nome').value.toLowerCase();
  const cidade = document.getElementById('filtro-cidade').value.toLowerCase();
  const empresa = document.getElementById('filtro-empresa').value.toLowerCase();
  todosUsuarios.filter(u =>
    u.name.toLowerCase().includes(nome) &&
    u.address.city.toLowerCase().includes(cidade) &&
    u.company.name.toLowerCase().includes(empresa)
  ).forEach(u => rows.push([u.id, u.name, u.email, u.address.city, u.company.name]));

  const csv = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encoded = encodeURI(csv);
  const link = document.createElement("a");
  link.setAttribute("href", encoded);
  link.setAttribute("download", "usuarios.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const nome = document.getElementById('filtro-nome').value.toLowerCase();
  const cidade = document.getElementById('filtro-cidade').value.toLowerCase();
  const empresa = document.getElementById('filtro-empresa').value.toLowerCase();
  const data = todosUsuarios.filter(u =>
    u.name.toLowerCase().includes(nome) &&
    u.address.city.toLowerCase().includes(cidade) &&
    u.company.name.toLowerCase().includes(empresa)
  ).map(u => [u.id, u.name, u.email, u.address.city, u.company.name]);

  doc.autoTable({
    head: [["ID", "Nome", "Email", "Cidade", "Empresa"]],
    body: data
  });

  doc.save("usuarios.pdf");
}
// No script.js:
if (window.pJSDom && window.pJSDom.length > 0) {
  const theme = html.getAttribute('data-bs-theme');
  pJSDom[0].pJS.particles.color.value = theme === 'dark' ? '#ffffff' : '#0077b6';
  pJSDom[0].pJS.fn.particlesRefresh();
}
