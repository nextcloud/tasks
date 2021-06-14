import { OC } from './OC.js'

import { config } from '@vue/test-utils'
// eslint-disable-next-line node/no-unpublished-import
import MockDate from 'mockdate'
// eslint-disable-next-line node/no-unpublished-import
import 'regenerator-runtime/runtime'

// Set date to fixed value
MockDate.set(new Date('2019-01-01T12:34:56'))

global.OC = new OC()

// Mock nextcloud translate functions
config.mocks.$t = function(app, string) {
	return string
}
config.mocks.t = config.mocks.$t
global.t = config.mocks.$t

config.mocks.$n = function(app, singular, plural, count) {
	return singular
}
config.mocks.n = config.mocks.$n
global.n = config.mocks.$n

global.OCA = {}
global.OCA.Tasks = {}
global.OCA.Tasks.$t = config.mocks.$t
global.OCA.Tasks.$n = config.mocks.$n

afterAll(() => {
	MockDate.reset()
})
