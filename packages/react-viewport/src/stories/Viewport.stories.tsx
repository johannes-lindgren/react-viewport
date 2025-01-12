import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './Button'
import { GestureViewport } from '../Viewport.tsx'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Example/Viewport',
  component: GestureViewport,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

const gridSize = 100
const gridLineWidth = 1

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    children: (
      <div
        style={{
          padding: 100,
          width: '1000px',
          height: '1000px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          boxShadow: 'inset 0 0 100px grey',
          border: `${gridLineWidth / 2}px solid black`,
          backgroundColor: 'white',
          background: `repeating-linear-gradient(
                0deg,
            transparent,
            transparent ${gridSize - gridLineWidth}px,
            black ${gridSize}px
            ),
            repeating-linear-gradient(
            90deg,
            white,
            white ${gridSize - gridLineWidth}px,
            black ${gridSize}px
            )`,
        }}
      >
        <button>A worthless button...</button>
      </div>
    ),
  },
}
