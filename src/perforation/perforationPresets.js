export const perforations = {
  none: {
    label: 'No perforation',
    openArea: 0,
    structurePenalty: 0,
    distribution: {}
  },
  mothTechStyle: {
    label: 'MothTech-style body mapped',
    openArea: 0.12,
    structurePenalty: 0.15,
    distribution: { chest: 0.12, upperBack: 0.16, lowerBack: 0.1, underarm: 0.18, shoulders: 0.07, abdomen: 0.06, neck: 0.04 }
  },
  diyPunch: {
    label: 'DIY punched holes',
    openArea: 0.1,
    structurePenalty: 0.28,
    distribution: { chest: 0.14, upperBack: 0.14, lowerBack: 0.08, underarm: 0.08, shoulders: 0.04, abdomen: 0.07, neck: 0.03 }
  },
  microGrid: {
    label: 'Micro grid perforation',
    openArea: 0.08,
    structurePenalty: 0.08,
    distribution: { chest: 0.08, upperBack: 0.08, lowerBack: 0.08, underarm: 0.08, shoulders: 0.08, abdomen: 0.08, neck: 0.04 }
  },
  spineVent: {
    label: 'Spine vent strip',
    openArea: 0.07,
    structurePenalty: 0.1,
    distribution: { upperBack: 0.18, lowerBack: 0.16, neck: 0.06, chest: 0.02, abdomen: 0.02, underarm: 0.04, shoulders: 0.03 }
  },
  largeCutouts: {
    label: 'Large cut-outs',
    openArea: 0.22,
    structurePenalty: 0.42,
    distribution: { chest: 0.22, upperBack: 0.25, lowerBack: 0.2, underarm: 0.22, shoulders: 0.16, abdomen: 0.18, neck: 0.08 }
  }
};
