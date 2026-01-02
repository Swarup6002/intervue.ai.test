export type FittingType = 'fill' | 'fit' | 'stretch';
export type ImageTransformOptions = { focalPoint?: { x: number; y: number } } | undefined;

export const STATIC_MEDIA_URL = 'https://cdn.example.com/media/';

export const getPlaceholder = (fittingType: FittingType, data: any, options: any) => {
  return {
    uri: 'placeholder.png',
    css: { img: {} },
    attr: {},
  };
};

export const sdk = {
  getScaleToFitImageURL: (_id: string, _w: number, _h: number, tw: number, th: number, _opts?: ImageTransformOptions) => {
    return `${STATIC_MEDIA_URL}scaled-fit-${tw}x${th}.png`;
  },
  getScaleToFillImageURL: (_id: string, _w: number, _h: number, tw: number, th: number, _opts?: ImageTransformOptions) => {
    return `${STATIC_MEDIA_URL}scaled-fill-${tw}x${th}.png`;
  }
};

export default {} as const;
