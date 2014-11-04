###

ownCloud - Tasks

@author Raimund Schlüßler
@copyright 2013

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

###
angular.module('Tasks').directive 'clickableurl', [ '$compile',
($compile)->
	restrict: 'A'
	scope: {
		clickableurl: '='
	}
	
	link: (scope, element, attr, task) ->
		scope.$watch('clickableurl', (clickableurl) ->
			if !angular.isUndefined(clickableurl)
				url_regex = ///
					(?:\s|^)+				# start with a white-space or start of line (exclude mail)
					(https?://)?			# protocol: http or https
					(([\da-z\-]+\.{1})+		# domain-name
					[a-z]{2,}\.?			# top level domain with optional root label
					[\.\d/\w\-\%=&+\?~#]*)	# url-path
					(?:\s|$)+				# end with white-space
				///gi

				mail_regex = ///
					(?:\s|^)+								# start with a white-space or start of line
					(([\w.!$%&'\*\+-/=\?^`\{\|\}~#])+	# local part
					([@]){1}							# @
					([\da-z\-]+\.{1})+					# domain-name
					[a-z]{2,}\.?)						# top level domain with optional root label
					(?:\s|$)+								# end with white-space
				///gi

				matchs = new Array()

				# find URLs
				while ((match = url_regex.exec(clickableurl)))
					matchs.push match
					url_regex.lastIndex--

				# find email
				while ((match = mail_regex.exec(clickableurl)))
					matchs.push match
					mail_regex.lastIndex--

				# sort by appearance
				matchs.sort((a,b) ->
					if a.index < b.index then return -1
					if a.index > b.index then return 1
					return 0
				)

				element.empty()

				index = 0
				for link in matchs
					if link.index
						element.append(document.createTextNode(
							clickableurl.substring(index, link.index+1)))
					index = link.index + link[0].length

					text = if link.index then link[0].substring(1) else link[0]

					# check if email address
					if link[3] == '@'
						a = $compile('<a href="mailto:' + link[1] + '"
							stop-event="click"></a>')(scope)
						a.text(text)
						element.append(a)
						continue

					# check for defined protocol
					if angular.isUndefined(link[1])
						link[1] = 'http://'

					a = $compile('<a href="' + link[1] +
						link[2] + '"
						target="_blank" stop-event="click"></a>')(scope)
					a.text(text)
					element.append(a)

				# add last lines
				if index < clickableurl.length
					element.append(document.createTextNode(
						clickableurl.substring(index)))
		)
]