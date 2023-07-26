import BRICK_TEXTURE from './assets/image/brick.jpg'
import PAPER_TEXTURE from './assets/image/paper.jpg'
import WOOD_TEXTURE from './assets/image/wood.jpg'

const TEXTURE_LIST = [
  { label: '砂纸纹', id: 'paper', src: PAPER_TEXTURE },
  { label: '木板纹', id: 'wood', src: WOOD_TEXTURE },
  { label: '砖瓦纹', id: 'brick', src: BRICK_TEXTURE },
]

export interface TextureData {
  label: string
  id: string
  img: HTMLImageElement
}

function loadTexture(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = () => resolve(img)
    img.onerror = reject
  })
}

export function loadTextures(): Promise<TextureData[]> {
  return Promise.all(
    TEXTURE_LIST.map(async ({ label, id, src }) => {
      const img = await loadTexture(src)
      return { label, id, img }
    }),
  )
}
