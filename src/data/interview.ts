export interface InterviewQuestion {
  ctx: string;
  desc: string;
  dataset: string;
  expected: string;
}

export const IV_QUESTIONS: InterviewQuestion[] = [
  {ctx:'Tens 60 segundos. O RH precisa dos nomes de todos os clientes portugueses.',
   desc:'Seleciona <b>nome</b> dos clientes onde o país é Portugal, ordenado por nome.',
   dataset:'loja',expected:"SELECT nome FROM clientes WHERE pais = 'Portugal' ORDER BY nome"},
  {ctx:'O director de produto quer saber quantos produtos existem em cada categoria.',
   desc:'Agrupa produtos por <b>categoria</b> e conta quantos há em cada uma.',
   dataset:'loja',expected:'SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria'},
  {ctx:'O sistema de faturação precisa do total gasto por cada cliente.',
   desc:'JOIN clientes + pedidos. Soma <b>valor_total</b> por cliente, ordenado do maior.',
   dataset:'loja',expected:'SELECT c.nome, SUM(p.valor_total) FROM clientes c INNER JOIN pedidos p ON c.id_cli = p.id_cliente GROUP BY c.nome ORDER BY SUM(p.valor_total) DESC'},
  {ctx:'O CFO quer saber o salário médio de cada departamento da empresa.',
   desc:'JOIN funcionarios + departamentos. <b>Média de salário</b> por departamento.',
   dataset:'empresa',expected:'SELECT d.nome, ROUND(AVG(f.salario),2) FROM departamentos d INNER JOIN funcionarios f ON d.id_dept = f.id_dept GROUP BY d.nome ORDER BY ROUND(AVG(f.salario),2) DESC'},
  {ctx:'Alerta de stock: lista produtos com stock abaixo de 100 unidades.',
   desc:'No E-commerce: produtos com <b>stock < 100</b>, ordenados do menor stock.',
   dataset:'ecommerce',expected:'SELECT nome, stock FROM produtos WHERE stock < 100 ORDER BY stock'},
];
