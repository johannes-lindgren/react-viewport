import type { Preview } from '@storybook/react'
import { useEffect } from 'react'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    //   Prevent content menu from appearing
    (Story, context) => {
      useEffect(() => {
        const handlePreventDefault = (e: Event) => {
          e.preventDefault()
        }

        const el = window

        const options = { passive: false }
        // Attach listener to Storybook's iframe or parent window
        el.addEventListener('contextmenu', handlePreventDefault, options)
        el.addEventListener('click', handlePreventDefault, options)
        el.addEventListener('gesturestart', handlePreventDefault, options)
        el.addEventListener('gesturechange', handlePreventDefault, options)
        el.addEventListener('gestureend', handlePreventDefault, options)
        el.addEventListener('wheel', handlePreventDefault, options)

        // Cleanup listener on unmount
        return () => {
          el.removeEventListener('contextmenu', handlePreventDefault)
          el.removeEventListener('click', handlePreventDefault)
          el.removeEventListener('gesturestart', handlePreventDefault)
          el.removeEventListener('gesturechange', handlePreventDefault)
          el.removeEventListener('gestureend', handlePreventDefault)
          el.removeEventListener('wheel', handlePreventDefault)
        }
      }, [])

      return <Story {...context} />
    },
  ],
}

export default preview
