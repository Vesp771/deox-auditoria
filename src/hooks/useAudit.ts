'use client';

import { useReducer, useEffect, useCallback, useMemo } from 'react';
// Importação Relativa para calar o TypeScript se o @/ falhar
import { auditarContainer, type ParametrosAuditoria, type ResultadoAuditoria } from '../lib/engine';

export interface PeriodoInterrupcaoForm { dataInicio: string; dataFim: string; motivo: string; }
export type EditableFields = 'numeroContainer' | 'dataRetirada' | 'dataDevolucao' | 'diasFreeTime' | 'valorDiariaUSD';

type AuditAction = 
  | { type: 'UPDATE_FIELD'; field: EditableFields; value: string }
  | { type: 'HYDRATE_CACHE'; data: any }
  | { type: 'FINISH_LOADING' }
  | { type: 'TOGGLE_INTERRUPCAO' }
  | { type: 'ADD_INTERRUPCAO' }
  | { type: 'REMOVE_INTERRUPCAO'; index: number }
  | { type: 'SET_RESULTADO'; resultado: ResultadoAuditoria }
  | { type: 'SET_ERRO'; erro: string }
  | { type: 'UPDATE_NOVA_INTERRUPCAO'; value: PeriodoInterrupcaoForm };

export const OPCOES_MOTIVO = [
  'Greve (Rec. Federal / Portuários)', 
  'Condições Climáticas (Chuva/Vento)', 
  'Paralisação de Terminal (Operacional)', 
  'Falta de Agendamento (Janela)', 
  'Porto Fechado (Ressaca/Neblina)', 
  'Outros (Especificar em nota)'
] as const;

const STORAGE_KEY = 'deox_audit_v2.2';

interface AuditState {
  idAuditoria: string;
  numeroContainer: string; 
  dataRetirada: string; 
  dataDevolucao: string; 
  diasFreeTime: string; 
  valorDiariaUSD: string;
  periodosInterrupcao: PeriodoInterrupcaoForm[]; 
  novaInterrupcao: PeriodoInterrupcaoForm;
  mostrarInterrupcao: boolean; 
  resultado: ResultadoAuditoria | null; 
  erro: string | null; 
  isLoaded: boolean;
}

const utils = {
  // GARANTIA: O que o usuário vê é o que a engine calcula.
  converterData: (s: string) => {
    if (!s) return new Date();
    const [y, m, d] = s.split('-').map(Number);
    // Cria o objeto Date no contexto LOCAL do ambiente de execução.
    // Essencial para bater com o input type="date"
    return new Date(y, m - 1, d, 0, 0, 0);
  },
  mapearParaParametros: (state: AuditState): ParametrosAuditoria => ({
    numeroContainer: state.numeroContainer,
    dataRetirada: utils.converterData(state.dataRetirada),
    dataDevolucao: utils.converterData(state.dataDevolucao),
    diasFreeTime: parseInt(state.diasFreeTime, 10) || 0,
    valorDiariaUSD: parseFloat(state.valorDiariaUSD.replace(',', '.')) || 0,
    periodosInterrupcao: state.periodosInterrupcao.map(p => ({
      dataInicio: utils.converterData(p.dataInicio), 
      dataFim: utils.converterData(p.dataFim), 
      motivo: p.motivo
    }))
  })
};

function auditReducer(state: AuditState, action: AuditAction): AuditState {
  switch (action.type) {
    case 'UPDATE_FIELD': 
      const val = action.field === 'numeroContainer' ? action.value.toUpperCase().replace(/\s/g, '') : action.value;
      return { ...state, [action.field]: val, erro: null, resultado: null };
    case 'HYDRATE_CACHE': return { ...state, ...action.data, isLoaded: true };
    case 'FINISH_LOADING': return { ...state, isLoaded: true };
    case 'TOGGLE_INTERRUPCAO': return { ...state, mostrarInterrupcao: !state.mostrarInterrupcao, erro: null };
    case 'ADD_INTERRUPCAO': 
      if (!state.novaInterrupcao.dataInicio) return { ...state, erro: "Selecione uma data para o abono." };
      return { 
        ...state, 
        periodosInterrupcao: [...state.periodosInterrupcao, state.novaInterrupcao], 
        novaInterrupcao: { dataInicio: '', dataFim: '', motivo: '' }, 
        resultado: null, 
        mostrarInterrupcao: false 
      };
    case 'REMOVE_INTERRUPCAO': return { ...state, periodosInterrupcao: state.periodosInterrupcao.filter((_, i) => i !== action.index), resultado: null };
    case 'SET_RESULTADO': return { ...state, resultado: action.resultado, erro: null };
    case 'SET_ERRO': return { ...state, erro: action.erro, resultado: null };
    case 'UPDATE_NOVA_INTERRUPCAO': return { ...state, novaInterrupcao: action.value };
    default: return state;
  }
}

export function useAudit() {
  const [state, dispatch] = useReducer(auditReducer, {
    idAuditoria: `AUD-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
    numeroContainer: '', dataRetirada: '', dataDevolucao: '', diasFreeTime: '', valorDiariaUSD: '',
    periodosInterrupcao: [], novaInterrupcao: { dataInicio: '', dataFim: '', motivo: '' },
    mostrarInterrupcao: false, resultado: null, erro: null, isLoaded: false
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p._v === '2.2') dispatch({ type: 'HYDRATE_CACHE', data: p });
      } catch (e) {}
    }
    dispatch({ type: 'FINISH_LOADING' });
  }, []);

  useEffect(() => {
    if (state.isLoaded) localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, _v: '2.2' }));
  }, [state]);

  const handleAuditar = useCallback(() => {
    if (!state.dataRetirada || !state.dataDevolucao) {
      dispatch({ type: 'SET_ERRO', erro: "Preencha as datas de retirada e devolução." });
      return;
    }
    try { 
      const res = auditarContainer(utils.mapearParaParametros(state));
      dispatch({ type: 'SET_RESULTADO', resultado: res }); 
    }
    catch (e: any) { dispatch({ type: 'SET_ERRO', erro: e.message }); }
  }, [state]);

  const valorEconomiaFormatado = useMemo(() => {
    const v = state.resultado ? (state.resultado.valorCobradoPeloArmador - state.resultado.valorDevidoReal) : 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(v);
  }, [state.resultado]);

  return {
    ...state,
    isDirty: !!(state.numeroContainer && state.dataRetirada && state.dataDevolucao) && state.resultado === null,
    setField: (field: EditableFields, value: string) => dispatch({ type: 'UPDATE_FIELD', field, value }),
    setNovaInterrupcao: (value: PeriodoInterrupcaoForm) => dispatch({ type: 'UPDATE_NOVA_INTERRUPCAO', value }),
    handleAdicionarInterrupcao: () => dispatch({ type: 'ADD_INTERRUPCAO' }),
    handleRemoverInterrupcao: (index: number) => dispatch({ type: 'REMOVE_INTERRUPCAO', index }),
    toggleMostrarInterrupcao: () => dispatch({ type: 'TOGGLE_INTERRUPCAO' }),
    handleAuditar,
    valorEconomia: valorEconomiaFormatado
  };
}