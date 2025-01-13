import { Mat2x3, Vec2 } from './linalg.ts'

export const translate = (dr: Vec2) => `translate(${dr[0]}px, ${dr[1]}px)`

export const mat2x3 = (m: Mat2x3) => {
  const arr = [m[0], m[1], m[3], m[4], m[2], m[5]]
  return `matrix(${arr.join(', ')})`
}
