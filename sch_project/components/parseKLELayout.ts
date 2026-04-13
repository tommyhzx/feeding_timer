import type { KLELayout, ParsedKey, KLEKeyProperties } from "./types";

const KEY_SIZE = 19.05; // Standard keycap size in mm

const refDesMap: Record<string, string> = {
  "~": "K_TILDE",
  "~`": "K_TILDE",
  "!": "K_EXCLAMATION",
  "@": "K_AT",
  "#": "K_HASH",
  $: "K_DOLLAR",
  "%": "K_PERCENT",
  "^": "K_CARET",
  "&": "K_AMPERSAND",
  "*": "K_ASTERISK",
  "(": "K_LPAREN",
  ")": "K_RPAREN",
  "{": "K_LBRACE",
  "}": "K_RBRACE",
  "|": "K_PIPE",
  "[": "K_LSQBRAK",
  "]": "K_RSQBRAK",
  '"': "K_QUOTE",
  "'": "K_SINGLEQUOTE",
  "<": "K_LT",
  ">": "K_GT",
  "?": "K_QUESTION",
  "/": "K_SLASH",
  windows: "K_WINDOWS",
  win: "K_WINDOWS",
  menu: "K_MENU",
  "caps lock": "K_CAPSLOCK",
  ":": "K_COLON",
  ";": "K_SEMICOLON",
  backspace: "K_BACKSPACE",
  tab: "K_TAB",
  " ": "K_SPACE",
  enter: "K_ENTER",
  shift: "K_SHIFT",
  ctrl: "K_CTRL",
  alt: "K_ALT",
  escape: "K_ESCAPE",
  esc: "K_ESCAPE",
  arrowleft: "K_ARROW_LEFT",
  arrowright: "K_ARROW_RIGHT",
  arrowup: "K_ARROW_UP",
  arrowdown: "K_ARROW_DOWN",
  backquote: "K_BACKQUOTE",
  quote: "K_QUOTE",
  semicolon: "K_SEMICOLON",
  comma: "K_COMMA",
  period: "K_PERIOD",
  slash: "K_SLASH",
  backslash: "K_BACKSLASH",
  bracketleft: "K_BRACKET_LEFT",
  bracketright: "K_BRACKET_RIGHT",
};

function getRefDesForKey(key: string): string {
  const normKeyLabels = key.toLowerCase().split("\n");
  for (const normKeyLabel of normKeyLabels) {
    if (normKeyLabel in refDesMap) {
      return refDesMap[normKeyLabel];
    }
  }
  if (key === "") {
    return "K_SPACE";
  }
  if (key.match(/^[a-zA-Z0-9]+$/)) {
    return `K_${key.toUpperCase()}`;
  }
  return `K_${key.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
}

interface ParseState {
  x: number;
  y: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
  width2: number;
  height2: number;
  rotation_angle: number;
  rotation_x: number;
  rotation_y: number;
  stepped: boolean;
  decal: boolean;
}

export function parseKLELayout(layout: KLELayout): ParsedKey[] {
  const keys: ParsedKey[] = [];
  let current: ParseState = {
    x: 0,
    y: 0,
    x2: 0,
    y2: 0,
    width: 1,
    height: 1,
    width2: 1,
    height2: 1,
    rotation_angle: 0,
    rotation_x: 0,
    rotation_y: 0,
    stepped: false,
    decal: false,
  };
  let cluster = { x: 0, y: 0 };
  const nameCounters = new Map<string, number>();

  for (let r = 0; r < layout.length; r++) {
    const row = layout[r];
    let colIndex = 0;

    for (let k = 0; k < row.length; k++) {
      const item = row[k];

      if (typeof item === "string") {
        // 空字符串表示占位，跳过但增加 colIndex
        if (item === "") {
          current.x += current.width;
          current.width = current.height = 1;
          colIndex++;
          continue;
        }

        let refDes = getRefDesForKey(item);

        if (nameCounters.has(refDes)) {
          const ogKey = keys.find((k) => k.name === refDes);
          if (ogKey) {
            ogKey.name = `${refDes}${nameCounters.get(refDes)}`;
          }
          nameCounters.set(refDes, nameCounters.get(refDes)! + 1);
          refDes = `${refDes}${nameCounters.get(refDes)}`;
        } else {
          nameCounters.set(refDes, 1);
        }

        const newKey: ParsedKey = {
          name: refDes,
          x: (current.x + current.width / 2) * KEY_SIZE,
          y: -(current.y + current.height / 2) * KEY_SIZE,
          width: current.width * KEY_SIZE,
          height: current.height * KEY_SIZE,
          rotation: current.rotation_angle,
          rotationX: current.rotation_x * KEY_SIZE,
          rotationY: -current.rotation_y * KEY_SIZE,
          row: r,
          col: colIndex,
        };

        keys.push(newKey);

        // Reset for next key
        current.x += current.width;
        current.width = current.height = 1;
        current.x2 = current.y2 = current.width2 = current.height2 = 0;
        current.stepped = current.decal = false;
        colIndex++;
      } else {
        // Property object
        const props = item as KLEKeyProperties;

        if (props.r !== undefined) {
          if (k !== 0) throw new Error("'r' can only be used on the first key in a row");
          current.rotation_angle = props.r;
        }
        if (props.rx !== undefined) {
          if (k !== 0) throw new Error("'rx' can only be used on the first key in a row");
          current.rotation_x = props.rx;
          current.x = cluster.x = props.rx;
        }
        if (props.ry !== undefined) {
          if (k !== 0) throw new Error("'ry' can only be used on the first key in a row");
          current.rotation_y = props.ry;
          current.y = cluster.y = props.ry;
        }
        if (props.a !== undefined) {
          props.a; // alignment property, no-op for now
        }
        if (props.x) {
          current.x += props.x;
        }
        if (props.y) {
          current.y += props.y;
        }
        if (props.w) {
          current.width = current.width2 = props.w;
        }
        if (props.h) {
          current.height = current.height2 = props.h;
        }
      }
    }

    // End of row
    current.y++;
    current.x = current.rotation_x;
  }

  return keys;
}