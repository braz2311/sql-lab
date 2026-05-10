export interface Dataset {
  label: string;
  sql: string;
}

export const DATASETS: Record<string, Dataset> = {
  loja: {
    label: '🛒 Loja',
    sql: `CREATE TABLE clientes(id_cli INT PRIMARY KEY,nome TEXT NOT NULL,pais TEXT,cidade TEXT);
INSERT INTO clientes VALUES(1,'Ana Silva','Portugal','Lisboa'),(2,'Bruno Ramos','Brasil','São Paulo'),(3,'Carlos','Angola','Luanda'),(4,'Diana','Portugal','Porto'),(5,'Eduardo','Brasil','Rio'),(6,'Filipa','Portugal','Braga'),(7,'Jorge','Mozambique','Maputo');
CREATE TABLE produtos(id_prod INT PRIMARY KEY,nome TEXT,categoria TEXT,preco DECIMAL);
INSERT INTO produtos VALUES(1,'Laptop','Electronica',1200.0),(2,'Rato','Electronica',25.0),(3,'Secretaria','Mobiliario',450.0),(4,'Cadeira','Mobiliario',320.0),(5,'Monitor','Electronica',650.0),(6,'Teclado','Electronica',80.0);
CREATE TABLE pedidos(id_ped INT PRIMARY KEY,id_cliente INT REFERENCES clientes(id_cli),id_produto INT REFERENCES produtos(id_prod),quantidade INT,valor_total DECIMAL);
INSERT INTO pedidos VALUES(10,1,1,1,1200.0),(11,2,2,2,50.0),(12,1,5,1,650.0),(13,3,3,1,450.0),(14,4,4,2,640.0),(15,5,1,1,1200.0),(16,2,6,1,80.0),(17,4,2,3,75.0);`,
  },
  empresa: {
    label: '🏢 Empresa',
    sql: `CREATE TABLE departamentos(id_dept INT PRIMARY KEY,nome TEXT,cidade TEXT,orcamento DECIMAL);
INSERT INTO departamentos VALUES(1,'Tecnologia','Lisboa',500000),(2,'Marketing','Porto',200000),(3,'Financas','Lisboa',300000),(4,'RH','Braga',150000);
CREATE TABLE funcionarios(id_func INT PRIMARY KEY,nome TEXT,cargo TEXT,salario DECIMAL,id_dept INT REFERENCES departamentos(id_dept),id_manager INT REFERENCES funcionarios(id_func));
INSERT INTO funcionarios VALUES(1,'Sofia','Dev Senior',3500,1,NULL),(2,'Miguel','Dev Junior',1800,1,1),(3,'Ines','Designer',2200,2,NULL),(4,'Rui','Analista',2800,3,NULL),(5,'Marta','Gestora RH',2500,4,NULL),(6,'Joao','Dev Pleno',2600,1,1),(7,'Clara','Marketing',1900,2,3),(8,'Tiago','Contabilidade',2300,3,4);
CREATE TABLE projetos(id_proj INT PRIMARY KEY,nome TEXT,id_dept INT REFERENCES departamentos(id_dept),estado TEXT,orcamento DECIMAL);
INSERT INTO projetos VALUES(1,'App Mobile',1,'ativo',80000),(2,'Campanha Verao',2,'concluido',30000),(3,'Auditoria',3,'ativo',15000),(4,'Portal RH',4,'ativo',20000),(5,'API Pagamentos',1,'ativo',60000);`,
  },
  ecommerce: {
    label: '🌐 E-commerce',
    sql: `CREATE TABLE utilizadores(id INT PRIMARY KEY,username TEXT,pais TEXT,plano TEXT);
INSERT INTO utilizadores VALUES(1,'ana_s','Portugal','premium'),(2,'bramos','Brasil','basico'),(3,'carlos99','Angola','basico'),(4,'d_silva','Portugal','premium'),(5,'edu_br','Brasil','premium');
CREATE TABLE categorias(id INT PRIMARY KEY,nome TEXT,desconto DECIMAL);
INSERT INTO categorias VALUES(1,'Electronica',0.05),(2,'Moda',0.10),(3,'Livros',0.0),(4,'Casa',0.08);
CREATE TABLE produtos(id INT PRIMARY KEY,nome TEXT,id_cat INT REFERENCES categorias(id),preco DECIMAL,stock INT);
INSERT INTO produtos VALUES(1,'iPhone',1,999.0,50),(2,'Camisola',2,29.9,200),(3,'Clean Code',3,45.0,80),(4,'Lampada LED',4,12.5,300),(5,'MacBook',1,1899.0,20),(6,'Jeans',2,59.9,150);
CREATE TABLE transacoes(id INT PRIMARY KEY,id_user INT REFERENCES utilizadores(id),id_prod INT REFERENCES produtos(id),data TEXT,quantidade INT,total DECIMAL);
INSERT INTO transacoes VALUES(1,1,1,'2024-01-10',1,999.0),(2,2,2,'2024-01-12',2,59.8),(3,1,5,'2024-02-01',1,1899.0),(4,3,3,'2024-02-05',1,45.0),(5,4,4,'2024-03-01',5,62.5),(6,5,1,'2024-03-10',1,999.0),(7,2,6,'2024-03-15',1,59.9);`,
  },
  hospital: {
    label: '🏥 Hospital',
    sql: `CREATE TABLE medicos(id INT PRIMARY KEY,nome TEXT,especialidade TEXT,cidade TEXT,salario DECIMAL);
INSERT INTO medicos VALUES(1,'Dr. António','Cardiologia','Lisboa',4500),(2,'Dra. Beatriz','Neurologia','Porto',5200),(3,'Dr. Carlos','Ortopedia','Lisboa',3800),(4,'Dra. Diana','Pediatria','Braga',4100),(5,'Dr. Eduardo','Cardiologia','Porto',4800);
CREATE TABLE pacientes(id INT PRIMARY KEY,nome TEXT,idade INT,cidade TEXT,plano TEXT);
INSERT INTO pacientes VALUES(1,'João Silva',45,'Lisboa','premium'),(2,'Maria Costa',32,'Porto','basico'),(3,'Pedro Alves',67,'Braga','premium'),(4,'Ana Ferreira',28,'Lisboa','basico'),(5,'Rui Santos',54,'Porto','premium'),(6,'Carla Nunes',41,'Lisboa','premium');
CREATE TABLE consultas(id INT PRIMARY KEY,id_paciente INT REFERENCES pacientes(id),id_medico INT REFERENCES medicos(id),data TEXT,diagnostico TEXT,custo DECIMAL);
INSERT INTO consultas VALUES(1,1,1,'2024-01-10','Hipertensão',120.0),(2,2,2,'2024-01-15','Enxaqueca',150.0),(3,3,1,'2024-01-20','Arritmia',180.0),(4,4,4,'2024-02-01','Gripe',80.0),(5,1,3,'2024-02-10','Fractura',220.0),(6,5,1,'2024-02-15','Colesterol',120.0),(7,6,2,'2024-03-01','Stress',150.0),(8,3,4,'2024-03-10','Controlo',80.0),(9,2,1,'2024-03-20','Palpitações',120.0);
CREATE TABLE internamentos(id INT PRIMARY KEY,id_paciente INT REFERENCES pacientes(id),data_entrada TEXT,data_saida TEXT,enfermaria TEXT,custo_dia DECIMAL);
INSERT INTO internamentos VALUES(1,3,'2024-01-18','2024-01-22','Cardiologia',350.0),(2,1,'2024-02-08','2024-02-10','Ortopedia',300.0),(3,5,'2024-02-14','2024-02-17','Cardiologia',350.0);`,
  },
  banco: {
    label: '🏦 Banco',
    sql: `CREATE TABLE clientes(id INT PRIMARY KEY,nome TEXT,cidade TEXT,profissao TEXT,score_credito INT);
INSERT INTO clientes VALUES(1,'Ana Lima','Lisboa','Engenheira',780),(2,'Bruno Faria','Porto','Professor',620),(3,'Carla Mota','Braga','Médica',850),(4,'David Cruz','Lisboa','Desempregado',480),(5,'Eva Santos','Porto','Advogada',720),(6,'Filipe Neves','Faro','Comerciante',590);
CREATE TABLE contas(id INT PRIMARY KEY,id_cliente INT REFERENCES clientes(id),tipo TEXT,saldo DECIMAL,data_abertura TEXT);
INSERT INTO contas VALUES(1,1,'corrente',2500.0,'2020-03-01'),(2,1,'poupanca',15000.0,'2020-03-01'),(3,2,'corrente',800.0,'2021-06-15'),(4,3,'corrente',8200.0,'2019-01-10'),(5,3,'poupanca',45000.0,'2019-01-10'),(6,4,'corrente',120.0,'2022-11-01'),(7,5,'corrente',3100.0,'2020-08-20'),(8,6,'corrente',950.0,'2021-03-05');
CREATE TABLE transacoes(id INT PRIMARY KEY,id_conta INT REFERENCES contas(id),tipo TEXT,valor DECIMAL,data TEXT,descricao TEXT);
INSERT INTO transacoes VALUES(1,1,'debito',500.0,'2024-01-05','Renda'),(2,1,'credito',2000.0,'2024-01-31','Salario'),(3,3,'debito',200.0,'2024-01-10','Supermercado'),(4,4,'credito',5000.0,'2024-01-31','Salario'),(5,4,'debito',1200.0,'2024-02-01','Renda'),(6,7,'debito',800.0,'2024-02-05','Carro'),(7,7,'credito',3500.0,'2024-02-28','Salario'),(8,2,'credito',500.0,'2024-03-01','Transferencia'),(9,5,'credito',2000.0,'2024-03-01','Poupanca mensal'),(10,6,'debito',50.0,'2024-03-10','Levantamento');
CREATE TABLE emprestimos(id INT PRIMARY KEY,id_cliente INT REFERENCES clientes(id),valor DECIMAL,taxa_juro DECIMAL,prazo_meses INT,estado TEXT,data TEXT);
INSERT INTO emprestimos VALUES(1,1,10000.0,0.035,36,'ativo','2023-06-01'),(2,2,5000.0,0.048,24,'ativo','2023-09-01'),(3,4,2000.0,0.072,12,'incumprimento','2022-01-01'),(4,5,25000.0,0.028,60,'ativo','2022-03-01'),(5,3,50000.0,0.025,120,'ativo','2020-01-01');`,
  },
};
