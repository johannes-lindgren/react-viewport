import React, {
  createContext,
  forwardRef,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { useGesture } from '@use-gesture/react'
import { useAnimation } from './useAnimation.ts'
import {
  add,
  createMat2x3,
  div,
  getScaling,
  getTranslation,
  inverse,
  Mat2x3,
  mult,
  mult2x3,
  neg,
  origin,
  scale,
  scaleAffine,
  sub,
  translateAffine,
  Vec2,
  vec2,
} from './linalg.ts'
import { DebugView, Circle } from './DebugView.tsx'
import { useElementSizeRef } from './useElementSizeRef.tsx'
import * as CssTransform from './cssTransform.tsx'

const ViewportContext = createContext<ViewportApi | undefined>(undefined)

export const KeepScale: FunctionComponent<{
  children?: ReactNode
}> = (props) => {
  const viewportApi = useContext(ViewportContext)

  const wrapperRef = useRef<HTMLDivElement>(null)

  const update = useCallback(() => {
    const scale = viewportApi?.getContentTransformation().scale ?? 1
    wrapperRef.current?.style.setProperty(
      'transform',
      CssTransform.scale(1 / scale),
    )
  }, [viewportApi])

  useAnimation(update)

  return (
    <ViewportContext.Provider value={undefined}>
      <div ref={wrapperRef}>{props.children}</div>
    </ViewportContext.Provider>
  )
}

export type Camera = {
  // Position in coordinates
  position: Vec2
  // Zoom
  scale: number
}

export const GestureViewport: FunctionComponent<{
  children?: ReactNode
}> = (props) => {
  const viewportApi = useRef<ViewportApi>(null)

  return (
    <Gesture viewportApi={viewportApi}>
      <Viewport ref={viewportApi}>{props.children}</Viewport>
    </Gesture>
  )
}

const Gesture: FunctionComponent<{
  children?: ReactNode
  viewportApi: React.MutableRefObject<ViewportApi | null>
}> = (props) => {
  const { ref: gestureRef } = useGestureContainer(props.viewportApi)
  return (
    <div
      style={{
        cursor: 'grab',
      }}
      ref={gestureRef}
    >
      {props.children}
    </div>
  )
}

type ViewportApi = {
  getScreenMat: () => Mat2x3
  getWorldMat: () => Mat2x3
  getContentTransformation: () => Camera
  setCamera: (transformation: Camera) => void
}

const Viewport = forwardRef<
  ViewportApi,
  {
    children?: ReactNode
  }
>((props, apiRef) => {
  const contentRef = useRef<HTMLDivElement>(null)

  const viewportSizeRef = useElementSizeRef(contentRef)

  const cameraRef = useRef<Camera>({
    position: origin,
    scale: 1.0,
  })

  const update = (_dt: number) => {
    const cam = cameraRef.current
    const screenSize = viewportSizeRef.current

    const currentPos = cam.position
    const currentScale = cam.scale
    const viewMat = createMat2x3({
      translation: scale(screenSize, 0.5),
    })
    const worldMat = createMat2x3({
      translation: scale(neg(currentPos), currentScale),
      scale: currentScale,
    })
    const mat = mult2x3(worldMat, viewMat)

    const transformAttrMat = CssTransform.mat2x3(mat)

    if (!contentRef.current) {
      return
    }
    // TODO this is just for debugging
    if (cameraWorldRef.current) {
      cameraWorldRef.current.style.transform = CssTransform.translate(
        cam.position,
      )
    }
    // TODO this is just for debugging
    if (viewCenterRef.current) {
      viewCenterRef.current.style.transform = CssTransform.mat2x3(viewMat)
    }
    contentRef.current.style.transform = transformAttrMat
  }

  const createStore = (): ViewportApi => ({
    getScreenMat: () => {
      const screenSize = viewportSizeRef.current
      return createMat2x3({
        translation: scale(screenSize, 0.5),
      })
    },
    getWorldMat: () => {
      const t = cameraRef.current
      return createMat2x3({
        translation: scale(neg(t.position), t.scale),
        scale: t.scale,
      })
    },
    getContentTransformation: () => cameraRef.current,
    setCamera: (transformation) => {
      cameraRef.current = transformation
    },
  })

  const store = useMemo(createStore, [])

  // Inject as prop
  useImperativeHandle(apiRef, createStore)

  useAnimation(update)

  const cameraWorldRef = useRef<HTMLDivElement>(null)
  const viewCenterRef = useRef<HTMLDivElement>(null)

  return (
    <ViewportContext.Provider value={store}>
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
        <DebugView ref={viewCenterRef}>
          <DebugView>
            <Circle color="red" radius={25} />
          </DebugView>
          <DebugView>
            <Circle
              color="red"
              radius={3}
              position="absolute"
              backgroundColor="currentcolor"
            />
          </DebugView>
        </DebugView>
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
          <DebugView ref={cameraWorldRef}>
            <Circle color="blue" radius={25} />
          </DebugView>
          {props.children}
        </div>
      </div>
    </ViewportContext.Provider>
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

  const setTransform = (mat: Mat2x3) => {
    if (!viewportApi.current) {
      return
    }
    const scaling = getScaling(mat)[0]
    const translation = getTranslation(mat)
    viewportApi.current.setCamera({
      scale: scaling,
      position: div(translation, -scaling),
    })
  }

  /**
   * @deprecated this one does not convert translation to world coordinates properly
   * @param mat
   */
  const setTransformState = (mat: Mat2x3) => {
    if (!viewportApi.current) {
      return
    }
    const scaling = getScaling(mat)[0]
    const translation = getTranslation(mat)
    viewportApi.current.setCamera({
      scale: scaling,
      position: translation,
    })
  }

  // TODO only include matrices here
  const gestureState = useRef<
    | {
        tag: 'pinch'
        startTransform: Camera
        startWorld: Mat2x3
      }
    | {
        tag: 'wheel'
        startTransform: Camera
        startWorld: Mat2x3
        clickScreenPos: Vec2
      }
    | {
        tag: 'mouseDown'
        startTransform: Camera
        startWorld: Mat2x3
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

  useGesture(
    {
      onPinchStart: () => {
        if (!viewportApi.current) {
          return
        }
        const transformation = viewportApi.current.getContentTransformation()
        gestureState.current = {
          tag: 'pinch',
          startTransform: transformation,
          startWorld: viewportApi.current.getWorldMat(),
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
          viewportElementRef.current?.getBoundingClientRect() ?? { x: 0, y: 0 }

        const screenPos = vec2(screenRect.x, screenRect.y)
        const mouseAbsolute = state.origin
        const mouseScreen = sub(mouseAbsolute, screenPos)

        const { startTransform } = gestureState.current

        const screenMat = viewportApi.current.getScreenMat()
        const mouseView = mult(inverse(screenMat), mouseScreen)

        // Transform with current position as origin
        const worldMat = createMat2x3({
          translation: startTransform.position,
          scale: startTransform.scale,
        })
        const mouseWorld = mult(inverse(worldMat), mouseView)

        const newTransformation = zoomInTo(worldMat, mouseWorld, relativeScale)

        setTransformState(newTransformation)
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
          startWorld: viewportApi.current.getWorldMat(),
          clickScreenPos: vec2(event.screenX, event.screenY),
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
        const mouseScreen: Vec2 = vec2(state.event.screenX, state.event.screenY)
        const clickScreen = gestureState.current.clickScreenPos
        const drScreen = sub(mouseScreen, clickScreen)
        const worldStart = gestureState.current.startWorld
        const worldNew = translateAffine(worldStart, drScreen)
        setTransform(worldNew)
      },
      onMouseUp: () => {
        gestureState.current = { tag: 'stale' }
      },
      // Wheel
      onWheelStart: (state) => {
        if (!viewportApi.current) {
          return
        }
        const transformation = viewportApi.current.getContentTransformation()
        gestureState.current = {
          tag: 'wheel',
          startWorld: viewportApi.current.getWorldMat(),
          startTransform: transformation,
          clickScreenPos: vec2(state.event.screenX, state.event.screenY),
        }
      },
      onWheel: (state) => {
        if (!viewportApi.current) {
          return
        }
        if (state.pinching) {
          return
        }
        if (state.event.ctrlKey) {
          return
        }
        if (gestureState.current.tag !== 'wheel') {
          return
        }

        const drScreen = neg(state.movement)
        const worldStart = gestureState.current.startWorld
        const worldNew = translateAffine(worldStart, drScreen)
        setTransform(worldNew)
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
