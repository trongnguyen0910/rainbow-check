export default function Avatar({ name = '', color = '#3B82F6', size = 'md' }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizes = {
    sm:  'w-7 h-7 text-xs',
    md:  'w-9 h-9 text-sm',
    lg:  'w-12 h-12 text-base',
    xl:  'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  return (
    <div
      className={`${sizes[size] || sizes.md} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
