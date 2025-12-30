const normalizar = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const adicionarDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

export interface PeriodoInterrupcao {
  dataInicio: Date;
  dataFim: Date;
  motivo: string;
}

export interface ParametrosAuditoria {
  numeroContainer: string; 
  dataRetirada: Date;
  dataDevolucao: Date;
  diasFreeTime: number;
  valorDiariaUSD: number;
  periodosInterrupcao?: PeriodoInterrupcao[];
}

export interface ResultadoAuditoria {
  totalDiasOperacao: number;
  diasContabilizados: number;
  totalDiasExcedentes: number; // Nome oficial para a UI
  valorDevidoReal: number;
  valorCobradoPeloArmador: number;
  valorEconomizado: number;
  periodosInterrupcaoDescontados: { motivo: string; dias: number }[];
}

export function auditarContainer(params: ParametrosAuditoria): ResultadoAuditoria {
  const { dataRetirada, dataDevolucao, diasFreeTime, valorDiariaUSD, periodosInterrupcao = [] } = params;
  if (dataDevolucao < dataRetirada) throw new Error("A data de devolução não pode ser anterior à retirada.");

  const dataFimNormalizada = normalizar(dataDevolucao);
  let dataCursor = normalizar(dataRetirada);
  let diasContabilizados = 0;
  let totalDiasCalendario = 0;
  const mapaAbonos: Record<string, number> = {};

  while (dataCursor <= dataFimNormalizada) {
    totalDiasCalendario++;
    const interrupcaoAtiva = periodosInterrupcao.find(p => {
      const inicio = normalizar(p.dataInicio);
      const fim = normalizar(p.dataFim);
      return dataCursor >= inicio && dataCursor <= fim;
    });
    if (interrupcaoAtiva) {
      mapaAbonos[interrupcaoAtiva.motivo] = (mapaAbonos[interrupcaoAtiva.motivo] || 0) + 1;
    } else {
      diasContabilizados++;
    }
    dataCursor = adicionarDia(dataCursor);
  }

  const excedente = Math.max(0, diasContabilizados - diasFreeTime);
  const valorDevido = excedente * valorDiariaUSD;
  const excedenteBruto = Math.max(0, totalDiasCalendario - diasFreeTime);
  const valorBruto = excedenteBruto * valorDiariaUSD;

  return {
    totalDiasOperacao: totalDiasCalendario,
    diasContabilizados,
    totalDiasExcedentes: excedente,
    valorDevidoReal: Number(valorDevido.toFixed(2)),
    valorCobradoPeloArmador: Number(valorBruto.toFixed(2)),
    valorEconomizado: Number((valorBruto - valorDevido).toFixed(2)),
    periodosInterrupcaoDescontados: Object.entries(mapaAbonos).map(([motivo, dias]) => ({ motivo, dias }))
  };
}
