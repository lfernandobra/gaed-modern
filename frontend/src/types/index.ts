export type Role =
  | "ADMIN"
  | "GESTOR"
  | "SECRETARIA"
  | "PROFESSOR"
  | "RESPONSAVEL"
  | "ALUNO";

export interface Usuario {
  id: number;
  login: string;
  nome: string;
  sobrenome?: string;
  email?: string;
  cpf?: string;
  rg?: string;
  sexo?: string;
  telefone?: string;
  role: Role;
  status: boolean;
  fotoUrl?: string;
  dataNasc?: string;
  dataIngresso?: string;
  dataSaida?: string;
  numero?: string;
  complemento?: string;
  logradouroId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Uf {
  id: number;
  nome: string;
  sigla: string;
}

export interface Municipio {
  id: number;
  nome: string;
  ufId: number;
  uf?: Uf;
}

export interface Bairro {
  id: number;
  nome: string;
  municipioId: number;
  municipio?: Municipio;
}

export interface Logradouro {
  id: number;
  nome: string;
  cep: string;
  bairroId: number;
  bairro?: Bairro;
}

export interface Serie {
  id: number;
  nome: string;
  _count?: { turmas: number };
}

export interface Periodo {
  id: number;
  nome: string;
}

export interface Turma {
  id: number;
  nome: string;
  limite: number;
  inseridos: number;
  serieId: number;
  periodoId: number;
  serie?: Serie;
  periodo?: Periodo;
  _count?: { alunos: number };
}

export interface Disciplina {
  id: number;
  nome: string;
  conteudo?: string;
  _count?: { professores: number; turmaDisciplinas: number };
}

export interface Bimestre {
  id: number;
  nome: string;
  dataInicial?: string;
  dataFinal: string;
}

export interface Boletim {
  id: number;
  bimestreId: number;
  bimestre?: Bimestre;
  _count?: { notas: number };
}

export interface Nota {
  boletimId: number;
  alunoId: number;
  disciplinaId: number;
  nota: number;
  falta: number;
  aluno?: { id: number; nome: string; sobrenome: string };
  disciplina?: { id: number; nome: string };
  boletim?: Boletim;
}

export interface Ocorrencia {
  id: number;
  assunto: string;
  descricao?: string;
  data: string;
  alunoId: number;
  aluno?: { id: number; nome: string; sobrenome: string };
}

export interface Tarefa {
  id: number;
  descricao: string;
  inicio?: string;
  fim?: string;
  disciplinaId: number;
  anexoUrl?: string;
  disciplina?: { id: number; nome: string };
  turmas?: { turmaId: number; turma: { id: number; nome: string } }[];
}

export interface Imagem {
  id: number;
  nome: string;
  descricao?: string;
  url: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  SECRETARIA: "Secretária",
  PROFESSOR: "Professor",
  RESPONSAVEL: "Responsável",
  ALUNO: "Aluno",
};
