import React, { useEffect, useRef } from 'react'
import { origin, vec2, Vec2 } from './linalg.ts'

export const useElementSizeRef = (elementRef: React.RefObject<HTMLElement>) => {
  const viewportSizeRef = useRef<Vec2>(origin)

  useEffect(() => {
    //   TODO do not allow skipping
    const el = elementRef?.current
    if (!el) {
      return
    }

    const handleResize = () => {
      viewportSizeRef.current = vec2(el.offsetWidth, el.offsetHeight)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(el)
    handleResize()
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return viewportSizeRef
}
