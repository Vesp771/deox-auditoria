'use client';

import React from 'react';
import { OPCOES_MOTIVO, type PeriodoInterrupcaoForm, type EditableFields } from '@/hooks/useAudit';
import { Plus, Calendar, Trash2, AlertCircle, CheckCircle2, Calculator } from 'lucide-react';

interface AuditFormProps {
  numeroContainer: string;
  dataRetirada: string;
  dataDevolucao: string;
  diasFreeTime: string;
  valorDiariaUSD: string;
  onFieldChange: (field: EditableFields, value: string) => void;
  periodosInterrupcao: PeriodoInterrupcaoForm[];
  mostrarInterrupcao: boolean;
  novaInterrupcao: PeriodoInterrupcaoForm;
  setNovaInterrupcao: (valor: PeriodoInterrupcaoForm) => void; 
  onAdicionarInterrupcao: () => void;
  onRemoverInterrupcao: (index: number) => void;
  onToggleMostrarInterrupcao: () => void;
  onAuditar: () => void;
  isDirty: boolean;
  erro: string | null;
}

export default function AuditForm(props: AuditFormProps) {
  const {
    numeroContainer, dataRetirada, dataDevolucao, diasFreeTime, valorDiariaUSD,
    onFieldChange, periodosInterrupcao, mostrarInterrupcao, novaInterrupcao,
    setNovaInterrupcao, onAdicionarInterrupcao, onRemoverInterrupcao,
    onToggleMostrarInterrupcao, onAuditar, isDirty, erro
  } = props;

  // Helper para atualizar campos da nova interrupção
  const updateNovaInterrupcao = (updates: Partial<PeriodoInterrupcaoForm>) => {
    setNovaInterrupcao({ ...novaInterrupcao, ...updates });
  };

  // VALIDAÇÕES LÓGICAS
  const isNovaInterrupcaoValida = 
    novaInterrupcao.motivo !== '' && 
    novaInterrupcao.dataInicio !== '' && 
    novaInterrupcao.dataFim !== '' &&
    new Date(novaInterrupcao.dataFim) >= new Date(novaInterrupcao.dataInicio);

  const isFormValido = 
    numeroContainer.length >= 7 && 
    dataRetirada !== '' && 
    dataDevolucao !== '' &&
    new Date(dataDevolucao) >= new Date(dataRetirada) &&
    diasFreeTime !== '' &&
    valorDiariaUSD !== '';

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-slate-100">
      <div className="space-y-8">
        
        {/* 1. DADOS BÁSICOS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-blue-600 rounded-full" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Identificação do Ativo</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="relative">
              <input
                type="text"
                value={numeroContainer}
                onChange={(e) => onFieldChange('numeroContainer', e.target.value.toUpperCase())}
                placeholder="NÚMERO DO CONTAINER (EX: SUDU1234567)"
                className="w-full pl-0 pr-12 py-4 border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all font-black text-xl uppercase placeholder:text-slate-300"
              />
              {numeroContainer.length >= 11 && (
                <CheckCircle2 className="absolute right-0 top-5 text-emerald-500 w-6 h-6 animate-in zoom-in" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Retirada (Gate-out)</label>
              <input
                type="date"
                value={dataRetirada}
                onChange={(e) => onFieldChange('dataRetirada', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Devolução (Gate-in)</label>
              <input
                type="date"
                value={dataDevolucao}
                onChange={(e) => onFieldChange('dataDevolucao', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Free Time (Dias)</label>
              <input
                type="number"
                value={diasFreeTime}
                onChange={(e) => onFieldChange('diasFreeTime', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diária (USD)</label>
              <input
                type="text"
                value={valorDiariaUSD}
                onChange={(e) => onFieldChange('valorDiariaUSD', e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
              />
            </div>
          </div>
        </section>

        {/* 2. INTERRUPÇÕES ANTAQ */}
        <section className="pt-6 border-t border-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-amber-500 rounded-full" />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Suspensões Art. 20 (RN 112)</h2>
            </div>
            <button
              type="button"
              onClick={onToggleMostrarInterrupcao}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${
                mostrarInterrupcao ? 'bg-slate-100 text-slate-500' : 'bg-amber-500 text-white shadow-lg shadow-amber-100'
              }`}
            >
              {mostrarInterrupcao ? 'Fechar' : <><Plus className="w-3 h-3" /> Adicionar</>}
            </button>
          </div>

          {mostrarInterrupcao && (
            <div className="bg-slate-900 rounded-3xl p-6 mb-8 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-4">
                <select
                  value={novaInterrupcao.motivo}
                  onChange={(e) => updateNovaInterrupcao({ motivo: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border-none rounded-xl text-white font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Selecione a fundamentação...</option>
                  {OPCOES_MOTIVO.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={novaInterrupcao.dataInicio}
                    onChange={(e) => updateNovaInterrupcao({ dataInicio: e.target.value })}
                    className="bg-slate-800 border-none rounded-xl p-3 text-white text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <input
                    type="date"
                    value={novaInterrupcao.dataFim}
                    onChange={(e) => updateNovaInterrupcao({ dataFim: e.target.value })}
                    className="bg-slate-800 border-none rounded-xl p-3 text-white text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={!isNovaInterrupcaoValida}
                  onClick={onAdicionarInterrupcao}
                  className="w-full bg-amber-500 disabled:bg-slate-700 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95"
                >
                  Confirmar Abono
                </button>
              </div>
            </div>
          )}

          {/* LISTA DE ABONOS */}
          <div className="grid grid-cols-1 gap-3">
            {periodosInterrupcao.map((p, idx) => (
              <div key={`${p.dataInicio}-${idx}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{p.motivo}</p>
                    <p className="text-sm font-bold text-slate-700">{p.dataInicio} ➔ {p.dataFim}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => onRemoverInterrupcao(idx)} 
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. AÇÃO FINAL */}
        <div className="pt-6">
          {erro && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 mb-6 animate-in fade-in zoom-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-bold">{erro}</span>
            </div>
          )}
          
          <button
            type="button"
            onClick={onAuditar}
            disabled={!isFormValido || !isDirty}
            className="w-full bg-blue-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black py-6 rounded-3xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Calculator className="w-4 h-4" />
            {isFormValido ? 'Calcular Auditoria' : 'Preencha os dados obrigatórios'}
          </button>
        </div>

      </div>
    </div>
  );
}
