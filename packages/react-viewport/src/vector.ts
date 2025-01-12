export type Vec2_old = {
  x: number
  y: number
}

// export const inverse = (a: Mat2x3): Mat2x3 => []

export const vec2_old = (x: number, y: number): Vec2_old => ({ x, y })

export const add_old = (a: Vec2_old, b: Vec2_old): Vec2_old => ({
  x: a.x + b.x,
  y: a.y + b.y,
})

export const sum = (...vecs: Vec2_old[]) => vecs.reduce(add_old, { x: 0, y: 0 })

export const sub_old = (a: Vec2_old, b: Vec2_old): Vec2_old => ({
  x: a.x - b.x,
  y: a.y - b.y,
})

export const scale_xy = (a: Vec2_old, s: number): Vec2_old => ({
  x: a.x * s,
  y: a.y * s,
})

export const div = (a: Vec2_old, s: number): Vec2_old => ({
  x: a.x / s,
  y: a.y / s,
})

export const neg_old = (a: Vec2_old): Vec2_old => ({
  x: -a.x,
  y: -a.y,
})

export const origin: Vec2_old = {
  x: 0,
  y: 0,
}
