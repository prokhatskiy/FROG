// @flow

import importAll from 'import-all.macro';
import { keyBy } from 'lodash';
import {
  type ActivityPackageT,
  entries,
  values,
  type LearningItemT
} from 'frog-utils';

import { operatorTypes } from './operatorTypes';

const packagesRaw = importAll.sync('../node_modules/ac-*/src/index.js');
export const activityTypesExt = entries(packagesRaw).reduce(
  (acc, [k, v]) => ({ ...acc, [k.split('/')[2]]: v.default }),
  {}
);

const internal = importAll.sync('./internalActivities/*/index.js');

export const activityTypesObj: { [at: string]: ActivityPackageT } = entries(
  internal
).reduce(
  (acc, [k, v]) => ({ ...acc, [k.split('/')[2]]: v.default }),
  activityTypesExt
);

export const activityTypes: ActivityPackageT[] = values(activityTypesObj);

const internalLIs = importAll.sync('./internalLearningItems/*/index.js');

const packageLIs = [...activityTypes, ...operatorTypes].reduce(
  (acc, x) => acc.concat(x.LearningItems || []),
  []
);

export const learningItemTypesObj: {
  [name: string]: LearningItemT<any>
} = keyBy(
  values(internalLIs)
    .map(x => x.default)
    .concat(packageLIs),
  'id'
);
