// Minimal dBASE III reader for the documented BORIS-NRW DBF export.
// Geometry is intentionally not downloaded into the website bundle.
export function readDbf(bytes, encoding = 'windows-1252') {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getUint32(4, true),
    headerLength = view.getUint16(8, true),
    recordLength = view.getUint16(10, true);
  if (
    headerLength < 33 ||
    recordLength < 2 ||
    headerLength + count * recordLength > bytes.length + 1
  )
    throw new Error('Invalid DBF header');
  const decoder = new TextDecoder(encoding),
    fields = [];
  let offset = 1;
  for (let pos = 32; pos < headerLength - 1 && bytes[pos] !== 13; pos += 32) {
    const name = decoder
      .decode(bytes.subarray(pos, pos + 11))
      .replace(/\0.*$/, '')
      .trim();
    const length = bytes[pos + 16];
    fields.push({ name, length, offset });
    offset += length;
  }
  const rows = [];
  for (let n = 0; n < count; n++) {
    const start = headerLength + n * recordLength;
    if (bytes[start] === 42) continue;
    const row = {};
    for (const field of fields)
      row[field.name] = decoder
        .decode(bytes.subarray(start + field.offset, start + field.offset + field.length))
        .trim();
    rows.push(row);
  }
  return rows;
}
