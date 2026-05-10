export interface LessonDemo {
  label: string;
  q: string;
}

export interface Lesson {
  level: number;
  title: string;
  dataset: string;
  concept: string;
  tip: string;
  demos: LessonDemo[];
}

export interface LessonPuzzle {
  q: string;
  hint: string;
  keyword: string;
}

export const LESSONS: Lesson[] = [
  {level:1,title:'SELECT & FROM',dataset:'loja',
   concept:`O <b>SELECT</b> escolhe quais colunas queres ver. O <b>FROM</b> diz de onde vêm os dados.<br><br>Pensa assim: <b>FROM</b> vai ao armazém buscar a caixa. <b>SELECT</b> abre a caixa e tira só o que precisas.<br><br>Usa <code>SELECT *</code> para ver tudo, ou especifica as colunas: <code>SELECT nome, cidade</code>`,
   tip:'💡 O SELECT executa por ÚLTIMO — mesmo estando escrito primeiro. O motor SQL lê FROM antes de SELECT.',
   demos:[
     {label:'Ver tudo',q:'SELECT * FROM clientes'},
     {label:'Só algumas colunas',q:'SELECT nome, cidade FROM clientes'},
     {label:'Com filtro WHERE',q:"SELECT nome, pais FROM clientes WHERE pais = 'Portugal'"},
   ]},
  {level:2,title:'GROUP BY & Agregações',dataset:'loja',
   concept:`O <b>GROUP BY</b> junta linhas com o mesmo valor e aplica uma função de agregação.<br><br>Funções úteis: <code>COUNT(*)</code> conta linhas, <code>SUM(col)</code> soma, <code>AVG(col)</code> calcula média, <code>MAX()</code> e <code>MIN()</code> encontram extremos.<br><br>Regra importante: <b>todas as colunas no SELECT que não são agregações têm de estar no GROUP BY.</b>`,
   tip:'💡 O HAVING filtra DEPOIS do agrupamento. O WHERE filtra ANTES. Usa HAVING com COUNT(*) > 2, não WHERE.',
   demos:[
     {label:'Contar por grupo',q:'SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria'},
     {label:'Soma por grupo',q:'SELECT id_cliente, SUM(valor_total) FROM pedidos GROUP BY id_cliente'},
     {label:'Com HAVING',q:'SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria HAVING COUNT(*) > 2'},
   ]},
  {level:3,title:'INNER JOIN',dataset:'loja',
   concept:`O <b>JOIN</b> liga duas tabelas por uma coluna em comum.<br><br>O <b>INNER JOIN</b> devolve só as linhas que têm correspondência nas <b>duas</b> tabelas — como a intersecção de dois conjuntos.<br><br>A condição <code>ON tabela1.col = tabela2.col</code> diz ao SQL qual é a "chave" que liga as tabelas.`,
   tip:'💡 Usa alias para encurtar: FROM clientes c INNER JOIN pedidos p — depois podes escrever c.nome em vez de clientes.nome.',
   demos:[
     {label:'JOIN básico',q:'SELECT c.nome, p.valor_total FROM clientes c INNER JOIN pedidos p ON c.id_cli = p.id_cliente'},
     {label:'JOIN com filtro',q:'SELECT c.nome, p.valor_total FROM clientes c INNER JOIN pedidos p ON c.id_cli = p.id_cliente WHERE p.valor_total > 500'},
   ]},
  {level:4,title:'LEFT JOIN & NULLs',dataset:'loja',
   concept:`O <b>LEFT JOIN</b> devolve <b>todos</b> os registos da tabela da esquerda, mesmo que não tenham correspondência na direita.<br><br>Onde não há correspondência, os campos da tabela direita ficam <code>NULL</code>.<br><br>Muito usado para encontrar registos "órfãos": clientes sem pedidos, departamentos sem funcionários.`,
   tip:'💡 Para encontrar clientes SEM pedidos: LEFT JOIN + WHERE p.id_ped IS NULL.',
   demos:[
     {label:'Todos os clientes (com e sem pedidos)',q:'SELECT c.nome, p.id_ped FROM clientes c LEFT JOIN pedidos p ON c.id_cli = p.id_cliente'},
     {label:'Só os sem pedidos',q:'SELECT c.nome FROM clientes c LEFT JOIN pedidos p ON c.id_cli = p.id_cliente WHERE p.id_ped IS NULL'},
   ]},
  {level:5,title:'CASE WHEN',dataset:'loja',
   concept:`O <b>CASE WHEN</b> é o "if/else" do SQL — permite criar uma coluna nova com valores condicionais.<br><br>Estrutura: <code>CASE WHEN condição THEN valor WHEN outra THEN outro ELSE padrão END</code><br><br>Podes usar dentro do SELECT para classificar, dentro do GROUP BY para agrupar por categorias calculadas, e dentro do ORDER BY para ordenar por lógica personalizada.`,
   tip:'💡 Não te esqueças do END no final do CASE. É o erro mais comum.',
   demos:[
     {label:'Classificar clientes',q:"SELECT nome, CASE WHEN limite_credito > 8000 THEN 'VIP' WHEN limite_credito > 5000 THEN 'Gold' ELSE 'Standard' END AS categoria FROM clientes"},
     {label:'Contar por categoria calculada',q:"SELECT CASE WHEN limite_credito > 8000 THEN 'VIP' WHEN limite_credito > 5000 THEN 'Gold' ELSE 'Standard' END AS cat, COUNT(*) FROM clientes GROUP BY cat"},
   ]},
  {level:6,title:'Funções de Texto',dataset:'loja',
   concept:`O SQL tem funções para manipular texto e números diretamente na query.<br><br><code>UPPER()</code> / <code>LOWER()</code> — maiúsculas/minúsculas<br><code>LENGTH()</code> — tamanho do texto<br><code>TRIM()</code> — remove espaços em branco<br><code>ROUND(n, casas)</code> — arredonda números<br><code>COALESCE(col, valor)</code> — substitui NULL por um valor padrão`,
   tip:'💡 Podes encadear funções: LOWER(TRIM(nome)) primeiro remove espaços, depois converte para minúsculas.',
   demos:[
     {label:'Funções de texto',q:'SELECT nome, UPPER(nome), LENGTH(nome) FROM clientes ORDER BY LENGTH(nome) DESC'},
     {label:'ROUND e COALESCE',q:'SELECT nome, ROUND(preco,0), COALESCE(categoria, "sem categoria") FROM produtos'},
   ]},
  {level:7,title:'Window Functions',dataset:'empresa',
   concept:`As <b>Window Functions</b> calculam valores através de múltiplas linhas <b>sem colapsar o resultado</b> — ao contrário do GROUP BY.<br><br>Estrutura: <code>FUNÇÃO() OVER (PARTITION BY col ORDER BY col)</code><br><br><b>RANK()</b> — posição com saltos (1,1,3). <b>DENSE_RANK()</b> — posição sem saltos (1,1,2). <b>ROW_NUMBER()</b> — número único por linha.<br><b>LAG(col)</b> — valor da linha anterior. <b>LEAD(col)</b> — valor da linha seguinte.`,
   tip:'💡 PARTITION BY é opcional — sem ele, a janela é toda a tabela. Com ele, reinicia o cálculo por grupo.',
   demos:[
     {label:'RANK de salários',q:'SELECT nome, salario, RANK() OVER (ORDER BY salario DESC) AS ranking FROM funcionarios'},
     {label:'RANK por departamento',q:'SELECT nome, id_dept, salario, RANK() OVER (PARTITION BY id_dept ORDER BY salario DESC) AS rank_dept FROM funcionarios'},
     {label:'LAG — salário anterior',q:'SELECT nome, salario, LAG(salario) OVER (ORDER BY salario) AS anterior FROM funcionarios'},
   ]},
  {level:8,title:'Subqueries',dataset:'loja',
   concept:`Uma <b>subquery</b> é uma query dentro de outra query — entre parênteses.<br><br>Pode aparecer no <b>WHERE</b> para filtrar por um valor calculado, no <b>FROM</b> como uma tabela temporária, ou no <b>HAVING</b> para filtrar grupos.<br><br>Regra: a subquery executa <b>primeiro</b>, devolve um valor, e a query exterior usa esse valor.`,
   tip:'💡 Quando vires uma subquery, lê de dentro para fora. O que está dentro dos () executa primeiro.',
   demos:[
     {label:'Produtos acima da média',q:'SELECT nome, preco FROM produtos WHERE preco > (SELECT AVG(preco) FROM produtos) ORDER BY preco DESC'},
     {label:'NOT IN com subquery',q:'SELECT nome FROM produtos WHERE id_prod NOT IN (SELECT DISTINCT id_produto FROM pedidos)'},
   ]},
  {level:9,title:'UPDATE & DELETE',dataset:'loja',
   concept:`O <b>UPDATE</b> modifica registos existentes. O <b>DELETE</b> apaga-os.<br><br><code>UPDATE tabela SET coluna = valor WHERE condição;</code><br><code>DELETE FROM tabela WHERE condição;</code><br><br>⚠️ <b>Sem WHERE, afecta TODOS os registos.</b> Sempre testa com SELECT primeiro!`,
   tip:'⚠️ Regra de ouro: antes de qualquer UPDATE ou DELETE, corre o SELECT equivalente para ver o que vai ser afectado.',
   demos:[
     {label:'UPDATE simples',q:"UPDATE clientes SET limite_credito = 9500 WHERE nome = 'Ana Silva'"},
     {label:'DELETE com subquery',q:"DELETE FROM pedidos WHERE id_cliente IN (SELECT id_cli FROM clientes WHERE pais <> 'Portugal')"},
   ]},
  {level:10,title:'Hospital — Dados de Saúde',dataset:'hospital',
   concept:`Dados de saúde são relacionais por natureza — médicos, pacientes, consultas e internamentos.<br><br>Neste dataset vais praticar <b>JOINs de 3+ tabelas</b>, <b>LEFT JOIN para encontrar ausências</b> e <b>agregações com contexto médico</b>.<br><br>Regra de ouro: em dados de saúde, os NULLs são críticos — um paciente sem registo pode ser um erro ou simplesmente alguém saudável.`,
   tip:'💡 Dados médicos são o caso de uso mais comum de LEFT JOIN — encontrar "quem não tem quê".',
   demos:[
     {label:'Consultas por especialidade',q:'SELECT m.especialidade, COUNT(c.id) AS consultas FROM consultas c INNER JOIN medicos m ON c.id_medico = m.id GROUP BY m.especialidade ORDER BY consultas DESC'},
     {label:'Pacientes sem internamento',q:'SELECT p.nome FROM pacientes p LEFT JOIN internamentos i ON p.id = i.id_paciente WHERE i.id IS NULL'},
   ]},
  {level:11,title:'Banco — Análise Financeira',dataset:'banco',
   concept:`Dados bancários são o pão e manteiga dos analistas de dados em Portugal e no Brasil.<br><br>Aqui vais trabalhar com <b>scores de crédito</b>, <b>saldos</b>, <b>transacções</b> e <b>empréstimos</b> — exactamente o que encontras num estágio de dados em qualquer banco.<br><br>O conceito chave: <b>risco de crédito</b> é sempre uma combinação de score + saldo + histórico de pagamento.`,
   tip:'💡 Em análise financeira, HAVING é mais usado que WHERE — filtras grupos (clientes com saldo total < X), não linhas individuais.',
   demos:[
     {label:'Saldo por tipo de conta',q:'SELECT tipo, COUNT(*), SUM(saldo) AS total FROM contas GROUP BY tipo ORDER BY total DESC'},
     {label:'Clientes de alto risco',q:"SELECT c.nome, c.score_credito, e.estado FROM clientes c INNER JOIN emprestimos e ON c.id = e.id_cliente WHERE e.estado = 'incumprimento'"},
   ]},
  {level:12,title:'CTEs & UNION',dataset:'empresa',
   concept:`Uma <b>CTE (Common Table Expression)</b> é uma query temporária com nome, definida com <b>WITH</b>.<br><br><code>WITH nome_cte AS (SELECT ...) SELECT * FROM nome_cte</code><br><br>Vantagem: torna queries complexas legíveis em camadas. Podes encadear múltiplas CTEs.<br><b>UNION</b> combina resultados de duas queries (remove duplicados). <b>UNION ALL</b> mantém tudo.`,
   tip:'💡 CTEs são a chave para queries elegantes em entrevistas. Separa o problema em partes e resolve cada uma.',
   demos:[
     {label:'CTE simples',q:'WITH top_sal AS (SELECT nome, salario FROM funcionarios ORDER BY salario DESC LIMIT 3) SELECT * FROM top_sal'},
     {label:'UNION de tabelas',q:"SELECT nome, 'departamento' AS tipo FROM departamentos UNION SELECT nome, 'projeto' AS tipo FROM projetos ORDER BY nome"},
   ]},
  {level:13,title:'Self JOIN',dataset:'empresa',
   concept:`Um <b>Self JOIN</b> é quando uma tabela faz JOIN com ela própria — para representar hierarquias ou relações dentro da mesma entidade.<br><br>Exemplo clássico: tabela de <b>funcionários</b> onde cada funcionário tem um <b>id_manager</b> que aponta para outro funcionário da mesma tabela.<br><br>Usa <b>alias diferentes</b> para distinguir as duas "cópias" da tabela: <code>FROM funcionarios f JOIN funcionarios m ON f.id_manager = m.id_func</code>`,
   tip:'💡 Self JOIN aparece em quase toda entrevista de dados. Pensa nele como "juntar a tabela com uma cópia de si própria".',
   demos:[
     {label:'Funcionário e manager',q:'SELECT f.nome AS funcionario, m.nome AS manager FROM funcionarios f LEFT JOIN funcionarios m ON f.id_manager = m.id_func ORDER BY m.nome'},
     {label:'Quem ganha mais que o manager',q:'SELECT f.nome, f.salario, m.salario AS sal_manager FROM funcionarios f INNER JOIN funcionarios m ON f.id_manager = m.id_func WHERE f.salario > m.salario'},
   ]},
  {level:14,title:'LeetCode SQL',dataset:'empresa',
   concept:`Este nível usa problemas reais de entrevistas técnicas em empresas como <b>Revolut, Farfetch, NTT Data</b>.<br><br>Combina tudo: <b>CTEs + Window Functions + Self JOIN + Subqueries</b>.<br><br>Estratégia: divide o problema em partes. Primeiro entende o que é pedido, depois constrói CTE a CTE.`,
   tip:'💡 Nas entrevistas reais, não precisas de acertar à primeira. Pensa em voz alta e mostra o raciocínio. Isso vale mais que a solução perfeita.',
   demos:[
     {label:'Top N por grupo',q:'WITH ranked AS (SELECT nome, id_dept, salario, DENSE_RANK() OVER (PARTITION BY id_dept ORDER BY salario DESC) AS rnk FROM funcionarios) SELECT nome, id_dept, salario FROM ranked WHERE rnk <= 2 ORDER BY id_dept'},
     {label:'Running Total',q:"WITH stats AS (SELECT id_dept, COUNT(*) AS total, ROUND(AVG(salario),2) AS media FROM funcionarios GROUP BY id_dept) SELECT d.nome, s.total, s.media FROM departamentos d INNER JOIN stats s ON d.id_dept = s.id_dept ORDER BY s.media DESC"},
   ]},
];

