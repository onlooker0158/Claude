// 示意模型：多巴胺受体激动剂在 D1–D5 上的相对亲和力（0–4 级）与内在活性。
// 亲和力分级综合体外结合研究（Millan 2002 JPET；Scheller 2009 Naunyn-Schmiedeberg's Arch Pharmacol；
// 国内快速卫生技术评估 PMC12753440 的受体选择性描述）。不同实验体系的 Ki 相差可达数十倍，
// 这里只保留排序与量级，不代表精确数值。

export const RECEPTORS = [
  { id: "D1", family: 1, g: "Gs/Golf", where: "纹状体直接通路 MSN（突触后）" },
  { id: "D5", family: 1, g: "Gs/Golf", where: "海马、丘脑等，纹状体少量" },
  { id: "D2", family: 2, g: "Gi/o", where: "间接通路 MSN、黑质多巴胺能末梢（自身受体）" },
  { id: "D3", family: 2, g: "Gi/o", where: "伏隔核等边缘区，纹状体腹侧" },
  { id: "D4", family: 2, g: "Gi/o", where: "前额叶皮层，纹状体极少" },
];

// level: 0 不结合 … 4 很强；eff: 内在活性（1 = 完全激动，<1 = 部分激动）
export const DRUGS = [
  {
    id: "da",
    name: "多巴胺",
    note: "内源递质，作参照：五种受体都能完全激活",
    level: { D1: 2, D5: 3, D2: 3, D3: 4, D4: 3 },
    eff: { D1: 1, D5: 1, D2: 1, D3: 1, D4: 1 },
  },
  {
    id: "ppx",
    name: "普拉克索",
    note: "非麦角类，D3 ＞ D2 ＞ D4，几乎不作用于 D1/D5",
    level: { D1: 0, D5: 0, D2: 3, D3: 4, D4: 2 },
    eff: { D1: 0, D5: 0, D2: 1, D3: 1, D4: 1 },
  },
  {
    id: "rop",
    name: "罗匹尼罗",
    note: "非麦角类，D3 ＞ D2，D4 很弱，几乎不作用于 D1/D5",
    level: { D1: 0, D5: 0, D2: 3, D3: 4, D4: 1 },
    eff: { D1: 0, D5: 0, D2: 1, D3: 1, D4: 1 },
  },
  {
    id: "rot",
    name: "罗替高汀",
    note: "透皮贴剂，D3 最强，D2/D4/D5 次之，D1 也有作用",
    level: { D1: 2, D5: 3, D2: 3, D3: 4, D4: 3 },
    eff: { D1: 1, D5: 1, D2: 1, D3: 1, D4: 1 },
  },
  {
    id: "pir",
    name: "吡贝地尔",
    note: "D2/D3 部分激动，对 D4 为拮抗，另有 α2 受体拮抗作用",
    level: { D1: 0, D5: 0, D2: 3, D3: 3, D4: 0 },
    eff: { D1: 0, D5: 0, D2: 0.55, D3: 0.6, D4: 0 },
  },
];

// 激活程度 0..1（示意）：结合等级 × 内在活性
export const activation = (drug, id) => (drug.level[id] / 4) * drug.eff[id];

export const LEVEL_WORD = ["不结合", "弱", "中", "强", "很强"];

export function receptorLine(drug, receptor) {
  const a = activation(drug, receptor.id);
  const pct = Math.round(a * 100);
  if (drug.level[receptor.id] === 0) {
    const anti = drug.id === "pir" && receptor.id === "D4" ? "（拮抗，不激活）" : "";
    return `${receptor.id} · ${drug.name} 不激动${anti}`;
  }
  const effect = receptor.family === 1 ? "cAMP↑ → PKA → DARPP-32" : "cAMP↓ · GIRK 开 · Ca²⁺ 通道关";
  return `${receptor.id} · ${receptor.g} · ${effect} · 激活 ${pct}%`;
}

export function drugLine(drug) {
  const tiers = [];
  for (let level = 4; level >= 1; level--) {
    const ids = RECEPTORS.filter((r) => drug.level[r.id] === level).map((r) => r.id);
    if (ids.length) tiers.push(ids.join("≈"));
  }
  return `${drug.name} · ${tiers.join(" ＞ ")}`;
}
