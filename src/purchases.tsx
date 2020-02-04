import _ from 'lodash'

interface Purchase {
  ticker: string | undefined;
  value: number;
}

export const PURCHASE_MESSAGE = 'PURCHASE_MESSAGE'
export const DEFAULT_TICKERS = ['btc', 'eth', 'ltc', 'ada', 'xrp', 'dsh']
export const MAX_VALUE = 10

let interval: number | null = null

export const gen = (currencies: string[] = DEFAULT_TICKERS): Purchase => {
  return {
    ticker: _.sample(currencies),
    value: _.random(MAX_VALUE, true),
  }
}

export const dispatch = (purchase: Purchase): void => {
  window.postMessage(JSON.stringify({
    message: PURCHASE_MESSAGE,
    purchase: purchase,
  }), '*')
}

export const listen = (callback: (p: Purchase) => void): () => void => {
  const eventListener = (event: any) => {
    try {
      const json = JSON.parse(event?.data)

      if (json?.message === PURCHASE_MESSAGE) {
        callback(json?.purchase)
      }
    } catch(e) {
      console.error('could not parse event', {event, e})
    }
  }

  window.addEventListener("message", eventListener)

  return () => window.removeEventListener("message", eventListener)
}

export const start = (time: number): void => {
  if (!interval) {
    interval = window.setInterval(() => {
      dispatch(gen())
    }, time)
  }
}

export const stop = (): void => {
  if (interval) {
    window.clearInterval(interval)
    interval = null
  }
}
