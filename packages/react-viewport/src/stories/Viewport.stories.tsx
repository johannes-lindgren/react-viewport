import type { Meta, StoryObj } from '@storybook/react'

import { GestureViewport } from '../Viewport.tsx'
import { Absolute, Circle } from '../Absolute.tsx'
import { Grid } from './Grid.tsx'

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

const ExampleContent = () => (
  <div
    style={{
      boxSizing: 'border-box',
      boxShadow: 'inset 0 0 100px lightgrey',
    }}
  >
    <Grid columns={10} rows={10} cellSize={100} />
    <Absolute pos={[0, 0]}>
      <Circle radius={10} color="black" backgroundColor="currentcolor" />
    </Absolute>
    <Absolute pos={[1000, 0]}>
      <Circle radius={10} color="black" backgroundColor="currentcolor" />
    </Absolute>
    <Absolute pos={[0, 1000]}>
      <Circle radius={10} color="black" backgroundColor="currentcolor" />
    </Absolute>
    <Absolute pos={[1000, 1000]}>
      <Circle radius={10} color="black" backgroundColor="currentcolor" />
    </Absolute>
    <Absolute pos={[200, 200]}>
      <button>A worthless button...</button>
    </Absolute>
  </div>
)

const Template: typeof GestureViewport = (args) => (
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
