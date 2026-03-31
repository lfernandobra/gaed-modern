import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // ========== UFs ==========
  const sp = await prisma.uf.create({ data: { nome: "São Paulo", sigla: "SP" } });
  const rj = await prisma.uf.create({ data: { nome: "Rio de Janeiro", sigla: "RJ" } });
  const mg = await prisma.uf.create({ data: { nome: "Minas Gerais", sigla: "MG" } });

  // ========== Municípios ==========
  const saoPaulo = await prisma.municipio.create({
    data: { nome: "São Paulo", ufId: sp.id },
  });
  const guarulhos = await prisma.municipio.create({
    data: { nome: "Guarulhos", ufId: sp.id },
  });

  // ========== Bairros ==========
  const centro = await prisma.bairro.create({
    data: { nome: "Centro", municipioId: saoPaulo.id },
  });
  const vilaMariana = await prisma.bairro.create({
    data: { nome: "Vila Mariana", municipioId: saoPaulo.id },
  });

  // ========== Logradouros ==========
  const ruaA = await prisma.logradouro.create({
    data: { nome: "Rua Augusta", cep: "01305-000", bairroId: centro.id },
  });
  const ruaB = await prisma.logradouro.create({
    data: { nome: "Av. Paulista", cep: "01310-100", bairroId: vilaMariana.id },
  });

  // ========== Usuários ==========
  const senhaHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.usuario.create({
    data: {
      login: "admin",
      senha: senhaHash,
      nome: "Administrador",
      sobrenome: "Sistema",
      email: "admin@gaed.com",
      role: "ADMIN",
      cpf: "000.000.000-00",
      logradouroId: ruaA.id,
      numero: "100",
    },
  });

  const gestor = await prisma.usuario.create({
    data: {
      login: "gestor",
      senha: senhaHash,
      nome: "Maria",
      sobrenome: "Gestora",
      email: "gestor@gaed.com",
      role: "GESTOR",
      cpf: "111.111.111-11",
      gestorFormacao: "Pedagogia",
      gestorInstituicao: "USP",
    },
  });

  const secretaria = await prisma.usuario.create({
    data: {
      login: "secretaria",
      senha: senhaHash,
      nome: "Ana",
      sobrenome: "Secretária",
      email: "secretaria@gaed.com",
      role: "SECRETARIA",
      cpf: "222.222.222-22",
      secretariaFormacao: "Administração",
    },
  });

  const prof1 = await prisma.usuario.create({
    data: {
      login: "prof.joao",
      senha: senhaHash,
      nome: "João",
      sobrenome: "Silva",
      email: "joao@gaed.com",
      role: "PROFESSOR",
      cpf: "333.333.333-33",
      professorFormacao: "Licenciatura em Matemática",
      professorInstituicao: "UNICAMP",
    },
  });

  const prof2 = await prisma.usuario.create({
    data: {
      login: "prof.maria",
      senha: senhaHash,
      nome: "Maria",
      sobrenome: "Santos",
      email: "maria.prof@gaed.com",
      role: "PROFESSOR",
      cpf: "444.444.444-44",
      professorFormacao: "Licenciatura em Português",
      professorInstituicao: "USP",
    },
  });

  const responsavel1 = await prisma.usuario.create({
    data: {
      login: "resp.carlos",
      senha: senhaHash,
      nome: "Carlos",
      sobrenome: "Oliveira",
      email: "carlos@email.com",
      role: "RESPONSAVEL",
      cpf: "555.555.555-55",
      responsavelAdimplente: true,
    },
  });

  // ========== Séries ==========
  const serie1 = await prisma.serie.create({ data: { nome: "1º Ano" } });
  const serie2 = await prisma.serie.create({ data: { nome: "2º Ano" } });
  const serie3 = await prisma.serie.create({ data: { nome: "3º Ano" } });

  // ========== Períodos ==========
  const manha = await prisma.periodo.create({ data: { nome: "Manhã" } });
  const tarde = await prisma.periodo.create({ data: { nome: "Tarde" } });
  const noite = await prisma.periodo.create({ data: { nome: "Noite" } });

  // ========== Turmas ==========
  const turma1A = await prisma.turma.create({
    data: { nome: "1A", serieId: serie1.id, periodoId: manha.id, limite: 30 },
  });
  const turma1B = await prisma.turma.create({
    data: { nome: "1B", serieId: serie1.id, periodoId: tarde.id, limite: 30 },
  });
  const turma2A = await prisma.turma.create({
    data: { nome: "2A", serieId: serie2.id, periodoId: manha.id, limite: 35 },
  });

  // ========== Alunos ==========
  const aluno1 = await prisma.usuario.create({
    data: {
      login: "aluno.pedro",
      senha: senhaHash,
      nome: "Pedro",
      sobrenome: "Oliveira",
      email: "pedro@email.com",
      role: "ALUNO",
      cpf: "666.666.666-66",
      alunoTurmaId: turma1A.id,
      alunoResponsavelId: responsavel1.id,
      alunoSerieAtual: "1º Ano",
    },
  });

  const aluno2 = await prisma.usuario.create({
    data: {
      login: "aluno.julia",
      senha: senhaHash,
      nome: "Júlia",
      sobrenome: "Costa",
      email: "julia@email.com",
      role: "ALUNO",
      cpf: "777.777.777-77",
      alunoTurmaId: turma1A.id,
      alunoSerieAtual: "1º Ano",
    },
  });

  const aluno3 = await prisma.usuario.create({
    data: {
      login: "aluno.lucas",
      senha: senhaHash,
      nome: "Lucas",
      sobrenome: "Pereira",
      email: "lucas@email.com",
      role: "ALUNO",
      cpf: "888.888.888-88",
      alunoTurmaId: turma2A.id,
      alunoSerieAtual: "2º Ano",
    },
  });

  // Atualizar contagem de inseridos nas turmas
  await prisma.turma.update({
    where: { id: turma1A.id },
    data: { inseridos: 2 },
  });
  await prisma.turma.update({
    where: { id: turma2A.id },
    data: { inseridos: 1 },
  });

  // ========== Disciplinas ==========
  const mat = await prisma.disciplina.create({
    data: { nome: "Matemática", conteudo: "Álgebra, Geometria, Aritmética" },
  });
  const port = await prisma.disciplina.create({
    data: { nome: "Português", conteudo: "Gramática, Redação, Literatura" },
  });
  const hist = await prisma.disciplina.create({
    data: { nome: "História", conteudo: "História do Brasil e Mundial" },
  });
  const geo = await prisma.disciplina.create({
    data: { nome: "Geografia", conteudo: "Geografia Física e Humana" },
  });
  const cien = await prisma.disciplina.create({
    data: { nome: "Ciências", conteudo: "Biologia, Física, Química" },
  });

  // ========== Professor-Disciplina ==========
  await prisma.professorDisciplina.createMany({
    data: [
      { professorId: prof1.id, disciplinaId: mat.id },
      { professorId: prof1.id, disciplinaId: cien.id },
      { professorId: prof2.id, disciplinaId: port.id },
      { professorId: prof2.id, disciplinaId: hist.id },
    ],
  });

  // ========== Turma-Disciplina-Professor ==========
  await prisma.turmaDisciplinaProfessor.createMany({
    data: [
      { turmaId: turma1A.id, disciplinaId: mat.id, professorId: prof1.id },
      { turmaId: turma1A.id, disciplinaId: port.id, professorId: prof2.id },
      { turmaId: turma2A.id, disciplinaId: mat.id, professorId: prof1.id },
      { turmaId: turma2A.id, disciplinaId: hist.id, professorId: prof2.id },
    ],
  });

  // ========== Bimestres ==========
  const bim1 = await prisma.bimestre.create({
    data: {
      nome: "1º Bimestre",
      dataInicial: new Date("2026-02-01"),
      dataFinal: new Date("2026-04-30"),
    },
  });
  const bim2 = await prisma.bimestre.create({
    data: {
      nome: "2º Bimestre",
      dataInicial: new Date("2026-05-01"),
      dataFinal: new Date("2026-07-31"),
    },
  });

  // ========== Boletins ==========
  const bol1 = await prisma.boletim.create({ data: { bimestreId: bim1.id } });

  // ========== Notas ==========
  await prisma.boletimAlunoDisciplina.createMany({
    data: [
      { boletimId: bol1.id, alunoId: aluno1.id, disciplinaId: mat.id, nota: 8.5, falta: 2 },
      { boletimId: bol1.id, alunoId: aluno1.id, disciplinaId: port.id, nota: 7.0, falta: 1 },
      { boletimId: bol1.id, alunoId: aluno2.id, disciplinaId: mat.id, nota: 9.0, falta: 0 },
      { boletimId: bol1.id, alunoId: aluno2.id, disciplinaId: port.id, nota: 8.0, falta: 3 },
      { boletimId: bol1.id, alunoId: aluno3.id, disciplinaId: mat.id, nota: 6.5, falta: 5 },
    ],
  });

  // ========== Ocorrências ==========
  await prisma.ocorrencia.createMany({
    data: [
      {
        assunto: "Comportamento",
        descricao: "Aluno chegou atrasado 3 vezes esta semana",
        alunoId: aluno1.id,
      },
      {
        assunto: "Bom desempenho",
        descricao: "Aluna teve excelente participação na aula de Matemática",
        alunoId: aluno2.id,
      },
    ],
  });

  // ========== Tarefas ==========
  const tarefa1 = await prisma.tarefa.create({
    data: {
      descricao: "Lista de exercícios de Álgebra - Cap. 3",
      inicio: new Date("2026-03-01"),
      fim: new Date("2026-03-15"),
      disciplinaId: mat.id,
      turmas: {
        create: [{ turmaId: turma1A.id }, { turmaId: turma2A.id }],
      },
    },
  });

  const tarefa2 = await prisma.tarefa.create({
    data: {
      descricao: "Redação: Minha cidade ideal",
      inicio: new Date("2026-03-10"),
      fim: new Date("2026-03-20"),
      disciplinaId: port.id,
      turmas: {
        create: [{ turmaId: turma1A.id }],
      },
    },
  });

  console.log("Seed concluído com sucesso!");
  console.log(`
  Usuários criados:
    - admin / 123456 (ADMIN)
    - gestor / 123456 (GESTOR)
    - secretaria / 123456 (SECRETARIA)
    - prof.joao / 123456 (PROFESSOR)
    - prof.maria / 123456 (PROFESSOR)
    - resp.carlos / 123456 (RESPONSAVEL)
    - aluno.pedro / 123456 (ALUNO)
    - aluno.julia / 123456 (ALUNO)
    - aluno.lucas / 123456 (ALUNO)
  `);
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
