import React, { forwardRef, ReactNode } from 'react'
import { origin, Vec2 } from './linalg.ts'
import { styleTransformTranslate } from './Viewport.tsx'

export const Dot = forwardRef<
  HTMLDivElement,
  {
    color: string
    radius?: number
    style?: React.CSSProperties
  }
>((props, ref) => (
  <div
    ref={ref}
    style={{
      width: props.radius ?? 10,
      height: props.radius ?? 10,
      borderColor: props.color,
      borderStyle: 'solid',
      borderWidth: 2,
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      ...props.style,
    }}
  />
))

export const Absolute = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode
    pos?: Vec2
  }
>((props, ref) => (
  <div
    ref={ref}
    style={{
      position: 'absolute',
      transform: styleTransformTranslate(props.pos ?? origin),
      zIndex: 1000,
      left: 0,
      top: 0,
    }}
  >
    {props.children}
  </div>
))
