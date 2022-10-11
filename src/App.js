import { useState } from 'react';

import currencies from './currencies.json';

import './styles/App.sass';

const App = () => {
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('BRL');
  const [amount, setAmount] = useState('0');
  const [result, setResult] = useState('0');

  const currenciesList = Object.keys(currencies)
    .map((key) => [key, currencies[key]])
    .sort((a, b) => a[1].localeCompare(b[1]));

  const options = currenciesList.map((currency) => {
    const [key, value] = currency;
    return <option key={key} value={key}>{value}</option>;
  });

  const handlerConvert = () => {
    if (from !== to && amount !== '0') {
      setLoading(true);
      fetch(`https://api.apilayer.com/currency_data/convert?to=${to}&from=${from}&amount=${amount}`, {
        method: 'GET',
        headers: {
          apikey: process.env.REACT_APP_API_KEY,
        }
      })
        .then(response => response.json())
        .then(data => {
          setResult(data.result);
          setLoading(false);
        })
        .catch(error => {
          console.error(error);
          setLoading(false);
        });
    } else {
      setResult(amount);
    }
  }

  const currencyFormat = (numStr, currency) => {
    const value = Number(numStr).toString();
    const formater = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    });

    if (numStr === '') return formater.format('0');
    return formater.format(value);
  }

  const handlerInputChange = (key) => {
    if (/\d/.test(key)) {
      if (amount.includes('.') && amount.slice(amount.indexOf('.')).length === 3) return;
      setAmount(Number(amount + key).toString());
    } else if ((key === ',' || key === '.') && !amount.includes('.')) {
      setAmount(amount + '.');
    } else if (key === 'Backspace') {
      setAmount(Number(amount.slice(0, amount.length - 1)).toString());
      if (!amount) setAmount('0');
    }
  }

  return (
    <main>

      <div>
        <input
          type='text'
          value={currencyFormat(amount, from)}
          onChange={(e) => e.preventDefault()}
          onKeyDown={(e) => handlerInputChange(e.key)}
          disabled={loading}
        />
        <select name='from' value={from} onChange={(e) => setFrom(e.target.value)} disabled={loading}>
          {options}
        </select>
      </div>

      <div>
        <input
          type='text'
          value={currencyFormat(result, to)}
          disabled
        />
        <select name='to' value={to} onChange={(e) => setTo(e.target.value)} disabled={loading}>
          {options}
        </select>
      </div>

      <button onClick={() => handlerConvert()} disabled={loading}>
        {loading ? 'Aguarde...' : 'Converter'}
      </button>

    </main>
  );
}

export default App;
