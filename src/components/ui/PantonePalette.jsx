import { colors } from '@/theme';

const swatches = [
  { color: colors.pantone.blue, name: 'Cobalt' },
  { color: colors.pantone.pink, name: 'Mauve' },
  { color: colors.pantone.orange, name: 'Tangerine' },
  { color: colors.pantone.green, name: 'Fern' },
];

export default function PantonePalette({ label = 'Pantone Feels' }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <span className="font-serif italic text-navy text-sm">{label}</span>
      <div className="flex gap-3">
        {swatches.map((s) => (
          <span
            key={s.name}
            title={s.name}
            aria-label={s.name}
            className="w-4 h-4 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: s.color }}
          />
        ))}
      </div>
    </div>
  );
}
