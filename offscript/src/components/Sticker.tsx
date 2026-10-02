// Vintage scrapbook-style icons, drawn in code so they stay crisp at any size.
// Inspired by the mood board: wax seals, ticket stubs, postcards, lockets,
// vinyl, matchbooks, ribbons, buttons... Use: <Sticker name="postcard" size={40} />
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

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
  | 'goldseal';

// shared colour gradients
function Grads() {
  return (
    <Defs>
      <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#F6E3A1" />
        <Stop offset="0.45" stopColor="#D2AE5C" />
        <Stop offset="1" stopColor="#8A6424" />
      </LinearGradient>
      <LinearGradient id="cream" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FFFBEF" />
        <Stop offset="1" stopColor="#E8DCC0" />
      </LinearGradient>
      <LinearGradient id="kraft" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#E9DCC2" />
        <Stop offset="1" stopColor="#CDBA97" />
      </LinearGradient>
      <RadialGradient id="wax" cx="0.38" cy="0.32" r="0.75">
        <Stop offset="0" stopColor="#B4424A" />
        <Stop offset="0.55" stopColor="#7D1418" />
        <Stop offset="1" stopColor="#4E0709" />
      </RadialGradient>
      <LinearGradient id="maroon" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#A2343A" />
        <Stop offset="1" stopColor="#5C0A0C" />
      </LinearGradient>
      <RadialGradient id="vinyl" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#3A3333" />
        <Stop offset="1" stopColor="#141010" />
      </RadialGradient>
    </Defs>
  );
}

const INK = '#5A4630'; // soft brown outline, like old print

