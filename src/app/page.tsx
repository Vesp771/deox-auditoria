'use client';

import { useAudit } from '@/hooks/useAudit';
import AuditForm from '@/components/AuditForm';
import AuditResults from '@/components/AuditResults';
import ReportPDF from '@/components/ReportPDF'; // ✅ IMPORTANTE: Certifique-se que o arquivo existe
import { useMemo } from 'react';

export default function Home() {
  const {
    numeroContainer, dataRetirada, dataDevolucao, diasFreeTime, valorDiariaUSD,
    periodosInterrupcao, mostrarInterrupcao, novaInterrupcao, resultado,
    erro, isDirty, valorEconomia, idAuditoria, // ✅ idAuditoria resgatado do hook
    setField, setNovaInterrupcao, handleAdicionarInterrupcao,
    handleRemoverInterrupcao, toggleMostrarInterrupcao, handleAuditar,
  } = useAudit();

  // 1. Parsing da diária para o componente de resultados
  const diariaNumerica = useMemo(() => {
    if (!valorDiariaUSD) return 0;
    const cleanValue = typeof valorDiariaUSD === 'string' 
      ? valorDiariaUSD.replace(/\./g, '').replace(',', '.') 
      : valorDiariaUSD;
    return parseFloat(cleanValue) || 0;
  }, [valorDiariaUSD]);

  // 2. Cálculo do total de dias abonados para o relatório
  const totalAbonado = useMemo(() => 
    resultado?.periodosInterrupcaoDescontados.reduce((acc, p) => acc + p.dias, 0) || 0
  , [resultado]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto print:max-w-none">
        
        <div className="text-center mb-8 print:hidden">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
            Auditoria de Containers
          </h1>
          <p className="text-slate-600 font-medium">
            Sistema de cálculo de demurrage baseado na Resolução 112 da ANTAQ (2025)
          </p>
        </div>

        <div className="print:hidden">
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

        {resultado && !isDirty && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* VISUAL NA TELA */}
            <div className="print:hidden">
              <AuditResults
                resultado={resultado}
                valorEconomia={valorEconomia}
                valorDiariaOriginal={diariaNumerica}
                onGerarRelatorio={() => window.print()}
              />
            </div>

            {/* RELATÓRIO OFICIAL (SÓ APARECE NA IMPRESSÃO) */}
            <div className="hidden print:block">
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
          </div>
        )}
      </div>
    </div>
  );
}