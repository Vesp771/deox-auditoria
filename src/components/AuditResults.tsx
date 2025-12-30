'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { FileText, AlertTriangle, CheckCircle2, ShieldCheck, TrendingDown } from 'lucide-react';
// Importação relativa para forçar o TypeScript a encontrar o arquivo
import { type ResultadoAuditoria } from '../lib/engine';
// ADICIONE ISTO AQUI, DENTRO DO SEU ARQUIVO AuditResults.tsx:
const formatUSD = (valor: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor);



interface AuditResultsProps {
  resultado: ResultadoAuditoria;
  valorEconomia: string; 
  onGerarRelatorio: () => void;
  valorDiariaOriginal: number;
}

export default function AuditResults({ 
  resultado, 
  valorEconomia, 
  onGerarRelatorio, 
  valorDiariaOriginal 
}: AuditResultsProps) {
  
  // SOLUÇÃO DEFINITIVA PARA HYDRATION MISMATCH
  const [mounted, setMounted] = useState(false);
  useEffect(() => { 
    setMounted(true); 
  }, []);

  const temDivergencia = resultado.valorEconomizado > 0;

  // Cálculo de dias brutos baseado no que o armador cobrou de fato
  const diasCobrancaArmador = useMemo(() => {
    if (!valorDiariaOriginal || valorDiariaOriginal <= 0) return 0;
    return Math.round(resultado.valorCobradoPeloArmador / valorDiariaOriginal);
  }, [resultado.valorCobradoPeloArmador, valorDiariaOriginal]);

  // Soma total de dias suspensos pela ANTAQ
  const totalAbonado = useMemo(() => {
    return resultado.periodosInterrupcaoDescontados.reduce((acc, p) => acc + p.dias, 0);
  }, [resultado.periodosInterrupcaoDescontados]);

  // Enquanto não monta no cliente, evita renderizar moedas e datas para não bugar o React
  if (!mounted) {
    return <div className="min-h-[400px] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Carregando Auditoria...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* SEÇÃO DE ALERTA: SÓ APARECE SE O ARMADOR ESTIVER SENDO OPORTUNISTA */}
      {temDivergencia && (
        <div role="alert" className="bg-red-600 text-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <AlertTriangle size={160} />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
            </div>
            <h2 className="text-2xl sm:text-5xl font-black mb-4 tracking-tighter uppercase leading-tight">
              Cobrança Indevida Detectada
            </h2>
            <p className="text-lg sm:text-2xl font-medium opacity-90 max-w-3xl mx-auto leading-relaxed">
              O valor exigido diverge do cálculo regulatório da <span className="font-bold underline decoration-white/50 underline-offset-4">Resolução 112 da ANTAQ</span>.
            </p>
          </div>
        </div>
      )}

      {/* QUADRO FINANCEIRO PRINCIPAL */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
            <div className="w-2 h-6 bg-slate-900 rounded-full" />
            Resumo da Auditoria Técnica
          </h3>
          <button
            onClick={onGerarRelatorio}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-black rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
          >
            <FileText className="w-4 h-4" />
            PDF Relatório
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Dias Cobrados (Brutos)</p>
            <p className="text-3xl font-black text-slate-900 tabular-nums">
              {diasCobrancaArmador} <span className="text-sm text-slate-400 font-bold">d</span>
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-blue-100 shadow-sm">
            <p className="text-[10px] font-bold text-blue-600 uppercase mb-3">Dias Suspensos (Direito)</p>
            <p className="text-3xl font-black text-blue-600 tabular-nums">
              {totalAbonado} <span className="text-sm opacity-60 font-bold">d</span>
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-red-400 uppercase mb-3">Valor do Armador</p>
            <p className="text-3xl font-black text-red-500 tabular-nums">
              {formatUSD(resultado.valorCobradoPeloArmador)}
            </p>
          </div>

          <div className={`p-6 rounded-2xl border-2 transition-all ${temDivergencia ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
            <p className="text-[10px] font-bold opacity-60 uppercase mb-3">Conformidade Legal</p>
            <div className="flex items-center gap-2">
              {temDivergencia ? 
                <AlertTriangle className="w-5 h-5" aria-label="Divergência" /> : 
                <CheckCircle2 className="w-5 h-5" aria-label="Conforme" />
              }
              <span className="text-lg font-black uppercase tracking-tighter">
                {temDivergencia ? 'Divergente' : 'Conforme'}
              </span>
            </div>
          </div>
        </div>

        {/* BANNER DE ECONOMIA: O "PULO DO GATO" COMERCIAL */}
        {temDivergencia && (
          <div className="mt-8 p-6 bg-blue-600 rounded-3xl text-white flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 text-center lg:text-left flex-col lg:flex-row">
              <div className="p-3 bg-white/10 rounded-2xl">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Potencial de Recuperação (Res. 112)</p>
                <p className="text-3xl sm:text-4xl font-black tabular-nums">{valorEconomia}</p>
              </div>
            </div>
            <div className="px-6 py-3 bg-white/20 rounded-xl border border-white/20 text-[10px] font-bold uppercase tracking-[0.15em] text-center backdrop-blur-sm">
              Contestação Recomendada
            </div>
          </div>
        )}
      </div>

      {/* PROVAS TÉCNICAS: LISTAGEM DE ABONOS */}
      {resultado.periodosInterrupcaoDescontados.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Fundamentação para Abono</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultado.periodosInterrupcaoDescontados.map((periodo, idx) => (
              <div 
                key={`${periodo.motivo}-${idx}`} 
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-300 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-full uppercase tracking-tighter italic">RN 112 ANTAQ</span>
                    <span className="text-xl font-black text-blue-700">-{periodo.dias}d</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Motivo Legal</p>
                    <p className="text-sm font-bold text-slate-800 leading-snug">{periodo.motivo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}