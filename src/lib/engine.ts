/**
 * ENGINE DE AUDITORIA DE CONTAINERS
 * Objetivo: Calcular demurrage com base na Resolução 112 da ANTAQ.
 */

export interface ParametrosAuditoria {
    dataRetirada: Date;
    dataDevolucao: Date;
    diasFreeTime: number;
    valorDiariaUSD: number;
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
   * Função principal de auditoria
   */
  export function auditarContainer(parametros: ParametrosAuditoria): ResultadoAuditoria {
    const { dataRetirada, dataDevolucao, diasFreeTime, valorDiariaUSD } = parametros;
  
    // 1. Validações de Segurança
    if (dataDevolucao < dataRetirada) {
      throw new Error('A data de devolução não pode ser anterior à retirada.');
    }
  
    // 2. Cálculo de dias base
    const diasTotais = calcularDiasTotais(dataRetirada, dataDevolucao);
    
    // 3. Lógica do Armador (Geralmente ignora restrições de devolução)
    const diasExcedentesArmador = Math.max(0, diasTotais - diasFreeTime);
    const valorCobradoPeloArmador = diasExcedentesArmador * valorDiariaUSD;
  
    // 4. Lógica ANTAQ (Valor Real Devido)
    let diasExcedentesReais = diasTotais - diasFreeTime;
    
    // Se a devolução foi no fim de semana, esse dia não conta para o excesso
    if (ehFinalDeSemana(dataDevolucao) && diasExcedentesReais > 0) {
      diasExcedentesReais -= 1;
    }
    
    diasExcedentesReais = Math.max(0, diasExcedentesReais);
    const valorDevidoReal = diasExcedentesReais * valorDiariaUSD;
  
    return {
      totalDiasExcedentes: diasExcedentesReais,
      valorDevidoReal: Number(valorDevidoReal.toFixed(2)),
      valorCobradoPeloArmador: Number(valorCobradoPeloArmador.toFixed(2)),
      houveDiferenca: valorCobradoPeloArmador > valorDevidoReal
    };
  }