/**
 * ENGINE DE AUDITORIA DE CONTAINERS
 * Objetivo: Calcular demurrage com base na Resolução 112 da ANTAQ.
 */

export interface PeriodoInterrupcao {
    dataInicio: Date;
    dataFim: Date;
  }

export interface ParametrosAuditoria {
    dataRetirada: Date;
    dataDevolucao: Date;
    diasFreeTime: number;
    valorDiariaUSD: number;
    periodosInterrupcao?: PeriodoInterrupcao[];
  }
  
  export interface ResultadoAuditoria {
    totalDiasExcedentes: number;
    valorDevidoReal: number;
    valorCobradoPeloArmador: number;
    houveDiferenca: boolean;
  }
  
  /**
   * Verifica se a data é Sábado (6) ou Domingo (0)
   */
  function ehFinalDeSemana(data: Date): boolean {
    const diaSemana = data.getDay();
    return diaSemana === 0 || diaSemana === 6;
  }
  
  /**
   * Calcula a diferença de dias garantindo que o tempo (horas) não interfira
   */
  function calcularDiasTotais(dataInicial: Date, dataFinal: Date): number {
    const inicio = new Date(dataInicial.getFullYear(), dataInicial.getMonth(), dataInicial.getDate());
    const fim = new Date(dataFinal.getFullYear(), dataFinal.getMonth(), dataFinal.getDate());
    
    const diferencaMs = fim.getTime() - inicio.getTime();
    // 86400000 ms = 1 dia. Usamos Math.round para evitar problemas com horário de verão
    return Math.round(diferencaMs / 86400000) + 1;
  }
  
  /**
   * Normaliza uma data removendo a parte de hora/minuto/segundo
   */
  function normalizarData(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  /**
   * Verifica se dois períodos se sobrepõem
   */
  function periodosSobrepostos(periodo1: PeriodoInterrupcao, periodo2: PeriodoInterrupcao): boolean {
    const inicio1 = normalizarData(periodo1.dataInicio).getTime();
    const fim1 = normalizarData(periodo1.dataFim).getTime();
    const inicio2 = normalizarData(periodo2.dataInicio).getTime();
    const fim2 = normalizarData(periodo2.dataFim).getTime();
    
    // Dois períodos se sobrepõem se: inicio1 <= fim2 && inicio2 <= fim1
    return inicio1 <= fim2 && inicio2 <= fim1;
  }

  /**
   * Mescla dois períodos sobrepostos em um único período
   */
  function mesclarPeriodos(periodo1: PeriodoInterrupcao, periodo2: PeriodoInterrupcao): PeriodoInterrupcao {
    const inicio1 = normalizarData(periodo1.dataInicio);
    const fim1 = normalizarData(periodo1.dataFim);
    const inicio2 = normalizarData(periodo2.dataInicio);
    const fim2 = normalizarData(periodo2.dataFim);
    
    return {
      dataInicio: inicio1 < inicio2 ? inicio1 : inicio2,
      dataFim: fim1 > fim2 ? fim1 : fim2
    };
  }

  /**
   * Calcula o total de dias de interrupção considerando todos os períodos
   * Mescla períodos sobrepostos para evitar contar o mesmo dia duas vezes
   */
  function calcularDiasInterrupcao(periodos: PeriodoInterrupcao[] = []): number {
    if (periodos.length === 0) {
      return 0;
    }

    // Validações iniciais
    for (const periodo of periodos) {
      if (periodo.dataFim < periodo.dataInicio) {
        throw new Error('A data fim da interrupção não pode ser anterior à data início.');
      }
    }

    // Criar cópias dos períodos e normalizar datas
    const periodosNormalizados: PeriodoInterrupcao[] = periodos.map(p => ({
      dataInicio: normalizarData(p.dataInicio),
      dataFim: normalizarData(p.dataFim)
    }));

    // Ordenar períodos por data de início
    periodosNormalizados.sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime());

    // Mesclar períodos sobrepostos
    const periodosMesclados: PeriodoInterrupcao[] = [];
    
    for (const periodoAtual of periodosNormalizados) {
      if (periodosMesclados.length === 0) {
        periodosMesclados.push({ ...periodoAtual });
      } else {
        const ultimoPeriodo = periodosMesclados[periodosMesclados.length - 1];
        
        if (periodosSobrepostos(ultimoPeriodo, periodoAtual)) {
          // Mesclar com o último período
          periodosMesclados[periodosMesclados.length - 1] = mesclarPeriodos(ultimoPeriodo, periodoAtual);
        } else {
          // Adicionar como novo período
          periodosMesclados.push({ ...periodoAtual });
        }
      }
    }

    // Calcular o total de dias únicos
    let totalDias = 0;
    for (const periodo of periodosMesclados) {
      totalDias += calcularDiasTotais(periodo.dataInicio, periodo.dataFim);
    }
    
    return totalDias;
  }

  /**
   * Função principal de auditoria
   */
  export function auditarContainer(parametros: ParametrosAuditoria): ResultadoAuditoria {
    const { dataRetirada, dataDevolucao, diasFreeTime, valorDiariaUSD, periodosInterrupcao = [] } = parametros;

    // 1. Validações de Segurança
    if (dataDevolucao < dataRetirada) {
      throw new Error('A data de devolução não pode ser anterior à retirada.');
    }

    // 2. Cálculo de dias base
    const diasTotais = calcularDiasTotais(dataRetirada, dataDevolucao);
    
    // 3. Calcular dias de interrupção
    const diasInterrupcao = calcularDiasInterrupcao(periodosInterrupcao);
    
    // 4. Lógica do Armador (Geralmente ignora restrições de devolução e interrupções)
    const diasExcedentesArmador = Math.max(0, diasTotais - diasFreeTime);
    const valorCobradoPeloArmador = diasExcedentesArmador * valorDiariaUSD;

    // 5. Lógica ANTAQ (Valor Real Devido)
    // Cálculo: (Dias Totais - Free Time - Dias de Interrupção) = Dias Cobráveis
    let diasCobravels = diasTotais - diasFreeTime - diasInterrupcao;
    
    // Se a devolução foi no fim de semana, esse dia não conta para o excesso
    if (ehFinalDeSemana(dataDevolucao) && diasCobravels > 0) {
      diasCobravels -= 1;
    }
    
    // Se o resultado for menor ou igual a zero, o valor devido é USD 0,00
    diasCobravels = Math.max(0, diasCobravels);
    const valorDevidoReal = diasCobravels * valorDiariaUSD;

    return {
      totalDiasExcedentes: diasCobravels,
      valorDevidoReal: Number(valorDevidoReal.toFixed(2)),
      valorCobradoPeloArmador: Number(valorCobradoPeloArmador.toFixed(2)),
      houveDiferenca: valorCobradoPeloArmador > valorDevidoReal
    };
  }