import _ from 'lodash'

export interface Purchase {
  ticker: string
  value: number
}

export const PURCHASE_MESSAGE = 'PURCHASE_MESSAGE'
export const DEFAULT_TICKERS = ['btc', 'eth', 'ltc', 'ada', 'xrp', 'dsh']
export const MAX_VALUE = 50

let interval: number | null = null

/**
 * Generate a random purchase event
 */
export const gen = (currencies: string[] = DEFAULT_TICKERS): Purchase => {
  return {
    ticker: _.sample(currencies) || '',
    value: _.random(MAX_VALUE, true),
  }
}

/**
 * Dispatch a given purchase
 */
export const dispatch = (purchase: Purchase): void => {
  window.postMessage(
    JSON.stringify({
      message: PURCHASE_MESSAGE,
      purchase: purchase,
    }),
    '*'
  )
}

/**
 * Add a listener to be fired on perchase messages
 * Return a function to remove the listener
 */
export const listen = (callback: (p: Purchase) => void): (() => void) => {
  const eventListener = (event: any) => {
    try {
      const json = JSON.parse(event?.data)

      if (json?.message === PURCHASE_MESSAGE) {
        callback(json?.purchase)
      }
    } catch (e) {
      console.error('could not parse event', {event, e})
    }
  }

  window.addEventListener('message', eventListener)

  return () => window.removeEventListener('message', eventListener)
}

/**
 * Start firing random puchases. Only one instance will run at a time
 */
export const start = (time: number): void => {
  if (!interval) {
    interval = window.setInterval(() => {
      if (interval) dispatch(gen())
    }, time)
  }
}

/**
 * Stop firing purchases
 */
export const stop = (): void => {
  if (interval) {
    window.clearInterval(interval)
    interval = null
  }
}
