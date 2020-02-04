/// <reference path="../react-vis.d.ts" />
import React, {useEffect, useState} from 'react'
import * as api from './purchases'
import {RadarChart} from 'react-vis'
import './App.css'

const DEFAULT_DELAY = 500

/**
 * Takes an array of purchases and returns a data instance for react-vis
 */
export const purchasesToData = (purchases: api.Purchase[]) => {
  const defaults: {[key: string]: number} = api.DEFAULT_TICKERS.reduce(
    (memo, name) => ({...memo, [name]: 0}),
    {}
  )

  return purchases.reduce((memo, {ticker, value}) => {
    memo[ticker] = memo[ticker] + value
    return memo
  }, defaults)
}

/**
 * Takes a data instance for react-vis and returns a domain array for react-vis
 */
export const dataToDomains = (data: {[key: string]: number}) => {
  const max = Math.max.apply(null, Object.values(data))

  return Object.keys(data).map(name => ({name, domain: [0, max]}))
}

/**
 * Sets up purchase state and listens for new purchases, updating the state
 * as they come in
 */
const useLivePurchases = () => {
  const defaultValue: api.Purchase[] = []
  const [purchases, setPurchases] = useState(defaultValue)

  useEffect(() => {
    return api.listen(purchase => {
      setPurchases([...purchases, purchase])
    })
  })

  return purchases
}

/**
 * Start and stop a stream of purchases on a given interval as en effect
 */
const usePurchaseStream = (delay: number) => {
  useEffect(() => {
    api.start(delay)

    return api.stop
  })
}

const App = ({delay = DEFAULT_DELAY}: {delay?: number}) => {
  const purchases: api.Purchase[] = useLivePurchases()
  usePurchaseStream(delay)

  return (
    <div className="App">
      <LastPurchaseIndicator purchases={purchases} />
      <PurchaseRadar purchases={purchases} />
    </div>
  )
}

const LastPurchaseIndicator = ({purchases}: {purchases: api.Purchase[]}) => {
  const lastPurchase = purchases.slice(-1)[0] || {}

  return <h1>{lastPurchase.ticker}!</h1>
}

const PurchaseRadar = ({purchases}: {purchases: api.Purchase[]}) => {
  const data = purchasesToData(purchases)
  const domains = dataToDomains(data)

  return (
    <div className="PurchaseRadar">
      <RadarChart data={[data]} domains={domains} height={400} width={400} />
    </div>
  )
}

export default App
