'use client';

import { type ResultadoAuditoria } from '@/lib/engine';

interface ReportPDFProps {
  resultado: ResultadoAuditoria;
  numeroContainer: string;
  dataRetirada: string;
  dataDevolucao: string;
  diasFreeTime: string;
  valorDiariaUSD: string;
  idAuditoria: string;
  economia: number;
  totalAbonado: number; // Recebendo via prop para evitar re-cálculo inútil
}

export default function ReportPDF(props: ReportPDFProps) {
  const {
    resultado, numeroContainer, dataRetirada, dataDevolucao,
    diasFreeTime, valorDiariaUSD, idAuditoria, economia, totalAbonado
  } = props;

  return (
    <div id="relatorio-container" className="hidden print:block bg-white font-serif">
      <div className="p-12 border-[1px] border-slate-200">
        {/* CABEÇALHO COM AUTORIDADE */}
        <header className="border-b-4 border-slate-900 pb-8 mb-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                Laudo Técnico de Auditoria
              </h1>
              <p className="text-sm font-bold text-blue-700 tracking-[0.15em] mt-2">
                EM CONFORMIDADE COM A RESOLUÇÃO NORMATIVA ANTAQ Nº 112/2023
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Registro de Auditoria</span>
              <span className="text-lg font-mono font-black text-slate-900">#{idAuditoria}</span>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 border-l-4 border-slate-900">
              <span className="font-bold block text-slate-500 uppercase text-[10px] mb-1">Unidade Auditada (Container)</span>
              <span className="text-xl font-black text-slate-900">{numeroContainer || 'NÃO INFORMADO'}</span>
            </div>
            <div className="bg-slate-50 p-4 border-r-4 border-slate-900 text-right">
              <span className="font-bold block text-slate-500 uppercase text-[10px] mb-1">Data de Emissão</span>
              <span className="font-bold text-slate-900">
                {new Date().toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </header>

        {/* 1. RESUMO FINANCEIRO */}
        <section className="mb-12">
          <h2 className="text-xs font-black bg-slate-900 text-white px-4 py-1 inline-block mb-6 uppercase">
            1. Resumo da Divergência Financeira
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-[11px] text-slate-500 uppercase">
                <th className="py-3 text-left font-black">Discriminação dos Valores</th>
                <th className="py-3 text-right font-black">Montante (USD)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-slate-100">
                <td className="py-4 text-slate-700 font-medium">Cobrança Apresentada pelo Armador (Bruta)</td>
                <td className="py-4 text-right font-mono font-bold">
                  {resultado.valorCobradoPeloArmador.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-4 text-slate-900 font-bold">Cálculo Auditado (Suspensões Aplicadas)</td>
                <td className="py-4 text-right font-mono font-bold text-blue-600">
                  {resultado.valorDevidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="bg-green-50">
                <td className="py-5 px-3 text-green-900 font-black text-base uppercase">Diferença Identificada (Economia)</td>
                <td className="py-5 px-3 text-right font-mono font-black text-green-700 text-2xl">
                  {economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 2. MEMÓRIA OPERACIONAL */}
        <section className="mb-12">
          <h2 className="text-xs font-black bg-slate-900 text-white px-4 py-1 inline-block mb-6 uppercase">
            2. Memória de Cálculo Operacional
          </h2>
          <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-sm border-t border-slate-100 pt-4">
            <div className="flex justify-between border-b border-slate-50 py-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Retirada (Gate-Out):</span>
              <span className="font-bold">{dataRetirada.split('-').reverse().join('/')}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 py-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Devolução (Gate-In):</span>
              <span className="font-bold">{dataDevolucao.split('-').reverse().join('/')}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 py-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Período de Free Time:</span>
              <span className="font-bold">{diasFreeTime} dias</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 py-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Tarifa Diária (Vigente):</span>
              <span className="font-bold">USD {parseFloat(valorDiariaUSD.replace(',', '.')).toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* 3. SUSPENSÕES LEGAIS */}
        {resultado.periodosInterrupcaoDescontados.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs font-black bg-slate-900 text-white px-4 py-1 inline-block mb-6 uppercase">
              3. Fundamentação das Suspensões (Art. 20 RN 112)
            </h2>
            <table className="w-full text-xs">
              <thead className="bg-slate-100 font-black uppercase">
                <tr>
                  <th className="py-3 px-4 text-left border border-white">Motivo da Interrupção de Prazo</th>
                  <th className="py-3 px-4 text-right border border-white">Dias Abonados</th>
                </tr>
              </thead>
              <tbody>
                {resultado.periodosInterrupcaoDescontados.map((periodo) => (
                  <tr key={`${periodo.motivo}-${periodo.dias}`} className="border-b border-slate-200">
                    <td className="py-4 px-4 font-medium text-slate-800">{periodo.motivo}</td>
                    <td className="py-4 px-4 text-right font-black text-blue-600">-{periodo.dias} dias</td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td className="py-4 px-4 font-black text-right uppercase text-slate-900">Total de Dias Excluídos do Cálculo:</td>
                  <td className="py-4 px-4 text-right font-black text-blue-700 text-base">
                    {totalAbonado} DIAS
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        <footer className="mt-20 pt-10 border-t-2 border-slate-900">
          <div className="grid grid-cols-2 gap-12">
            <div className="text-[9px] text-slate-400 leading-tight uppercase font-bold">
              Metodologia de Auditoria: Baseada na Resolução Normativa ANTAQ Nº 112/2023, que veda a cobrança de sobre-estadia em períodos onde o usuário não possua meios de efetivar a devolução por motivos alheios à sua vontade.
            </div>
            <div className="text-right border-t border-slate-900 pt-4">
              <p className="text-[10px] font-black uppercase text-slate-900">Assinatura do Sistema de Auditoria</p>
              <p className="text-[8px] text-slate-400 font-mono">HASH-VALIDATION: {idAuditoria.split('').reverse().join('').toUpperCase()}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}