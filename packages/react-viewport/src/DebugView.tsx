import React, { forwardRef, FunctionComponent, ReactNode } from 'react'
import { origin, Vec2 } from './linalg.ts'
import * as CssTransform from './cssTransform.tsx'

export const Circle = forwardRef<
  HTMLDivElement,
  {
    color: string
    radius: number
  } & React.CSSProperties
>(({ radius, ...style }, ref) => (
  <div
    ref={ref}
    style={{
      width: radius ?? 10,
      height: radius ?? 10,
      borderColor: 'currentColor',
      borderStyle: 'solid',
      borderWidth: 2,
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      ...style,
    }}
  />
))

export const DebugView = forwardRef<
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
      transform: CssTransform.translate(props.pos ?? origin),
      zIndex: 1000,
      left: 0,
      top: 0,
    }}
  >
    {props.children}
  </div>
))

export const Box: FunctionComponent<
  {
    children: ReactNode
  } & React.CSSProperties
> = ({ children, ...style }) => (
  <div
    style={{
      padding: 10,
      backgroundColor: 'white',
      border: '1px solid black',
      borderRadius: 5,
      ...style,
    }}
  >
    {children}
  </div>
)
