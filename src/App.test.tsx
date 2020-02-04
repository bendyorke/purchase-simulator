import React from 'react'
import {act, render} from '@testing-library/react'
import App, {dataToDomains, purchasesToData} from './App'
import * as api from './purchases'

test('logs the last purchase event on screen', done => {
  const {getByText} = render(<App delay={1000} />)
  const purchase = api.gen()

  api.stop()
  act(() => api.dispatch(purchase))

  setTimeout(() => {
    const lastPurchaseElement = getByText(purchase.ticker + '!')
    expect(lastPurchaseElement).toBeInTheDocument()
    done()
  })
})

test('fires purchase events on load', done => {
  const listener = jest.fn()
  api.listen(listener)
  render(<App delay={5} />)

  setTimeout(() => {
    expect(listener).toHaveBeenCalled()
    done()
  }, 10)
})

test('purchasesToData', () => {
  const purchases = [
    {ticker: 'btc', value: 1},
    {ticker: 'btc', value: 1},
  ]

  const data = purchasesToData(purchases)

  console.log('data', data)

  expect(data).toMatchObject({btc: 2})
})

test('dataToDomains', () => {
  const data = {btc: 10, eth: 5}
  const domains = dataToDomains(data)

  expect(domains).toEqual(
    expect.arrayContaining([
      expect.objectContaining({name: 'btc', domain: [0, 10]}),
    ])
  )
})

test.skip('graphs purchase events', () => {})
