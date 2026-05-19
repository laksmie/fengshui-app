
const KUA_DIRECTIONS: Record<number, { favorables: string[]; defavorables: string[] }> = {
  1: { favorables: ['SE','E','S','N'],   defavorables: ['O','NO','NE','SO'] },
  2: { favorables: ['NE','O','NO','SO'], defavorables: ['SE','E','S','N']   },
  3: { favorables: ['S','N','SE','E'],   defavorables: ['SO','NO','O','NE'] },
  4: { favorables: ['N','S','E','SE'],   defavorables: ['NO','SO','NE','O'] },
  6: { favorables: ['O','NE','SO','NO'], defavorables: ['E','SE','N','S']   },
  7: { favorables: ['NO','SO','NE','O'], defavorables: ['N','SE','S','E']   },
  8: { favorables: ['SO','NO','O','NE'], defavorables: ['S','N','SE','E']   },
  9: { favorables: ['E','SE','N','S'],   defavorables: ['NE','O','SO','NO'] },
};

export default KUA_DIRECTIONS;