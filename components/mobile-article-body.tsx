import type { TextStyle } from 'react-native';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';

export type MobileTextAlign = 'center' | 'right';

export type MobileRichSpan = { text: string; bold?: boolean; color?: string; url?: string };

export type MobileTableCell = {
  text: string;
  header: boolean;
  align?: MobileTextAlign;
  spans?: MobileRichSpan[];
};

export type MobileBlock =
  | { type: 'heading'; level: number; text: string; spans?: MobileRichSpan[]; align?: MobileTextAlign }
  | { type: 'paragraph'; text: string; spans?: MobileRichSpan[]; align?: MobileTextAlign }
  | { type: 'image'; url: string; alt?: string; caption?: string }
  | { type: 'list'; ordered: boolean; items: string[]; align?: MobileTextAlign }
  | { type: 'quote'; text: string; spans?: MobileRichSpan[]; align?: MobileTextAlign }
  | { type: 'table'; rows: MobileTableCell[][] };

/** Espaces compressés, sans trim (fragments riches). */
function squeeze(s: string): string {
  return s.replace(/\u00a0/g, ' ').replace(/\t+/g, ' ').replace(/[ \f\v]+/g, ' ');
}

function plainLine(text: string): string {
  return squeeze(text).replace(/\n{3,}/g, '\n\n').trim();
}

function textAlignStyle(align: MobileTextAlign | undefined): { textAlign: 'center' | 'right' | 'left' } | undefined {
  if (align === 'center' || align === 'right') {
    return { textAlign: align };
  }
  return undefined;
}

/** Sous-<Text> centrés : le parent doit prendre toute la largeur. */
function alignStretch(align?: MobileTextAlign): { width: '100%'; alignSelf: 'stretch' } | undefined {
  return align === 'center' || align === 'right' ? { width: '100%', alignSelf: 'stretch' } : undefined;
}

function richPiece(outer: TextStyle, s: MobileRichSpan, i: number, normalWeight: '400' | '700') {
  const color = s.url ? (s.color ?? '#5b7fd4') : (s.color ?? (outer.color as string | undefined));
  return (
    <Text
      key={i}
      accessibilityRole={s.url ? 'link' : undefined}
      onPress={s.url ? () => void Linking.openURL(s.url!).catch(() => {}) : undefined}
      style={{
        fontSize: outer.fontSize,
        lineHeight: outer.lineHeight,
        fontStyle: outer.fontStyle,
        fontWeight: s.bold ? '700' : normalWeight,
        ...(color ? { color } : {}),
        ...(s.url ? { textDecorationLine: 'underline' } : {}),
      }}
    >
      {squeeze(s.text)}
    </Text>
  );
}

function renderRichLine(
  key: number | string,
  outer: TextStyle,
  text: string,
  spans: MobileRichSpan[] | undefined,
  align?: MobileTextAlign,
  normalWeight: '400' | '700' = '400',
) {
  const line = [outer, textAlignStyle(align), alignStretch(align)];
  if (!spans?.length) {
    return (
      <Text key={key} style={line}>
        {plainLine(text)}
      </Text>
    );
  }
  return (
    <Text key={key} style={line}>
      {spans.map((s, i) => richPiece(outer, s, i, normalWeight))}
    </Text>
  );
}

function linePlain(text: string | undefined, spans?: MobileRichSpan[]): string {
  if (spans?.length) {
    return spans.map((s) => s.text ?? '').join('');
  }
  return text ?? '';
}

function cellPlain(cell: MobileTableCell): string {
  if (cell.spans?.length) {
    return cell.spans.map((s) => s.text ?? '').join('');
  }
  return cell.text ?? '';
}

/** Texte brut concaténé pour recherche plein texte (hors mise en forme). */
export function blocksToPlainSearchText(blocks: MobileBlock[] | null | undefined): string {
  if (!blocks?.length) {
    return '';
  }
  const parts: string[] = [];
  for (const block of blocks) {
    if (!block || typeof block !== 'object' || !('type' in block)) {
      continue;
    }
    try {
      switch (block.type) {
        case 'heading':
        case 'paragraph':
        case 'quote':
          parts.push(linePlain(block.text, block.spans));
          break;
        case 'image':
          if (block.alt) {
            parts.push(block.alt);
          }
          if (block.caption) {
            parts.push(block.caption);
          }
          break;
        case 'list':
          if (Array.isArray(block.items)) {
            parts.push(...block.items);
          }
          break;
        case 'table':
          if (Array.isArray(block.rows)) {
            for (const row of block.rows) {
              if (!Array.isArray(row)) {
                continue;
              }
              for (const cell of row) {
                if (cell && typeof cell === 'object') {
                  parts.push(cellPlain(cell));
                }
              }
            }
          }
          break;
        default:
          break;
      }
    } catch {
      /* bloc mal formé : on ignore */
    }
  }
  return parts.join('\n');
}