const ART: Record<StickerName, () => React.ReactElement> = {
  goldseal: () => (
    <G>
      <Path
        d="M32 5 C38 6 41 4 46 8 C51 12 55 11 57 17 C59 23 61 27 59 32 C57 38 60 42 56 47 C51 52 50 56 44 57 C38 59 36 61 30 59 C24 57 20 60 15 55 C10 50 7 48 7 41 C6 35 4 32 6 26 C8 20 7 15 13 11 C18 7 24 4 32 5 Z"
        fill="url(#gold)"
        stroke="#8A6424"
        strokeWidth={0.8}
      />
      <Circle cx={32} cy={32} r={18} fill="none" stroke="#8A6424" strokeWidth={1.4} opacity={0.6} />
      <Circle cx={32} cy={32} r={16.5} fill="none" stroke="#FBEFC4" strokeWidth={0.8} opacity={0.7} />
      {/* embossed rose */}
      <Circle cx={32} cy={29} r={6} fill="none" stroke="#8A6424" strokeWidth={1.1} />
      <Path d="M28.5 29 C29 25.5 35 25.5 35.5 29 C35 32 29 32 28.5 29 M30.5 28.5 C31 27 33 27 33.5 28.5" stroke="#8A6424" strokeWidth={0.9} fill="none" />
      <Path d="M32 35 V45 M32 39 C28 36 25 37 24 40 C27 41 30 40 32 39 M32 41 C36 38 39 39 40 42 C37 43 34 42 32 41" stroke="#8A6424" strokeWidth={1} fill="none" />
      <Ellipse cx={22} cy={18} rx={6} ry={3} fill="#fff" opacity={0.35} />
    </G>
  ),

  headphones: () => (
    <G>
      <Path d="M12 36 C12 18 52 18 52 36" stroke="url(#gold)" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Path d="M12 36 C12 20 52 20 52 36" stroke="#8A6424" strokeWidth={1} fill="none" opacity={0.5} />
      <Rect x={6} y={32} width={14} height={20} rx={6} fill="url(#maroon)" stroke="#4E0709" strokeWidth={1} />
      <Rect x={44} y={32} width={14} height={20} rx={6} fill="url(#maroon)" stroke="#4E0709" strokeWidth={1} />
      <Rect x={16} y={34} width={6} height={16} rx={3} fill="url(#cream)" />
      <Rect x={42} y={34} width={6} height={16} rx={3} fill="url(#cream)" />
      <Circle cx={11} cy={37} r={1.6} fill="#F6E3A1" opacity={0.8} />
      <Circle cx={49} cy={37} r={1.6} fill="#F6E3A1" opacity={0.8} />
    </G>
  ),

  postcard: () => (
    <G rotation={-6} origin="32, 32">
      <Rect x={5} y={14} width={54} height={37} rx={2} fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Path d="M33 19 V46" stroke={INK} strokeWidth={0.8} opacity={0.6} />
      <Rect x={47} y={18} width={8} height={10} fill="#9A2A2E" stroke="#F6E3A1" strokeWidth={1} strokeDasharray="1.5 1" />
      <Path d="M37 32 H55 M37 37 H55 M37 42 H55" stroke={INK} strokeWidth={0.7} opacity={0.6} />
      <Path d="M9 21 H24 M9 25 H20" stroke="#9A2A2E" strokeWidth={1.4} strokeLinecap="round" />
      <Circle cx={44} cy={25} r={4.5} stroke={INK} strokeWidth={0.6} fill="none" opacity={0.5} />
    </G>
  ),

  ticket: () => (
    <G rotation={8} origin="32, 32">
      <Path
        d="M6 18 H58 V27 A5 5 0 0 0 58 37 V46 H6 V37 A5 5 0 0 0 6 27 Z"
        fill="url(#kraft)"
        stroke={INK}
        strokeWidth={0.8}
      />
      <Path d="M44 20 V44" stroke={INK} strokeWidth={0.8} strokeDasharray="2 2" opacity={0.7} />
      <Rect x={12} y={23} width={26} height={18} rx={1} fill="none" stroke="#9A2A2E" strokeWidth={1} />
      <Path d="M16 29 H34 M16 33 H30 M16 37 H32" stroke="#9A2A2E" strokeWidth={1.3} strokeLinecap="round" />
      <Path d="M49 24 V40 M52 24 V40" stroke={INK} strokeWidth={1.2} opacity={0.6} />
    </G>
  ),

  waxheart: () => (
    <G>
      <Path
        d="M32 55 C14 43 6 33 8 22 C10 12 22 9 28 15 L32 19 L36 15 C42 9 54 12 56 22 C58 33 50 43 32 55 Z"
        fill="url(#wax)"
      />
      <Path
        d="M32 47 C20 39 15 32 16 25 C17 19 24 17 28 21 L32 25 L36 21 C40 17 47 19 48 25 C49 32 44 39 32 47 Z"
        fill="none"
        stroke="#C9575E"
        strokeWidth={1.4}
        opacity={0.7}
      />
      <Path d="M27 31 C29 27 33 27 33 31 C33 35 37 35 38 31" stroke="#D88A8F" strokeWidth={1.2} fill="none" opacity={0.7} />
      <Ellipse cx={20} cy={20} rx={4} ry={2.5} fill="#fff" opacity={0.25} />
    </G>
  ),

  waxseal: () => (
    <G>
      <Path
        d="M32 5 C38 7 41 4 46 8 C51 12 55 11 57 17 C59 23 62 26 59 32 C57 38 60 42 56 47 C51 52 50 56 44 57 C38 59 36 62 30 59 C24 57 20 60 15 55 C10 50 7 48 7 41 C6 35 3 32 6 26 C9 20 7 15 13 11 C18 7 24 4 32 5 Z"
        fill="url(#wax)"
      />
      <Circle cx={32} cy={32} r={17} fill="none" stroke="#3E0506" strokeWidth={1.5} opacity={0.5} />
      <Circle cx={32} cy={32} r={15} fill="none" stroke="#C9575E" strokeWidth={0.8} opacity={0.5} />
      {/* little gold rose */}
      <Circle cx={32} cy={28} r={5} fill="url(#gold)" />
      <Path d="M29 28 C30 25 34 25 35 28 C34 30 30 30 29 28" stroke="#8A6424" strokeWidth={0.8} fill="none" />
      <Path d="M32 33 V42" stroke="url(#gold)" strokeWidth={1.6} />
      <Path d="M32 37 C29 35 27 36 26 38 C29 39 31 38 32 37 Z M32 39 C35 37 37 38 38 40 C35 41 33 40 32 39 Z" fill="url(#gold)" />
      <Ellipse cx={20} cy={17} rx={5} ry={2.5} fill="#fff" opacity={0.2} />
    </G>
  ),

  locket: () => (
    <G>
      <Path d="M32 4 C27 4 27 11 32 11 C37 11 37 4 32 4" stroke="url(#gold)" strokeWidth={2} fill="none" />
      <Path
        d="M32 58 C15 47 7 37 9 26 C11 16 23 13 29 19 L32 22 L35 19 C41 13 53 16 55 26 C57 37 49 47 32 58 Z"
        fill="url(#gold)"
        stroke="#8A6424"
        strokeWidth={1}
      />
      <Path
        d="M32 50 C21 42 16 36 17 29 C18 23 25 21 29 25 L32 28 L35 25 C39 21 46 23 47 29 C48 36 43 42 32 50 Z"
        fill="none"
        stroke="#8A6424"
        strokeWidth={0.9}
        opacity={0.8}
      />
      <Path d="M24 32 C27 28 30 34 33 30 C36 26 39 32 41 30 M26 38 C29 35 32 40 36 36" stroke="#8A6424" strokeWidth={0.8} fill="none" />
      <Ellipse cx={20} cy={24} rx={4} ry={2} fill="#fff" opacity={0.45} />
    </G>
  ),

  envelope: () => (
    <G rotation={-4} origin="32, 32">
      <Rect x={6} y={16} width={52} height={34} rx={2} fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Path d="M6 17 L32 36 L58 17" fill="#F2E8D0" stroke={INK} strokeWidth={0.8} />
      <Path d="M6 50 L26 32 M58 50 L38 32" stroke={INK} strokeWidth={0.6} opacity={0.4} />
      <Path
        d="M32 43 C26 39 24 36 25 33 C26 30 29 30 31 32 L32 33 L33 32 C35 30 38 30 39 33 C40 36 38 39 32 43 Z"
        fill="url(#wax)"
      />
    </G>
  ),

  swan: () => (
    <G>
      <Path
        d="M8 42 C10 52 30 56 46 52 C56 49 60 42 58 34 C52 38 46 38 40 36 C36 34 34 30 35 24 C36 18 34 12 28 11 C22 10 18 15 21 18 C23 16 27 16 28 20 C30 27 26 32 26 38 C20 36 12 36 8 42 Z"
        fill="url(#cream)"
        stroke={INK}
        strokeWidth={0.9}
      />
      <Path d="M21 18 L15 20 L20 21 Z" fill="#C97A3A" />
      <Circle cx={24.5} cy={15} r={1} fill="#2D120D" />
      <Path d="M30 44 C38 40 46 42 54 38 M28 48 C36 46 44 47 52 44" stroke="#C9A24E" strokeWidth={1} fill="none" opacity={0.8} />
    </G>
  ),

  butterfly: () => (
    <G>
      <Path d="M32 22 C26 8 8 6 8 18 C8 26 18 30 30 32 C18 34 10 40 14 48 C18 56 28 48 32 40" fill="url(#cream)" stroke="url(#gold)" strokeWidth={1.6} />
      <Path d="M32 22 C38 8 56 6 56 18 C56 26 46 30 34 32 C46 34 54 40 50 48 C46 56 36 48 32 40" fill="url(#cream)" stroke="url(#gold)" strokeWidth={1.6} />
      <Path d="M14 18 C18 22 24 26 30 30 M50 18 C46 22 40 26 34 30 M18 46 C22 42 26 38 30 35 M46 46 C42 42 38 38 34 35" stroke="#C9A24E" strokeWidth={0.8} opacity={0.8} />
      <Ellipse cx={32} cy={32} rx={2} ry={11} fill="url(#gold)" />
      <Path d="M31 21 C29 16 27 14 25 13 M33 21 C35 16 37 14 39 13" stroke="#8A6424" strokeWidth={0.9} fill="none" />
    </G>
  ),

  hibiscus: () => (
    <G>
      {[0, 72, 144, 216, 288].map((deg) => (
        <Path
          key={deg}
          d="M32 32 C24 26 20 12 28 8 C32 6 36 6 38 9 C44 14 40 26 32 32 Z"
          fill="url(#maroon)"
          stroke="#4E0709"
          strokeWidth={0.6}
          rotation={deg}
          origin="32, 32"
        />
      ))}
      <Circle cx={32} cy={32} r={5} fill="#4E0709" />
      <Path d="M32 32 L44 20" stroke="url(#gold)" strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={44} cy={20} r={2} fill="url(#gold)" />
      <Circle cx={41} cy={19} r={1.2} fill="#F6E3A1" />
      <Circle cx={45} cy={23} r={1.2} fill="#F6E3A1" />
    </G>
  ),

  bunny: () => (
    <G>
      <Ellipse cx={24} cy={16} rx={5} ry={12} fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Ellipse cx={40} cy={16} rx={5} ry={12} fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Ellipse cx={24} cy={17} rx={2} ry={7} fill="#F2D6D0" />
      <Ellipse cx={40} cy={17} rx={2} ry={7} fill="#F2D6D0" />
      <Ellipse cx={32} cy={50} rx={14} ry={10} fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Ellipse cx={32} cy={34} rx={15} ry={12} fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Circle cx={26} cy={33} r={1.6} fill="#2D120D" />
      <Circle cx={38} cy={33} r={1.6} fill="#2D120D" />
      <Path d="M30 38 L34 40 M34 38 L30 40" stroke="#2D120D" strokeWidth={1} />
      <Ellipse cx={22} cy={39} rx={2.5} ry={1.3} fill="#F2B8B8" opacity={0.6} />
      <Ellipse cx={42} cy={39} rx={2.5} ry={1.3} fill="#F2B8B8" opacity={0.6} />
    </G>
  ),

  clip: () => (
    <G>
      {/* a sheet of paper held by the clip */}
      <Rect x={14} y={30} width={36} height={30} fill="url(#cream)" stroke={INK} strokeWidth={0.8} rotation={-4} origin="32, 45" />
      <Path d="M19 48 H43 M19 53 H38" stroke={INK} strokeWidth={0.6} opacity={0.4} />
      {/* wire handle */}
      <Path d="M22 26 C20 16 18 8 24 6 H40 C46 8 44 16 42 26" fill="none" stroke="#7E5A1E" strokeWidth={3.6} strokeLinecap="round" />
      <Path d="M22 26 C20 16 18 8 24 6 H40 C46 8 44 16 42 26" fill="none" stroke="#F3DC97" strokeWidth={1.6} strokeLinecap="round" />
      {/* body */}
      <Path d="M12 26 H52 L48 42 H16 Z" fill="url(#gold)" stroke="#7E5A1E" strokeWidth={1} />
      <Rect x={11} y={23} width={42} height={6} rx={3} fill="#D9B866" stroke="#7E5A1E" strokeWidth={1} />
      <Path d="M17 31 H47" stroke="#FBEFC4" strokeWidth={1.2} opacity={0.7} />
      <Circle cx={22} cy={26} r={2} fill="#7E5A1E" />
      <Circle cx={42} cy={26} r={2} fill="#7E5A1E" />
    </G>
  ),

  button: () => (
    <G>
      <Circle cx={32} cy={32} r={25} fill="url(#maroon)" stroke="#4E0709" strokeWidth={1} />
      <Circle cx={32} cy={32} r={19} fill="none" stroke="#4E0709" strokeWidth={1.4} opacity={0.6} />
      <Circle cx={32} cy={32} r={18} fill="none" stroke="#B4424A" strokeWidth={0.8} opacity={0.6} />
      {[
        [26, 26],
        [38, 26],
        [26, 38],
        [38, 38],
      ].map(([x, y]) => (
        <Circle key={`${x}${y}`} cx={x} cy={y} r={3} fill="#F4EDDC" stroke="#4E0709" strokeWidth={0.8} />
      ))}
      <Path d="M26 26 L38 38 M38 26 L26 38" stroke="#F4EDDC" strokeWidth={1.4} opacity={0.9} />
      <Ellipse cx={22} cy={18} rx={6} ry={3} fill="#fff" opacity={0.2} />
    </G>
  ),

  vinyl: () => (
    <G>
      <Rect x={4} y={10} width={36} height={44} rx={1} fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Circle cx={36} cy={32} r={22} fill="url(#vinyl)" />
      {[18, 15, 12].map((r) => (
        <Circle key={r} cx={36} cy={32} r={r} fill="none" stroke="#4A4242" strokeWidth={0.5} />
      ))}
      <Circle cx={36} cy={32} r={7} fill="#9A2A2E" />
      <Circle cx={36} cy={32} r={1.3} fill="#141010" />
      <Path d="M24 18 C28 15 32 14 36 14" stroke="#fff" strokeWidth={1} opacity={0.25} fill="none" />
    </G>
  ),

  matchbook: () => (
    <G rotation={-5} origin="32, 32">
      {[16, 22, 28, 34, 40, 46].map((x) => (
        <G key={x}>
          <Rect x={x} y={10} width={3} height={18} fill="#E8D3A8" />
          <Ellipse cx={x + 1.5} cy={10} rx={2.2} ry={3} fill="#8E2A2E" />
        </G>
      ))}
      <Rect x={10} y={24} width={44} height={32} rx={2} fill="url(#maroon)" stroke="#4E0709" strokeWidth={1} />
      <Rect x={10} y={46} width={44} height={5} fill="#3A2A20" />
      <Path d="M10 46 H54" stroke="#F6E3A1" strokeWidth={0.6} opacity={0.6} />
      <Rect x={18} y={30} width={28} height={12} rx={1} fill="none" stroke="#F6E3A1" strokeWidth={0.8} opacity={0.8} />
    </G>
  ),

  bow: () => (
    <G>
      <Path d="M32 30 C22 16 6 14 8 26 C10 36 22 36 32 30 Z" fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Path d="M32 30 C42 16 58 14 56 26 C54 36 42 36 32 30 Z" fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Path d="M30 32 C26 42 20 50 16 58 L22 56 L24 60 C28 50 31 42 32 34 Z" fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Path d="M34 32 C38 42 44 50 48 58 L42 56 L40 60 C36 50 33 42 32 34 Z" fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Path d="M14 22 C18 26 24 28 30 29 M50 22 C46 26 40 28 34 29" stroke="#C9A24E" strokeWidth={0.8} strokeDasharray="1.5 1.5" />
      <Ellipse cx={32} cy={30} rx={5} ry={5} fill="#EFE3C6" stroke={INK} strokeWidth={0.8} />
    </G>
  ),

  coffee: () => (
    <G>
      <Path d="M24 14 C21 10 27 8 24 4 M32 14 C29 10 35 8 32 4 M40 14 C37 10 43 8 40 4" stroke="#B9A88A" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <Ellipse cx={32} cy={52} rx={26} ry={6} fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Path d="M14 20 H50 L46 46 C45 50 40 52 32 52 C24 52 19 50 18 46 Z" fill="url(#cream)" stroke={INK} strokeWidth={0.8} />
      <Path d="M50 26 C60 26 60 40 47 40" stroke={INK} strokeWidth={0.8} fill="none" />
      <Path d="M50 28 C56 28 56 38 48 38" stroke="url(#cream)" strokeWidth={3} fill="none" />
      <Path d="M16 30 H49" stroke="#9A2A2E" strokeWidth={3} />
      <Ellipse cx={32} cy={20} rx={18} ry={3} fill="#6E4A33" />
    </G>
  ),

  books: () => (
    <G>
      <Rect x={10} y={44} width={44} height={10} rx={1} fill="url(#maroon)" stroke="#4E0709" strokeWidth={0.8} />
      <Path d="M12 47 H52" stroke="#F6E3A1" strokeWidth={0.8} />
      <Rect x={14} y={34} width={38} height={10} rx={1} fill="#CDE3E8" stroke={INK} strokeWidth={0.8} />
      <Path d="M18 39 H48" stroke={INK} strokeWidth={0.6} opacity={0.5} />
      <Rect x={12} y={24} width={40} height={10} rx={1} fill="url(#kraft)" stroke={INK} strokeWidth={0.8} />
      <Rect x={40} y={24} width={4} height={10} fill="#9A2A2E" />
      <Path d="M36 24 V8 L40 12 L44 8 V24" fill="url(#gold)" opacity={0.95} />
    </G>
  ),

  sparkle: () => (
    <G>
      <Path d="M32 4 C34 22 42 30 60 32 C42 34 34 42 32 60 C30 42 22 34 4 32 C22 30 30 22 32 4 Z" fill="url(#gold)" stroke="#8A6424" strokeWidth={0.8} />
      <Path d="M50 8 C51 13 53 15 58 16 C53 17 51 19 50 24 C49 19 47 17 42 16 C47 15 49 13 50 8 Z" fill="#CDE3E8" />
    </G>
  ),

  camera: () => (
    <G>
      <Rect x={6} y={18} width={52} height={36} rx={4} fill="url(#kraft)" stroke={INK} strokeWidth={0.8} />
      <Rect x={6} y={26} width={52} height={20} fill="url(#maroon)" />
      <Rect x={22} y={12} width={20} height={8} rx={2} fill="url(#gold)" />
      <Circle cx={32} cy={36} r={12} fill="url(#gold)" stroke="#8A6424" strokeWidth={1} />
      <Circle cx={32} cy={36} r={8} fill="#1E1A1A" />
      <Circle cx={29} cy={33} r={2} fill="#fff" opacity={0.5} />
      <Circle cx={50} cy={22} r={2} fill="#F6E3A1" />
    </G>
  ),
};

export function Sticker({ name, size = 40 }: { name: StickerName; size?: number }) {
  const Art = ART[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Grads />
      <Art />
    </Svg>
  );
}
