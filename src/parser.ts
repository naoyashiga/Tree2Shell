// src/parser.ts

/**
 * ツリー構造内のファイルorディレクトリエントリを表す型
 */
interface TreeEntry {
  name: string;  // ファイルまたはディレクトリ名
  depth: number; // 何段階の深さか (0=ルート)
  isFile: boolean;
}

/**
 * 1行を解析し、名前と深さを返す。
 * 例: "   └─ main.ts" → { name: "main.ts", depth: 1, isFile: true }
 */
function parseLine(line: string): Omit<TreeEntry, "isFile"> {
  // インデント部分を正規表現などで解析 (ここでは「半角スペース3つ = depth1」として扱う簡易例)
  // 実際には "├─" などの文字を除去しつつ、先頭のスペース数 / 3 くらいで depth を計算
  const match = line.match(/^(\s*)[├└]─\s*(.*)$/);
  if (!match) {
    // ルート行など、「├─」が無い場合があるので、そこではdepth=0として扱う
    return {
      name: line.trim(),
      depth: 0,
    };
  }
  const spaces = match[1] ?? "";
  const trimmedName = match[2]?.trim() ?? "";
  // depthの計算(3スペース = 1階層) くらいの簡易処理
  const depth = Math.floor(spaces.length / 3);

  return {
    name: trimmedName,
    depth: depth,
  };
}

/**
 * 複数行をまとめてパースして TreeEntry[] を返す
 */
export function extractEntries(input: string): TreeEntry[] {
  const lines = input
    .split("\n")
    .map((l) => l.trimEnd()) // 行末の空白は除去
    .filter((l) => l.length > 0); // 空行除去

  const entries: TreeEntry[] = lines.map((line, index) => {
    const base = parseLine(line);

    // ファイルかどうかは 拡張子があるか/最後が '.' で終わるか 等をゆるくチェック
    const isFile = /\.\w+$/.test(base.name);

    return {
      name: base.name,
      depth: base.depth,
      isFile,
    };
  });

  return entries;
}

/**
 * TreeEntry[] から mkdir / touch コマンドのリストを生成
 */
export function buildCommands(entries: TreeEntry[]): string {
  // pathStack[depth] = そのdepthにおけるディレクトリ名
  const pathStack: string[] = [];

  let commands: string[] = [];

  for (const entry of entries) {
    // depth が小さくなったらスタックを切り詰める
    pathStack.splice(entry.depth, pathStack.length - entry.depth, entry.name);

    // パス例: "my-scraping-project/src/main.ts"
    const fullPath = pathStack.join("/");

    if (entry.isFile) {
      // ファイルの場合: 必要な親ディレクトリを mkdir しておいて touch
      // たとえば2階層以上ある場合、本来は都度 mkdir -p する必要がある
      // ここではまとめて `mkdir -p dir/dir2` → `touch dir/dir2/file` とする
      const parentDir = pathStack.slice(0, -1).join("/");
      if (parentDir) {
        commands.push(`mkdir -p ${parentDir}`);
      }
      commands.push(`touch ${fullPath}`);
    } else {
      // ディレクトリの場合: mkdir -p
      commands.push(`mkdir -p ${fullPath}`);
    }
  }

  // 重複コマンドを除去したい場合は Set などを使う
  // ここではシンプルに全部出力
  // unique化するなら ↓ のようにする
  // commands = Array.from(new Set(commands));

  return commands.join("\n");
}

/**
 * ツリー文字列をまるごと解析して、コマンド群を返すメイン関数
 */
export function parseTree(input: string): string {
  const entries = extractEntries(input);
  const commands = buildCommands(entries);
  return commands;
}
