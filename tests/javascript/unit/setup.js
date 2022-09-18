import { OC } from './OC.js'

// eslint-disable-next-line n/no-unpublished-import
import MockDate from 'mockdate'
// eslint-disable-next-line n/no-unpublished-import
import 'regenerator-runtime/runtime'

// Set date to fixed value
MockDate.set(new Date('2019-01-01T12:34:56'))

global.OC = new OC()

// Mock nextcloud translate functions
global.t = function(app, string) {
	return string
}

global.n = function(app, singular, plural, count) {
	return singular
}

global.OCA = {}
global.OCA.Tasks = {}

afterAll(() => {
	MockDate.reset()
})
