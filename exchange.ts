function twoNumbersDiv(a: number, b: number): any {
  const income = {
    a,
    b,
  };
  if (isNaN(a) || isNaN(b)) {
    throw new Error('numbers type should be a number');
  }
  const counter = {
    first: 0,
    second: 0,
  };
  while (a % 1 !== 0) {
    a = a * 10;
    counter.first++;
  }
  while (b % 1 !== 0) {
    b = b * 10;
    counter.second++;
  }
  while (counter.second === counter.second) {
    if (counter.second === counter.first) {
      break;
    }
    if (counter.first < counter.second) {
      a = a * 10;
      counter.first++;
    }
    if (counter.first > counter.second) {
      b = b * 10;
      counter.second++;
    }
  }
  return {
    income,
    outcome: {
      firstNumber: a,
      secondNumber: b,
    },
    counter,
    div: a - b,
  };
}

function getSL({ bank, stopPercent, lotPrice, quotation }) {
  console.log('bank', bank);
  console.log('stopPercent', stopPercent);
  console.log('lotPrice', lotPrice);
  console.log('quotation', quotation);

  const maxPriceChange = bank * stopPercent * 0.01;
  const currentQuotationPrice = lotPrice * quotation;

  const stopLossPrice = currentQuotationPrice - maxPriceChange;
  const stopLossQuotation = stopLossPrice / lotPrice;

  const takeProfitPrice = currentQuotationPrice + maxPriceChange * 3;
  const takeProfitQuotation = takeProfitPrice / lotPrice;

  console.log('maxPriceChange', maxPriceChange);
  console.log('currentQuotationPrice', currentQuotationPrice);
  console.log('stopLossPrice', stopLossPrice);
  console.log('takeProfitPrice', takeProfitPrice);
  console.log('stopLossQuotation', stopLossQuotation);
  console.log('takeProfitQuotation', takeProfitQuotation);
}

function fo({ sum, percentOfSum, lotPrice, quatio }) {}
