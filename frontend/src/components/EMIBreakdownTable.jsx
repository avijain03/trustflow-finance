// Purpose: EMIBreakdownTable — renders EMI calculation results in a glassmorphism card
import React from 'react';

export default function EMIBreakdownTable({ principal, interestRate, tenure, monthlyEMI,
  principalFormatted, monthlyEMIFormatted, totalInterestFormatted, totalPayableFormatted }) {

  const rows = [
    { label: 'Loan Amount',    value: principalFormatted      || `₹${Number(principal).toLocaleString('en-IN')}` },
    { label: 'Interest Rate',  value: `${interestRate}% p.a.`, isRate: true },
    { label: 'Tenure',         value: `${tenure} months` },
    { label: 'Monthly EMI',    value: monthlyEMIFormatted      || `₹${Number(monthlyEMI).toLocaleString('en-IN')}`, highlight: true },
    { label: 'Total Interest', value: totalInterestFormatted  || '' },
    { label: 'Total Payable',  value: totalPayableFormatted   || '' },
  ].filter(r => r.value);

  return (
    <div className="glass" style={{ padding: '1rem', marginTop: '0.625rem', overflowX: 'auto' }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        📊 EMI Breakdown
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map(({ label, value, highlight }) => (
            <tr key={label} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '0.5rem 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', width: '55%' }}>
                {label}
              </td>
              <td style={{
                padding: '0.5rem 0',
                fontFamily: 'var(--font-mono)',
                fontSize: highlight ? 'var(--text-lg)' : 'var(--text-sm)',
                fontWeight: highlight ? 700 : 500,
                color: highlight ? 'var(--color-accent-emerald)' : 'var(--color-text-primary)',
                textAlign: 'right',
              }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