function renderBlock(block: MobileBlock, index: number) {
  switch (block.type) {
    case 'heading': {
      const size = block.level <= 2 ? 20 : block.level === 3 ? 18 : 16;
      return renderRichLine(
        index,
        { ...styles.heading, fontSize: size, fontWeight: '700' },
        block.text,
        block.spans,
        block.align,
        '400',
      );
    }
    case 'paragraph':
      return renderRichLine(index, styles.paragraph, block.text, block.spans, block.align);
    case 'image':
      return (
        <View key={index} style={styles.mediaWrap}>
          <Image
            source={{ uri: block.url }}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel={block.alt}
          />
          {block.caption ? <Text style={styles.caption}>{plainLine(block.caption)}</Text> : null}
        </View>
      );
    case 'list':
      return (
        <View key={index} style={styles.list}>
          {block.items.map((line, i) => (
            <Text key={i} style={[styles.listItem, textAlignStyle(block.align)]}>
              {block.ordered ? `${i + 1}. ` : '• '}
              {plainLine(line)}
            </Text>
          ))}
        </View>
      );
    case 'quote':
      return (
        <View key={index} style={[styles.quote, block.align === 'center' && styles.quoteCenter]}>
          {renderRichLine(`${index}-q`, styles.quoteText, block.text, block.spans, block.align, '400')}
        </View>
      );
    case 'table': {
      const last = block.rows.length - 1;
      return (
        <View key={index} style={styles.table}>
          {block.rows.map((row, ri) => (
            <View key={ri} style={[styles.tableRow, ri < last ? styles.tableRowSep : null]}>
              {row.map((cell, ci) => {
                const base = [styles.tableCellText, cell.header ? styles.tableCellTextHeader : null];
                return (
                  <View key={ci} style={[styles.tableCell, cell.header ? styles.tableCellHeader : null]}>
                    <Text style={[...base, textAlignStyle(cell.align), alignStretch(cell.align)]}>
                      {!cell.spans?.length
                        ? plainLine(cell.text)
                        : cell.spans.map((s, i) =>
                            richPiece(
                              {
                                ...styles.tableCellText,
                                ...(cell.header ? styles.tableCellTextHeader : {}),
                              },
                              s,
                              i,
                              '400',
                            ),
                          )}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      );
    }
    default:
      return null;
  }
}

type Props = { blocks: MobileBlock[] };

export function MobileArticleBody({ blocks }: Props) {
  if (!blocks?.length) {
    return <Text style={styles.empty}>Contenu indisponible.</Text>;
  }
  return <>{blocks.map((b, i) => renderBlock(b, i))}</>;
}

const styles = StyleSheet.create({
  heading: { fontWeight: '700', color: '#5f5173', marginTop: 14, marginBottom: 8 },
  paragraph: { fontSize: 15, color: '#333', lineHeight: 24, marginBottom: 12 },
  mediaWrap: { marginBottom: 16 },
  image: { width: '100%', height: 220, backgroundColor: '#e8ebe7', borderRadius: 8 },
  caption: { fontSize: 12, color: '#666', marginTop: 6, fontStyle: 'italic' },
  list: { marginBottom: 12, paddingLeft: 4 },
  listItem: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 6 },
  quote: {
    borderLeftWidth: 4,
    borderLeftColor: '#8d3a74',
    paddingLeft: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingVertical: 10,
    paddingRight: 8,
    borderRadius: 6,
  },
  quoteCenter: { borderLeftWidth: 0, paddingLeft: 8 },
  quoteText: { fontSize: 15, color: '#444', fontStyle: 'italic', lineHeight: 22 },
  table: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c8c4ce',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: { flexDirection: 'row' },
  tableRowSep: { borderBottomWidth: 1, borderBottomColor: '#e6e2ea' },
  tableCell: { flex: 1, paddingVertical: 8, paddingHorizontal: 6, justifyContent: 'center' },
  tableCellHeader: { backgroundColor: 'rgba(141, 58, 116, 0.12)' },
  tableCellText: { fontSize: 14, color: '#333', lineHeight: 20 },
  tableCellTextHeader: { fontWeight: '700', color: '#5f5173' },
  empty: { fontSize: 15, color: '#666', fontStyle: 'italic' },
});
