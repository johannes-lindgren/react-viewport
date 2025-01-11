import {
  forwardRef,
  FunctionComponent,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { useGesture } from '@use-gesture/react'
import { add, div, neg, origin, scale, sub, vec2, Vec2 } from './vector.ts'
import { useAnimation } from './useAnimation.ts'

type Transformation = {
  x: number
  y: number
  scale: number
}

const styleTransformScale = (scale: number) => `scale(${scale})`
const styleTransformTranslate = (dr: Vec2) => `translate(${dr.x}px, ${dr.y}px)`

const Dot = forwardRef<
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

const Absolute = forwardRef<
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

export const GestureContainer: FunctionComponent<{
  children?: ReactNode
}> = (props) => {
  const viewportApi = useRef<ViewportApi>(null)
  const { ref: gestureRef } = useGestureContainer(viewportApi)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
      ref={gestureRef}
    >
      <Viewport ref={viewportApi}>
        {props.children}
        <div
          style={{
            // TODO use %, to not be dependent on the window size
            // minWidth: `calc(${(1.5 * 100) / minScale}vw)`,
            // minHeight: `calc(${(1.5 * 100) / minScale}vh)`,
            padding: 100,
            width: '1000px',
            height: '1000px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // TODO remove below
            boxSizing: 'border-box',
            boxShadow: 'inset 0 0 100px grey',
            backgroundColor: 'lightsteelblue',
          }}
        >
          <button>A worthless button...</button>
        </div>
      </Viewport>
    </div>
  )
}

type ViewportApi = {
  getContentTransformation: () => Transformation
  setContentTransform: (transformation: Transformation) => void
}

const Viewport = forwardRef<
  ViewportApi,
  {
    children?: ReactNode
  }
