/// <reference path="../react-vis.d.ts" />
import React, {useEffect, useState} from 'react'
import * as api from './purchases'
import {RadarChart, RadarChartPoint, RVTickFormat} from 'react-vis'
import './App.css'

interface RadarChartDomain {
  name: string;
  domain: Array<number>;
  tickFormat?: RVTickFormat;
}

interface AppProps {
  interval?: number;
  delay?: number;
}

interface LastPurchaseIndicatorProps {
  purchases: api.Purchase[];
}

interface PurchaseRadarProps {
  purchases: api.Purchase[];
}

const DEFAULT_INTERVAL = 1000
const DEFAULT_DELAY = 0


/**
 * Takes an array of purchases and returns a data instance for react-vis
 */
export const purchasesToPoint = (purchases: api.Purchase[]): RadarChartPoint => {
  const defaults: RadarChartPoint = api.DEFAULT_TICKERS.reduce(
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
export const pointToDomains = (data: RadarChartPoint): RadarChartDomain[] => {
  const max = Math.max.apply(null, Object.values(data))

  return Object.keys(data).map(name => ({name, domain: [0, max]}))
}

/**
 * Sets up purchase state and listens for new purchases, updating the state
 * as they come in
 */
const useLivePurchases = (): api.Purchase[] => {
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
 * Start and stop a stream of purchases on a given interval as en effect after a time
 */
const usePurchaseStream = (interval: number, delay: number): void => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      api.start(interval)
    }, delay)

    return () => {
      clearTimeout(timeout)
      api.stop()
    }
  }, [])
}

const App = ({interval = DEFAULT_INTERVAL, delay = DEFAULT_DELAY}: AppProps) => {
  const purchases: api.Purchase[] = useLivePurchases()
  usePurchaseStream(interval, delay)

  return (
    <div className="App">
      <LastPurchaseIndicator purchases={purchases} />
      <PurchaseRadar purchases={purchases} />
    </div>
  )
}

const LastPurchaseIndicator = ({purchases}: LastPurchaseIndicatorProps) => {
  const lastPurchase = purchases.slice(-1)[0]
  const message = lastPurchase
    ? ` ${lastPurchase.ticker}!`
    : `~`

  return <h1>{message}</h1>
}

const PurchaseRadar = ({purchases}: PurchaseRadarProps) => {
  const point: RadarChartPoint = purchasesToPoint(purchases)
  const domains: RadarChartDomain[] = pointToDomains(point)

  return (
    <div className="PurchaseRadar">
      <RadarChart data={[point]} domains={domains} height={400} width={400} />
    </div>
  )
}

export default App
