import VueTestUtils from '@vue/test-utils'
import { OC } from './OC.js'

global.OC = new OC()

// Mock nextcloud translate functions
VueTestUtils.config.mocks.$t = function(app, string) {
	return string
}
VueTestUtils.config.mocks.t = VueTestUtils.config.mocks.$t
global.t = VueTestUtils.config.mocks.$t

VueTestUtils.config.mocks.$n = function(app, singular, plural, count) {
	return singular
}
VueTestUtils.config.mocks.n = VueTestUtils.config.mocks.$n
global.n = VueTestUtils.config.mocks.$n
