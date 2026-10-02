// Realistic scrapbook stickers (wax seals, ticket stubs, postcards, a disco ball...).
// Each one is an image in assets/stickers/, made by scripts/stickers/render.mjs.
// To use a real photo sticker instead, replace that PNG with a square,
// transparent-background PNG of the same name. Use: <Sticker name="postcard" size={40} />
import { Image } from 'react-native';

export type StickerName =
  | 'headphones'
  | 'postcard'
  | 'ticket'
  | 'waxheart'
  | 'waxseal'
  | 'locket'
  | 'envelope'
  | 'swan'
  | 'butterfly'
  | 'hibiscus'
  | 'bunny'
  | 'clip'
  | 'button'
  | 'vinyl'
  | 'matchbook'
  | 'bow'
  | 'coffee'
  | 'books'
  | 'sparkle'
  | 'camera'
  | 'goldseal'
  | 'discoball'
  | 'champagne'
  | 'key'
  | 'seashell'
  | 'star';

const IMAGES: Record<StickerName, number> = {
  headphones: require('../../assets/stickers/headphones.png'),
  postcard: require('../../assets/stickers/postcard.png'),
  ticket: require('../../assets/stickers/ticket.png'),
  waxheart: require('../../assets/stickers/waxheart.png'),
  waxseal: require('../../assets/stickers/waxseal.png'),
  locket: require('../../assets/stickers/locket.png'),
  envelope: require('../../assets/stickers/envelope.png'),
  swan: require('../../assets/stickers/swan.png'),
  butterfly: require('../../assets/stickers/butterfly.png'),
  hibiscus: require('../../assets/stickers/hibiscus.png'),
  bunny: require('../../assets/stickers/bunny.png'),
  clip: require('../../assets/stickers/clip.png'),
  button: require('../../assets/stickers/button.png'),
  vinyl: require('../../assets/stickers/vinyl.png'),
  matchbook: require('../../assets/stickers/matchbook.png'),
  bow: require('../../assets/stickers/bow.png'),
  coffee: require('../../assets/stickers/coffee.png'),
  books: require('../../assets/stickers/books.png'),
  sparkle: require('../../assets/stickers/sparkle.png'),
  camera: require('../../assets/stickers/camera.png'),
  goldseal: require('../../assets/stickers/goldseal.png'),
  discoball: require('../../assets/stickers/discoball.png'),
  champagne: require('../../assets/stickers/champagne.png'),
  key: require('../../assets/stickers/key.png'),
  seashell: require('../../assets/stickers/seashell.png'),
  star: require('../../assets/stickers/star.png'),
};

export function Sticker({ name, size = 40 }: { name: StickerName; size?: number }) {
  return <Image source={IMAGES[name]} style={{ width: size, height: size }} resizeMode="contain" />;
}
