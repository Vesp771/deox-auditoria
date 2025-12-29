'use client';

import { useState } from 'react';
import { auditarContainer, type ParametrosAuditoria, type ResultadoAuditoria } from '@/lib/engine';

export default function Home() {
  const [dataRetirada, setDataRetirada] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [diasFreeTime, setDiasFreeTime] = useState('');
  const [valorDiariaUSD, setValorDiariaUSD] = useState('');
  const [resultado, setResultado] = useState<ResultadoAuditoria | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleAuditar = () => {
    setErro(null);
    setResultado(null);

    // Validações básicas
    if (!dataRetirada || !dataDevolucao || !diasFreeTime || !valorDiariaUSD) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const parametros: ParametrosAuditoria = {
        dataRetirada: new Date(dataRetirada),
        dataDevolucao: new Date(dataDevolucao),
        diasFreeTime: Number(diasFreeTime),
        valorDiariaUSD: Number(valorDiariaUSD),
      };

      const resultadoAuditoria = auditarContainer(parametros);
      setResultado(resultadoAuditoria);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao processar a auditoria.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Auditoria de Containers
          </h1>
          <p className="text-slate-600">
            Sistema de cálculo de demurrage baseado na Resolução 112 da ANTAQ
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dataRetirada" className="block text-sm font-medium text-slate-700 mb-2">
                  Data de Retirada
                </label>
                <input
                  type="date"
                  id="dataRetirada"
                  value={dataRetirada}
                  onChange={(e) => setDataRetirada(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="dataDevolucao" className="block text-sm font-medium text-slate-700 mb-2">
                  Data de Devolução
                </label>
                <input
                  type="date"
                  id="dataDevolucao"
                  value={dataDevolucao}
                  onChange={(e) => setDataDevolucao(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="diasFreeTime" className="block text-sm font-medium text-slate-700 mb-2">
                  Dias de Free Time
                </label>
                <input
                  type="number"
                  id="diasFreeTime"
                  value={diasFreeTime}
                  onChange={(e) => setDiasFreeTime(e.target.value)}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="valorDiariaUSD" className="block text-sm font-medium text-slate-700 mb-2">
                  Valor da Diária (USD)
                </label>
                <input
                  type="number"
                  id="valorDiariaUSD"
                  value={valorDiariaUSD}
                  onChange={(e) => setValorDiariaUSD(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <button
              onClick={handleAuditar}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Auditar
            </button>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {erro}
              </div>
            )}
          </div>
        </div>

        {resultado && (
          <div className="space-y-4">
            {resultado.houveDiferenca && (
              <div className="bg-red-600 text-white rounded-xl shadow-2xl p-8 sm:p-12 text-center animate-pulse">
                <div className="text-6xl sm:text-8xl mb-4">⚠️</div>
                <h2 className="text-3xl sm:text-5xl font-bold mb-4">
                  ERRO NO VALOR DO ARMADOR
                </h2>
                <p className="text-xl sm:text-2xl opacity-90">
                  Há diferença entre o valor cobrado e o valor devido conforme a Resolução 112 da ANTAQ
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Resultado da Auditoria</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Total de Dias Excedentes</p>
                  <p className="text-2xl font-bold text-slate-900">{resultado.totalDiasExcedentes} dias</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Valor Devido Real</p>
                  <p className="text-2xl font-bold text-green-600">USD {resultado.valorDevidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Valor Cobrado pelo Armador</p>
                  <p className="text-2xl font-bold text-red-600">USD {resultado.valorCobradoPeloArmador.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <p className={`text-2xl font-bold ${resultado.houveDiferenca ? 'text-red-600' : 'text-green-600'}`}>
                    {resultado.houveDiferenca ? 'Com Diferença' : 'Sem Diferença'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