export const LESSON_PUZZLES: Record<number, LessonPuzzle> = {
  1:{q:'Sem pesquisar nada, consegues escrever uma query que mostra todos os clientes? Experimenta aqui:',hint:'Tenta com SELECT e FROM...',keyword:'clientes'},
  2:{q:'Sem ver a teoria: como contarias quantos produtos existem em cada categoria? Escreve a tua tentativa:',hint:'Precisas de GROUP BY e COUNT...',keyword:'group by'},
  3:{q:'Tens duas tabelas: clientes e pedidos. Como ligarias as duas para ver o nome do cliente e o valor do pedido?',hint:'Precisas de JOIN e ON...',keyword:'join'},
  4:{q:'Como encontrarias todos os clientes que NUNCA fizeram um pedido? Escreve uma tentativa:',hint:'LEFT JOIN... WHERE ... IS NULL',keyword:'null'},
  5:{q:'Como classificarias um produto como "Caro" se o preço for > 500, e "Barato" caso contrário?',hint:'CASE WHEN... THEN... ELSE... END',keyword:'case'},
  6:{q:'Como colocarias todos os nomes de clientes em maiúsculas numa query?',hint:'Existe uma função para isso: UPPER()',keyword:'upper'},
  7:{q:'Como numerarias cada linha de uma tabela de resultados? Não com o id, mas com 1, 2, 3...',hint:'Window function: ROW_NUMBER() OVER (ORDER BY ...)',keyword:'over'},
  8:{q:'Como encontrarias produtos com preço acima da média de todos os produtos?',hint:'WHERE preco > (SELECT AVG...)',keyword:'select'},
  9:{q:'Como apagarias todos os pedidos de um cliente específico?',hint:'DELETE FROM... WHERE...',keyword:'delete'},
  10:{q:'Tens uma tabela de consultas e outra de médicos. Como calcularias o custo médio por especialidade?',hint:'JOIN + GROUP BY + AVG...',keyword:'avg'},
  11:{q:'Como encontrarias clientes com saldo total (soma de todas as contas) abaixo de 1000€?',hint:'JOIN contas + GROUP BY + HAVING SUM...',keyword:'having'},
  12:{q:'Como organizarias uma query complexa em partes nomeadas para ficar mais legível?',hint:'WITH nome AS (SELECT...) SELECT...',keyword:'with'},
  13:{q:'Imagina que cada funcionário tem um id_manager. Como mostrarias o nome do funcionário E o nome do seu manager?',hint:'JOIN da tabela com ela própria — self join',keyword:'join'},
  14:{q:'Como encontrarias os 3 funcionários mais bem pagos de CADA departamento?',hint:'DENSE_RANK() OVER (PARTITION BY id_dept ORDER BY salario DESC)',keyword:'rank'},
};

