import * as purchases from './purchases'

test('gen creates a random purchase event from a list of currencies', () => {
  const purchase = purchases.gen(['btc'])

  expect(purchase.ticker).toBe('btc')
  expect(purchase.value).toBeLessThanOrEqual(purchases.MAX_VALUE)
})

test('gen falls back to default currencies', () => {
  const purchase = purchases.gen()

  expect(purchases.DEFAULT_TICKERS).toContain(purchase.ticker)
  expect(purchase.value).toBeLessThanOrEqual(purchases.MAX_VALUE)
})

test('dispatch dispatches a purchase event', done => {
  const purchase = purchases.gen()

  const listener = event => {
    const json = JSON.parse(event.data)
    expect(json.message).toBe(purchases.PURCHASE_MESSAGE)
    expect(json.purchase).toMatchObject(purchase)
  }

  window.addEventListener('message', listener)

  purchases.dispatch(purchase)

  setTimeout(() => {
    window.removeEventListener('message', listener)
    done()
  }, 0)
})

test('listen returns a function to stop listening', () => {
  const listener = jest.fn()
  const stop = purchases.listen(listener)

  stop()
  purchases.dispatch(purchases.gen())

  expect(listener).not.toHaveBeenCalled()
})

test('listen listens for purchase events', done => {
  const listener = jest.fn()
  const stop = purchases.listen(listener)

  setTimeout(() => {
    expect(listener).toHaveBeenCalled()
    stop()
    done()
  }, 0)
})

test('stop stops dispatching purchase events', done => {
  const listener = jest.fn()

  purchases.start(1000)
  purchases.stop()

  const stop = purchases.listen(listener)

  setTimeout(() => {
    expect(listener).not.toHaveBeenCalled()
    stop()
    done()
  }, 0)
})

test('start starts dispatching purchase events', done => {
  const listener = jest.fn()
  const stop = purchases.listen(listener)

  purchases.start(1)

  setTimeout(() => {
    expect(listener).toHaveBeenCalled()
    purchases.stop()
    stop()
    done()
  }, 10)
})
