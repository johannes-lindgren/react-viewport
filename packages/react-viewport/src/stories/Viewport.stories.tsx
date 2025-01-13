import type { Meta, StoryObj } from '@storybook/react'

import { GestureViewport } from '../Viewport.tsx'
import { Absolute } from '../Absolute.tsx'

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
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
} satisfies Meta<typeof GestureViewport>

export default meta
type Story = StoryObj<typeof meta>

const gridSize = 100
const gridLineWidth = 2

const GridCell = () => (
  <div
    style={{
      boxSizing: 'border-box',
      border: `${gridLineWidth / 2}px solid black`,
      width: `${gridSize}px`,
      height: `${gridSize}px`,
    }}
  ></div>
)

const width = 1000

const ExampleContent = () => (
  <div
    style={{
      width: `${width}px`,
      height: `${width}px`,
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      boxShadow: 'inset 0 0 100px lightgrey',
      backgroundColor: 'white',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, 100px)',
      gridTemplateRows: `repeat(auto-fill, ${gridSize}px)`,
    }}
  >
    {new Array((width / gridSize) ** 2).fill(0).map((_, i) => (
      <GridCell key={i} />
    ))}
    <Absolute pos={[200, 200]}>
      <button>A worthless button...</button>
    </Absolute>
  </div>
)

const Template = (args) => (
  <div
    id="template"
    style={{
      width: '100vw',
      height: '100vh',
    }}
  >
    <GestureViewport {...args} />
  </div>
)

export const Primary: Story = {
  render: Template,
  args: {
    children: <ExampleContent />,
  },
}
