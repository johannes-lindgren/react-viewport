import {
  forwardRef,
  FunctionComponent,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { useGesture } from '@use-gesture/react'
import {
  add_old,
  div,
  neg_old,
  origin,
  sub_old,
  vec2_old,
  Vec2_old,
} from './vector.ts'
import { useAnimation } from './useAnimation.ts'
import {
  add,
  createMat2x3,
  getScaling,
  getTranslation,
  inverse,
  Mat2x3,
  mult,
  mult2x3,
  neg,
  scale,
  scaleAffine,
  sub,
  translateAffine,
  Vec2,
  vec2,
} from './linalg.ts'

type Transformation = {
  x: number
  y: number
  scale: number
}

const styleTransformScale = (scale: number) => `scale(${scale})`
const styleTransformTranslate = (dr: Vec2_old) =>
  `translate(${dr.x}px, ${dr.y}px)`

const styleTransformMat3x2 = (m: Mat2x3) => {
  const arr = [m[0], m[1], m[3], m[4], m[2], m[5]]
  return `matrix(${arr.join(', ')})`
}

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
    pos?: Vec2_old
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
  getViewportDim: () => Vec2_old
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
    x: 0.0,
    y: 0.0,
    scale: 1.0,
  })

  const viewportSizeRef = useRef<Vec2_old>({
    x: 0,
    y: 0,
  })

  const update = (_dt: number) => {
    const transformation = transformationRef.current
    const viewportSize = viewportSizeRef.current

    const currentPos = vec2(transformation.x, transformation.y)
    const currentScale = transformation.scale
    const screenSize = vec2(viewportSize.x, viewportSize.y)
    const viewMat = createMat2x3({
      translation: scale(screenSize, 0.5),
    })
    const worldMat = createMat2x3({
      translation: scale(neg(currentPos), currentScale),
      scale: currentScale,
    })
    const mat = mult2x3(worldMat, viewMat)

    const transformAttrMat = styleTransformMat3x2(mat)
    const transformAttr = [
      styleTransformTranslate(neg_old(transformation)),
      styleTransformScale(transformation.scale),
      styleTransformTranslate(div(viewportSize, 2)),
    ].join(' ')
    if (Math.random() < 0.01) {
      console.log('pos', currentPos)
      console.log('worldMat', styleTransformMat3x2(worldMat))
      console.log('viewMat', styleTransformMat3x2(viewMat))
      console.log('mat', styleTransformMat3x2(mat))
    }
    // console.log('transformAttr', transformAttrMat)
    // console.log('transformAttr', transformAttr)

    const useMat = true

    if (!contentRef.current) {
      return
    }
    // TODO this is just for debugging
    if (cameraWorldRef.current) {
      // cameraWorldRef.current.style.transform = styleTransformMat3x2([
      //   worldMat[0],
      //   worldMat[1],
      //   -worldMat[2],
      //   worldMat[3],
      //   worldMat[4],
      //   -worldMat[5],
      // ])

      // With scaling
      cameraWorldRef.current.style.transform =
        styleTransformTranslate(transformation)
    }
    // TODO this is just for debugging
    if (viewCenterRef.current) {
      viewCenterRef.current.style.transform = styleTransformMat3x2(viewMat)
    }
    contentRef.current.style.transform = useMat
      ? transformAttrMat
      : transformAttr
  }

  useImperativeHandle(apiRef, () => ({
    getContentTransformation: () => transformationRef.current,
    getViewportDim: () => viewportSizeRef.current,
    setContentTransform: (transformation) => {
      transformationRef.current = transformation
    },
  }))

  useAnimation(update)

  const cameraWorldRef = useRef<HTMLDivElement>(null)
  const viewCenterRef = useRef<HTMLDivElement>(null)

  return (
    <div
      id="viewport"
      style={{
        touchAction: 'none',
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Absolute ref={viewCenterRef}>
        <Dot color="red" radius={15} />
      </Absolute>
      <div
        id="content"
        ref={contentRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {/*  DEBUG  */}
        <Absolute ref={cameraWorldRef}>
          <Dot color="blue" radius={25} />
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

/**
 * Zoom in towards a given point
 * @param worldMat the current world matrix
 * @param zoomOrigin the point to zoom towards
 * @param relativeScale the relative scale change. For example, if the current scale is 1.5 and the relative scale is 0.5, the new scale will be 0.75
 */
const zoomInTo = (
  worldMat: Mat2x3,
  zoomOrigin: Vec2,
  relativeScale: number,
): Mat2x3 => {
  const worldTranslation = getTranslation(worldMat)

  // World matrix without translation
  const matCurrentScale = translateAffine(worldMat, neg(worldTranslation))

  const mouseView = mult(worldMat, zoomOrigin)

  const mouseWorldScaleOnly = mult(inverse(matCurrentScale), mouseView)
  const matWorldScaled = scaleAffine(matCurrentScale, relativeScale)
  const mouseWorldScaled = mult(inverse(matWorldScaled), mouseView)
  const dr = sub(mouseWorldScaleOnly, mouseWorldScaled)
  const r = add(worldTranslation, dr)
  return translateAffine(matWorldScaled, r)
}

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

  const gestureState = useRef<
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
        clickScreenPos: Vec2_old
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

  const applyDeltaTransform = (relativeZoom: number, dr: Vec2_old) => {
    if (
      !viewportApi.current ||
      !gestureState.current ||
      (gestureState.current.tag !== 'mouseDown' &&
        gestureState.current.tag !== 'wheel' &&
        gestureState.current.tag !== 'pinch')
    ) {
      return
    }
    const { setContentTransform } = viewportApi.current

    const { startTransform } = gestureState.current
    const oldScale = startTransform.scale
    const newScale = oldScale * relativeZoom

    const newPos = add_old(startTransform, div(dr, newScale))
    setContentTransform({ scale: newScale, ...newPos })
  }

  useGesture(
    {
      onPinchStart: () => {
        if (!viewportApi.current) {
          return
        }
        const transformation = viewportApi.current.getContentTransformation()
        console.log('onPinchStart', transformation)
        gestureState.current = {
          tag: 'pinch',
          startTransform: transformation,
        }
      },
      onPinch: (state) => {
        if (gestureState.current.tag !== 'pinch') {
          return
        }
        if (!viewportApi.current) {
          return
        }
        const relativeScale = state.movement[0]

        const screenRect =
          viewportElementRef.current?.getBoundingClientRect() ?? origin

        const screenPos = vec2(screenRect.x, screenRect.y)
        const mouseAbsolute = state.origin
        const mouseScreen = sub(mouseAbsolute, screenPos)

        // TODO save the matrices instead
        const { startTransform } = gestureState.current
        const currentPos = vec2(startTransform.x, startTransform.y)
        const currentScale = startTransform.scale
        const viewportDim = viewportApi.current.getViewportDim()

        const screenSize = vec2(viewportDim.x, viewportDim.y)
        const screenMat = createMat2x3({
          translation: scale(screenSize, 0.5),
        })
        const mouseView = mult(inverse(screenMat), mouseScreen)

        // Transform with current position as origin
        const worldMat = createMat2x3({
          translation: currentPos,
          scale: currentScale,
        })
        const mouseWorld = mult(inverse(worldMat), mouseView)

        const newTransformation = zoomInTo(worldMat, mouseWorld, relativeScale)

        const scaling = getScaling(newTransformation)[0]
        const translation = getTranslation(newTransformation)

        setTransformState(scaling, translation[0], translation[1])
      },
      onPinchEnd: (_state) => {
        gestureState.current = { tag: 'stale' }
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
        gestureState.current = {
          tag: 'mouseDown',
          startTransform: transformation,
          clickScreenPos: {
            x: event.screenX,
            y: event.screenY,
          },
        }
      },
      onMouseLeave: () => {
        gestureState.current = { tag: 'stale' }
      },
      onMouseMove: (state) => {
        if (!viewportApi.current) {
          return
        }
        // TODO change to space and right-click
        if (!state.event.ctrlKey) {
          gestureState.current = { tag: 'stale' }
          return
        }
        if (gestureState.current.tag !== 'mouseDown') {
          return
        }
        const relativeScale = 1
        const mousePosNow: Vec2_old = {
          x: state.event.screenX,
          y: state.event.screenY,
        }
        const clickScreenPos = gestureState.current.clickScreenPos
        const dr = sub_old(clickScreenPos, mousePosNow)
        applyDeltaTransform(relativeScale, dr)
      },
      onMouseUp: () => {
        gestureState.current = { tag: 'stale' }
      },
      // Wheel
      onWheelStart: () => {
        if (!viewportApi.current) {
          return
        }
        const transformation = viewportApi.current.getContentTransformation()
        gestureState.current = {
          tag: 'wheel',
          startTransform: transformation,
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
        if (gestureState.current.tag !== 'wheel') {
          return
        }
        console.log('onWheel')
        const dr = vec2_old(state.movement[0], state.movement[1])
        const newPos = {
          x: gestureState.current.startTransform.x + dr.x,
          y: gestureState.current.startTransform.y + dr.y,
        }
        setTransformState(transformation.scale, newPos.x, newPos.y)
      },
      onWheelEnd: () => {
        gestureState.current = { tag: 'stale' }
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
