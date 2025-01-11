export type Vec2 = {
  x: number
  y: number
}

export const vec2 = (x: number, y: number): Vec2 => ({ x, y })

export const add = (a: Vec2, b: Vec2): Vec2 => ({
  x: a.x + b.x,
  y: a.y + b.y,
})

export const sum = (...vecs: Vec2[]) => vecs.reduce(add, { x: 0, y: 0 })

export const sub = (a: Vec2, b: Vec2): Vec2 => ({
  x: a.x - b.x,
  y: a.y - b.y,
})

export const scale = (a: Vec2, s: number): Vec2 => ({
  x: a.x * s,
  y: a.y * s,
})

export const div = (a: Vec2, s: number): Vec2 => ({
  x: a.x / s,
  y: a.y / s,
})

export const neg = (a: Vec2): Vec2 => ({
  x: -a.x,
  y: -a.y,
})

export const origin: Vec2 = {
  x: 0,
  y: 0,
}
