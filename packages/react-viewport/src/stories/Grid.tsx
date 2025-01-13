import { FunctionComponent } from 'react'

const gridLineWidth = 2

export const Grid: FunctionComponent<{
  columns: number
  rows: number
  cellSize: number
}> = (props) => {
  const { columns, rows, cellSize } = props
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, 0fr)`,
        gridTemplateColumns: `repeat(${columns}, 0fr)`,
        gap: 0,
      }}
    >
      {new Array(columns * rows).fill(0).map((_, i) => (
        <GridCell key={i} size={cellSize} />
      ))}
    </div>
  )
}

const GridCell: FunctionComponent<{
  size: number
}> = (props) => (
  <div
    style={{
      boxSizing: 'border-box',
      border: `${gridLineWidth / 2}px solid black`,
      width: `${props.size}px`,
      height: `${props.size}px`,
    }}
  ></div>
)
