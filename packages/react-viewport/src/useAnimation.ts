import { useEffect, useRef } from 'react'

export const useAnimation = (update: (dt: number) => void) => {
  const requestRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const previousTimeRef = useRef(0)

  const initiateAnimation = () => {
    previousTimeRef.current = performance.now()
    requestRef.current = requestAnimationFrame(animate)
  }

  const animate = () => {
    const timeThen = previousTimeRef.current
    const timeNow = performance.now()
    const dt = (timeNow - timeThen) / 1000
    previousTimeRef.current = timeNow
    try {
      update(dt)
    } catch (e) {
      // TODO
    }
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    initiateAnimation()
    return () => {
      requestRef.current && cancelAnimationFrame(requestRef.current)
    }
  }, [update])
}
