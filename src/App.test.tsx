import React from 'react'
import {act, render} from '@testing-library/react'
import App, {pointToDomains, purchasesToPoint} from './App'
import * as api from './purchases'

test('logs the last purchase event on screen', done => {
  const {getByText} = render(<App delay={1000} interval={0} />)
  const purchase = api.gen()

  api.stop()
  act(() => api.dispatchPurchase(purchase))

  setTimeout(() => {
    const lastPurchaseElement = getByText(purchase.ticker + '!')
    expect(lastPurchaseElement).toBeInTheDocument()
    done()
  }, 10)
})

test('fires purchase events on load', done => {
  const listener = jest.fn()
  api.listen(listener)
  render(<App delay={0} interval={12} />)

  setTimeout(() => {
    expect(listener).toHaveBeenCalled()
    done()
  }, 20)
})

test('purchasesToPoint', () => {
  const purchases = [
    {ticker: 'btc', value: 1},
    {ticker: 'btc', value: 1},
  ]

  const data = purchasesToPoint(purchases)

  console.log('data', data)

  expect(data).toMatchObject({btc: 2})
})

test('pointToDomains', () => {
  const data = {btc: 10, eth: 5}
  const domains = pointToDomains(data)

  expect(domains).toEqual(
    expect.arrayContaining([
      expect.objectContaining({name: 'btc', domain: [0, 10]}),
    ])
  )
})
