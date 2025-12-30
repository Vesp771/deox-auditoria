// Certifique-se de que o nome do arquivo é utils.ts (minúsculo)
export function formatUSD(valor: number): string {
    if (typeof valor !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(valor);
  }
  
  // Caso você use essa função em algum lugar:
  export function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
  }
  