import { forwardRef, type ImgHTMLAttributes, useEffect, useState } from 'react'

// Simplified Image component to avoid dependency on broken image-kit shim
const FALLBACK_IMAGE_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent pixel

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fittingType?: string
  originWidth?: number
  originHeight?: number
  focalPointX?: number
  focalPointY?: number
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(({ src, ...props }, ref) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src)

  useEffect(() => {
    // If src prop changes, update the imgSrc state
    setImgSrc((prev) => {
      if (prev !== src) {
        return src
      }
      return prev
    })
  }, [src])

  if (!src) {
    return <div data-empty-image ref={ref} {...props} />
  }

  return <img ref={ref} src={imgSrc} onError={() => setImgSrc(FALLBACK_IMAGE_URL)} {...props} />
})
Image.displayName = 'Image'