export const LESSON_ANIMS: Record<number, string> = {
  1:`<div class="anim-box" style="border-color:rgba(56,189,248,.5)"><div class="anim-label" style="font-size:12px;color:var(--blue);font-weight:700;margin-bottom:12px">▶ Como funciona o SELECT</div><div class="anim-rows"><div class="anim-row grp-a">id=1 &nbsp; <b>Ana Silva</b> &nbsp; Portugal &nbsp; Lisboa</div><div class="anim-row grp-b">id=2 &nbsp; <b>Bruno Ramos</b> &nbsp; Brasil &nbsp; São Paulo</div><div class="anim-row grp-c">id=3 &nbsp; <b>Carlos</b> &nbsp; Angola &nbsp; Luanda</div></div><div class="anim-arrow">↓ SELECT nome, cidade</div><div class="anim-rows"><div class="anim-row grp-a"><b>Ana Silva</b> &nbsp; Lisboa</div><div class="anim-row grp-b"><b>Bruno Ramos</b> &nbsp; São Paulo</div><div class="anim-row grp-c"><b>Carlos</b> &nbsp; Luanda</div></div></div>`,
  2:`<div class="anim-box" style="border-color:rgba(251,146,60,.5)"><div class="anim-label" style="font-size:12px;color:var(--orange);font-weight:700;margin-bottom:12px">▶ Como funciona o GROUP BY</div><div class="anim-rows"><div class="anim-row grp-a">Laptop &nbsp; <b>Electronica</b></div><div class="anim-row grp-b">Secretaria &nbsp; <b>Mobiliario</b></div><div class="anim-row grp-a">Rato &nbsp; <b>Electronica</b></div><div class="anim-row grp-b">Cadeira &nbsp; <b>Mobiliario</b></div><div class="anim-row grp-a">Monitor &nbsp; <b>Electronica</b></div></div><div class="anim-arrow">↓ GROUP BY categoria</div><div class="anim-rows"><div class="anim-row grp-a"><b>Electronica</b> &nbsp; COUNT=3</div><div class="anim-row grp-b"><b>Mobiliario</b> &nbsp; COUNT=2</div></div></div>`,
  3:`<div class="anim-box" style="border-color:rgba(74,222,128,.5)"><div class="anim-label" style="font-size:12px;color:var(--green);font-weight:700;margin-bottom:12px">▶ Como funciona o JOIN</div><div class="anim-join"><div class="anim-tbl"><div class="anim-tbl-h" style="color:var(--blue)">CLIENTES</div><div class="anim-tbl-r">id=1 Ana</div><div class="anim-tbl-r">id=2 Bruno</div></div><div class="anim-join-line">⟷</div><div class="anim-tbl"><div class="anim-tbl-h" style="color:var(--green)">PEDIDOS</div><div class="anim-tbl-r">id_cli=1 €1200</div><div class="anim-tbl-r">id_cli=2 €50</div></div></div><div class="anim-arrow">↓ INNER JOIN ON id = id_cli</div><div class="anim-rows"><div class="anim-row grp-a">Ana &nbsp; €1200</div><div class="anim-row grp-b">Bruno &nbsp; €50</div></div></div>`,
  4:`<div class="anim-box" style="border-color:rgba(168,85,247,.5)"><div class="anim-label" style="font-size:12px;color:var(--purple);font-weight:700;margin-bottom:12px">▶ Como funciona o LEFT JOIN</div><div class="anim-rows anim-filter"><div class="anim-row kept">Ana ✓ tem pedidos → aparece</div><div class="anim-row kept">Bruno ✓ tem pedidos → aparece</div><div class="anim-row grp-c" style="opacity:.7">Filipa → NULL (sem pedidos)</div><div class="anim-row grp-c" style="opacity:.7">Jorge → NULL (sem pedidos)</div></div></div>`,
  5:`<div class="anim-box" style="border-color:rgba(251,191,36,.5)"><div class="anim-label" style="font-size:12px;color:var(--yellow);font-weight:700;margin-bottom:12px">▶ Como funciona o CASE WHEN</div><div class="anim-rows"><div class="anim-row grp-a">limite=9500 → <b style="color:gold">VIP</b></div><div class="anim-row grp-b">limite=6000 → <b style="color:var(--blue)">Gold</b></div><div class="anim-row grp-c">limite=2000 → <b style="color:var(--muted)">Standard</b></div></div></div>`,
};
