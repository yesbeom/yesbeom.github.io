// 물질명 알파벳순 정렬. iupac 필드는 축약어/관용명 프리셋의 정식 명칭 표기용 (없으면 라벨이 곧 정식 명칭).
export const moleculePresets = [
  { id: "acetic-acid", label: "Acetic acid", smiles: "CC(=O)O" },
  { id: "acetone", label: "Acetone", smiles: "CC(C)=O" },
  { id: "aniline", label: "Aniline", smiles: "Nc1ccccc1" },
  { id: "aspirin", label: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O" },
  { id: "benzene", label: "Benzene", smiles: "c1ccccc1" },
  { id: "benzoyl-fluoride", label: "Benzoyl fluoride", smiles: "O=C(F)c1ccccc1" },
  {
    id: "bna",
    label: "BNA",
    smiles: "OC(=O)c1cccc(COC(=O)CC=C)c1[N+](=O)[O-]",
    iupac: "3-((But-3-enoyloxy)methyl)-2-nitrobenzoic acid",
  },
  { id: "caffeine", label: "Caffeine", smiles: "Cn1cnc2c1c(=O)n(C)c(=O)n2C" },
  {
    id: "diazirine",
    label: "Diazirine (Ph/CF₃)",
    smiles: "FC(F)(F)C1(c2ccccc2)N=N1",
    iupac: "3-Phenyl-3-(trifluoromethyl)-3H-diazirine",
  },
  {
    id: "dma3p",
    label: "(DMA)₃P",
    smiles: "CN(C)P(N(C)C)N(C)C",
    iupac: "Tris(dimethylamino)phosphine",
  },
  { id: "ethanol", label: "Ethanol", smiles: "CCO" },
  { id: "fluoromethane", label: "Fluoromethane", smiles: "CF" },
  {
    id: "gpc",
    label: "GPC (lecithin head)",
    smiles: "OCC(O)COP(=O)([O-])OCC[N+](C)(C)C",
    iupac: "sn-Glycero-3-phosphocholine",
  },
  {
    id: "octadec-9-enedioic-acid",
    label: "Octadec-9-enedioic acid",
    smiles: "OC(=O)CCCCCCC/C=C/CCCCCCCC(=O)O",
  },
  {
    id: "oleic-acid",
    label: "Oleic acid",
    smiles: "CCCCCCCC/C=C\\CCCCCCCC(=O)O",
    iupac: "(Z)-Octadec-9-enoic acid",
  },
  {
    id: "oleylamine",
    label: "Oleylamine",
    smiles: "CCCCCCCC/C=C\\CCCCCCCCN",
    iupac: "(Z)-Octadec-9-en-1-amine",
  },
  { id: "phenol", label: "Phenol", smiles: "Oc1ccccc1" },
  {
    id: "sulfobetaine-c18",
    label: "Sulfobetaine (C18)",
    smiles: "CCCCCCCCCCCCCCCCCC[N+](C)(C)CCCS(=O)(=O)[O-]",
    iupac: "3-(N,N-Dimethyloctadecylammonio)propane-1-sulfonate",
  },
  { id: "water", label: "Water", smiles: "O" },
];

export const DEFAULT_MOLECULE_PRESET_ID = "bna";
