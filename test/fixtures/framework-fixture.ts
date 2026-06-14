import { createFrameworkTest } from '@playwright-framework/fs'
import { LiverpoolPageObjectManager } from '../setup/liverpool-page-object-manager'

export const test = createFrameworkTest(LiverpoolPageObjectManager)