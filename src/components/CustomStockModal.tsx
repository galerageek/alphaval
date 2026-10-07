import React, { useState } from 'react';
import { StockEvaluation } from '../types/stock';
import { evaluateStock } from '../services/financialEngine';
import { X, PlusCircle, Calculator } from 'lucide-react';

interface CustomStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStock: (newStock: StockEvaluation) => void;
}

export const CustomStockModal: React.FC<CustomStockModalProps> = ({
  isOpen,
  onClose,
  onAddStock,
}) => {
  const [ticker, setTicker] = useState('EGIE3');
  const [name, setName] = useState('Engie Brasil Energia');
  const [sector, setSector] = useState('Energia Elétrica');
  const [country, setCountry] = useState<'BR' | 'US'>('BR');
  const [currentPrice, setCurrentPrice] = useState('42.50');
  const [lpa, setLpa] = useState('4.15');
  const [vpa, setVpa] = useState('18.60');
  const [dividend, setDividend] = useState('3.10');
  const [peRatio, setPeRatio] = useState('10.2');
  const [roe, setRoe] = useState('22.3');
  const [netDebtEbitda, setNetDebtEbitda] = useState('2.1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(currentPrice) || 10;
    const lpaNum = parseFloat(lpa) || 1;
    const vpaNum = parseFloat(vpa) || 5;
    const dividendNum = parseFloat(dividend) || 0;
    const peNum = parseFloat(peRatio) || 10;
    const roeNum = parseFloat(roe) || 15;
    const debtNum = parseFloat(netDebtEbitda) || 1.5;

    const dyNum = Number(((dividendNum / priceNum) * 100).toFixed(1));
    const pbNum = Number((priceNum / vpaNum).toFixed(2));

    const newStock = evaluateStock(
      ticker.toUpperCase().trim(),
      name.trim(),
      sector.trim(),
      country,
      priceNum,
      {
        peRatio: peNum,
        pbRatio: pbNum,
        dividendYield: dyNum,
        roe: roeNum,
        roic: Number((roeNum * 0.8).toFixed(1)),
        netMargin: 18.0,
        ebitMargin: 28.0,
        evEbitda: 7.5,
        netDebtEbitda: debtNum,
        cagrProfits5y: 8.5,
        cagrRevenues5y: 9.0,
        lpa: lpaNum,
        vpa: vpaNum,
        projectedAnnualDividend: dividendNum,
        payoutRatio: 65.0,
      }
    );

    onAddStock(newStock);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Avaliar Nova Ação Customizada
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-medium">Código / Ticker:</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="ex: EGIE3"
                required
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono focus:border-emerald-500/50 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Mercado:</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as 'BR' | 'US')}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 outline-none"
              >
                <option value="BR">B3 Brasil (R$)</option>
                <option value="US">EUA / Global (US$)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-medium">Nome da Empresa:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Engie Brasil"
                required
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Setor de Atuação:</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="ex: Energia"
                required
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 font-medium">Cotação Atual ({country === 'BR' ? 'R$' : 'US$'}):</label>
              <input
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                required
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">LPA (Lucro/Ação):</label>
              <input
                type="number"
                step="0.01"
                value={lpa}
                onChange={(e) => setLpa(e.target.value)}
                required
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">VPA (Patrim./Ação):</label>
              <input
                type="number"
                step="0.01"
                value={vpa}
                onChange={(e) => setVpa(e.target.value)}
                required
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 font-medium">Dividendo Anual (R$):</label>
              <input
                type="number"
                step="0.01"
                value={dividend}
                onChange={(e) => setDividend(e.target.value)}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">ROE (%):</label>
              <input
                type="number"
                step="0.1"
                value={roe}
                onChange={(e) => setRoe(e.target.value)}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Dívida Líq./EBITDA:</label>
              <input
                type="number"
                step="0.1"
                value={netDebtEbitda}
                onChange={(e) => setNetDebtEbitda(e.target.value)}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-slate-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              Calcular & Avaliar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
