'use client';

import { useAudit } from '@/hooks/useAudit';
import AuditForm from '@/components/AuditForm';
import AuditResults from '@/components/AuditResults';
import ReportPDF from '@/components/ReportPDF';
import { useMemo } from 'react';
import { Calculator } from 'lucide-react';

export const AuditoriaContainer = () => {
  const {
    numeroContainer, dataRetirada, dataDevolucao, diasFreeTime, valorDiariaUSD,
    periodosInterrupcao, novaInterrupcao, mostrarInterrupcao, resultado,
    erro, isDirty, valorEconomia, idAuditoria,
    setField, setNovaInterrupcao, handleAdicionarInterrupcao, 
    handleRemoverInterrupcao, toggleMostrarInterrupcao, handleAuditar
  } = useAudit();

  // 1. Cálculo de abono (Seguro contra null)
  const totalAbonado = useMemo(() => 
    resultado?.periodosInterrupcaoDescontados.reduce((acc, p) => acc + p.dias, 0) || 0
  , [resultado]);

  // 2. Parsing da diária (Crucial para o AuditResults)
  const diariaNumerica = useMemo(() => {
    if (!valorDiariaUSD) return 0;
    const cleanValue = typeof valorDiariaUSD === 'string' 
      ? valorDiariaUSD.replace(/\./g, '').replace(',', '.') 
      : valorDiariaUSD;
    return parseFloat(cleanValue) || 0;
  }, [valorDiariaUSD]);

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-10 bg-slate-50 min-h-screen print:bg-white print:p-0">
      
      <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
             <Calculator className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Auditoria Deox
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">High-End Audit System</p>
          </div>
        </div>

        {resultado && !isDirty && (
          <div className="p-6 rounded-3xl bg-white border-2 border-green-500 shadow-xl shadow-green-50 animate-in zoom-in duration-500">
            <span className="text-[10px] font-black text-green-600 uppercase block tracking-widest">Economia Detectada</span>
            <span className="text-5xl font-black text-green-600 tabular-nums">{valorEconomia}</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LADO ESQUERDO: FORMULÁRIO */}
        <div className="lg:col-span-5 print:hidden">
          <AuditForm 
            numeroContainer={numeroContainer}
            dataRetirada={dataRetirada}
            dataDevolucao={dataDevolucao}
            diasFreeTime={diasFreeTime}
            valorDiariaUSD={valorDiariaUSD}
            onFieldChange={setField}
            periodosInterrupcao={periodosInterrupcao}
            mostrarInterrupcao={mostrarInterrupcao}
            novaInterrupcao={novaInterrupcao}
            setNovaInterrupcao={setNovaInterrupcao}
            onAdicionarInterrupcao={handleAdicionarInterrupcao}
            onRemoverInterrupcao={handleRemoverInterrupcao}
            onToggleMostrarInterrupcao={toggleMostrarInterrupcao}
            onAuditar={handleAuditar}
            isDirty={isDirty}
            erro={erro}
          />
        </div>

        {/* LADO DIREITO: RESULTADOS OU PLACEHOLDER */}
        <div className="lg:col-span-7 space-y-8">
          {resultado ? (
            <div className="animate-in fade-in slide-in-from-right-6 duration-700">
              <div className="print:hidden">
                {/* AQUI MORRE O ERRO: Passando props diretamente dentro do check de null */}
                <AuditResults 
                  resultado={resultado} 
                  valorEconomia={valorEconomia}
                  valorDiariaOriginal={diariaNumerica}
                  onGerarRelatorio={() => window.print()}
                /> 
              </div>

              <ReportPDF 
                resultado={resultado}
                numeroContainer={numeroContainer}
                dataRetirada={dataRetirada}
                dataDevolucao={dataDevolucao}
                diasFreeTime={diasFreeTime}
                valorDiariaUSD={valorDiariaUSD}
                idAuditoria={idAuditoria}
                economia={resultado.valorEconomizado}
                totalAbonado={totalAbonado}
              />
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest max-w-[200px]">
                Preencha os dados ao lado para iniciar a auditoria
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};