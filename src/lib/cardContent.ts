const IMAGE_URL_PATTERN = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

export function isImageContent(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    (/^https?:\/\//i.test(trimmed) && IMAGE_URL_PATTERN.test(trimmed))
  );
}