>((props, apiRef) => {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    //   TODO do not allow skipping
    const el = contentRef?.current
    if (!el) {
      return
    }

    const handleResize = () => {
      viewportSizeRef.current = {
        x: el.offsetWidth,
        y: el.offsetHeight,
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(el)
    handleResize()
    return () => {
      resizeObserver.disconnect()
    }
  }, [apiRef])

  const transformationRef = useRef<Transformation>({
    x: 0,
    y: 0,
    scale: 1,
  })

  const viewportSizeRef = useRef<Vec2>({
    x: 0,
    y: 0,
  })

  const update = (_dt: number) => {
    const transformation = transformationRef.current
    const viewportSize = viewportSizeRef.current
    const transformAttr = [
      styleTransformScale(transformation.scale),
      styleTransformTranslate(neg(transformation)),
      styleTransformTranslate(div(viewportSize, 2)),
    ].join(' ')

    if (!contentRef.current) {
      return
    }
    // TODO this is just for debugging
    if (currentPositionDotRef.current) {
      currentPositionDotRef.current.style.transform =
        styleTransformTranslate(transformation)
    }
    // TODO this is just for debugging
    if (viewportCenterDotRef.current) {
      viewportCenterDotRef.current.style.transform = styleTransformTranslate(
        div(viewportSize, 2),
      )
    }
    contentRef.current.style.transform = transformAttr
  }

  useImperativeHandle(apiRef, () => ({
    getContentTransformation: () => transformationRef.current,
    setContentTransform: (transformation) => {
      transformationRef.current = transformation
    },
  }))

  useAnimation(update)

  const currentPositionDotRef = useRef<HTMLDivElement>(null)
  const viewportCenterDotRef = useRef<HTMLDivElement>(null)

  return (
    <div
      id="viewport"
      style={{
        touchAction: 'none',
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid black',
      }}
    >
      <Absolute ref={viewportCenterDotRef}>
        <Dot color="red" radius={15} />
      </Absolute>
      <div
        id="content"
        ref={contentRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          // transform: transformAttr,
        }}
      >
        {/*  DEBUG  */}
        <Absolute ref={currentPositionDotRef}>
          <Dot color="blue" radius={15} />
        </Absolute>
        <Absolute pos={origin}>
          <Dot color="black" />
        </Absolute>
        <Absolute pos={{ x: 1000, y: 0 }}>
          <Dot color="black" />
        </Absolute>
        <Absolute pos={{ x: 0, y: 1000 }}>
          <Dot color="black" />
        </Absolute>
        <Absolute pos={{ x: 1000, y: 1000 }}>
          <Dot color="black" />
        </Absolute>
        {props.children}
      </div>
    </div>
  )
})

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const useGestureContainer = (
  viewportApi: React.MutableRefObject<ViewportApi | null>,
) => {
  const viewportElementRef = useRef<HTMLDivElement>(null)

  const setTransformState = (scale: number, x: number, y: number) => {
    if (!viewportApi.current) {
      return
    }
    viewportApi.current.setContentTransform({ scale, x, y })
  }

  const translation = useRef<
    | {
        tag: 'pinch'
        startTransform: Transformation
      }
    | {
        tag: 'wheel'
        startTransform: Transformation
      }
    | {
        tag: 'mouseDown'
        startTransform: Transformation
        clickScreenPos: Vec2
      }
    | {
        tag: 'stale'
      }
  >({ tag: 'stale' })

  useEffect(() => {
    const el = viewportElementRef.current
    if (!el) {
      return
    }
    const handlePreventDefault = (e: Event) => {
      e.preventDefault()
    }
    const options = { passive: false }
    el.addEventListener('gesturestart', handlePreventDefault, options)
    el.addEventListener('gesturechange', handlePreventDefault, options)
    el.addEventListener('gestureend', handlePreventDefault, options)
    el.addEventListener('wheel', handlePreventDefault, options)
    return () => {
      el.removeEventListener('gesturestart', handlePreventDefault)
      el.removeEventListener('gesturechange', handlePreventDefault)
      el.removeEventListener('gestureend', handlePreventDefault)
      el.removeEventListener('wheel', handlePreventDefault)
    }
  }, [])

  const applyDeltaTransform = (deltaTransform: Transformation) => {
    setTransform({ scale: newScale, ...newPos })
  }

  useGesture(
    {
      onPinchStart: () => {
        if (!viewportApi.current) {
          return
        }
        const transformation = viewportApi.current.getContentTransformation()
        translation.current = {
          tag: 'pinch',
          startTransform: {
            x: transformation.x,
            y: transformation.y,
            scale: transformation.scale,
          },
        }
      },
      onPinch: (state) => {
        if (translation.current.tag !== 'pinch') {
          return
        }
        const deltaScale = state.movement[0]
        const oldScale = translation.current.startTransform.scale
        const newScale = oldScale * deltaScale

        const { startTransform } = translation.current
        setTransformState(newScale, startTransform.x, startTransform.y)
      },
      onPinchEnd: (_state) => {
        translation.current = { tag: 'stale' }
      },
      onMouseDown: ({ event }) => {
        if (!viewportApi.current) {
          return
        }
        const transformation = viewportApi.current.getContentTransformation()
        // TODO change to space and right-click
        if (!event.ctrlKey) {
          return
        }
        translation.current = {
          tag: 'mouseDown',
          startTransform: {
            x: transformation.x,
            y: transformation.y,
            scale: transformation.scale,
          },
          clickScreenPos: {
            x: event.screenX,
            y: event.screenY,
          },
        }
      },
      onMouseLeave: () => {
        translation.current = { tag: 'stale' }
      },
      onMouseMove: (state) => {
        if (!viewportApi.current) {
          return
        }
        // const transformation = viewportApi.current.getContentTransformation()
        const setTransform = viewportApi.current.setContentTransform
        // TODO change to space and right-click
        if (!state.event.ctrlKey) {
          translation.current = { tag: 'stale' }
          return
        }
        if (translation.current.tag !== 'mouseDown') {
          return
        }
        const { startTransform } = translation.current
        const oldScale = startTransform.scale
        const newScale = startTransform.scale
        const mousePosNow: Vec2 = {
          x: state.event.screenX,
          y: state.event.screenY,
        }
        const clickScreenPos = translation.current.clickScreenPos
        const dr = sub(clickScreenPos, mousePosNow)
        const newPos = add(startTransform, div(dr, newScale))
        applyDeltaTransform({ scale: 0, ...dr })
      },
      onMouseUp: () => {
        translation.current = { tag: 'stale' }
      },
      // Wheel
      onWheelStart: () => {
        if (!viewportApi.current) {
          return
        }
        const transformation = viewportApi.current.getContentTransformation()
        translation.current = {
          tag: 'wheel',
          startTransform: {
            x: transformation.x,
            y: transformation.y,
            scale: transformation.scale,
          },
        }
      },
      onWheel: (state) => {
        if (!viewportApi.current) {
          return
        }
        const transformation = viewportApi.current.getContentTransformation()
        if (state.pinching) {
          return
        }
        if (state.event.ctrlKey) {
          return
        }
        if (translation.current.tag !== 'wheel') {
          return
        }
        console.log('onWheel')
        const dr = vec2(state.movement[0], state.movement[1])
        const newPos = {
          x: translation.current.startTransform.x + dr.x,
          y: translation.current.startTransform.y + dr.y,
        }
        setTransformState(transformation.scale, newPos.x, newPos.y)
      },
      onWheelEnd: () => {
        translation.current = { tag: 'stale' }
      },
    },
    {
      eventOptions: {
        passive: false,
      },
      target: viewportElementRef,
    },
  )

  return { ref: viewportElementRef }
}
