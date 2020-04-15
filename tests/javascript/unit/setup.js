import { config } from '@vue/test-utils'
import { OC } from './OC.js'
import moment from '@nextcloud/moment'
// eslint-disable-next-line node/no-unpublished-import
import MockDate from 'mockdate'

// Set date to fixed value
MockDate.set(moment('20190101T123456', 'YYYYMMDDTHHmmss'))

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
