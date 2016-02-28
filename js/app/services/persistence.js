/**
 * ownCloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2016 Raimund Schlüßler <raimund.schluessler@googlemail.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

(function() {
  angular.module('Tasks').factory('Persistence', [
	'Request', 'Loading', '$rootScope', '$q', 'CalendarService', function(Request, Loading, $rootScope, $q, CalendarService) {
	  var Persistence;
	  Persistence = (function() {
		function Persistence(_request, _Loading, _$rootScope, _CalendarService) {
		  this._request = _request;
		  this._Loading = _Loading;
		  this._$rootScope = _$rootScope;
		  this._CalendarService = _CalendarService;
		}

		Persistence.prototype.init = function() {
		  var successCallback,
			_this = this;
		  this.deferred = $q.defer();
		  successCallback = function() {
			return _this.deferred.resolve();
		  };
		  this.getCollections();
		  this.getSettings();
		  return this.deferred.promise;
		};

		Persistence.prototype.getCollections = function(onSuccess, showLoading) {
		  var failureCallbackWrapper, params, successCallbackWrapper,
			_this = this;
		  if (showLoading == null) {
			showLoading = true;
		  }
		  onSuccess || (onSuccess = function() {});
		  if (showLoading) {
			this._Loading.increase();
			successCallbackWrapper = function(data) {
			  onSuccess();
			  return _this._Loading.decrease();
			};
			failureCallbackWrapper = function(data) {
			  return _this._Loading.decrease();
			};
		  } else {
			successCallbackWrapper = function(data) {
			  return onSuccess();
			};
			failureCallbackWrapper = function(data) {};
		  }
		  params = {
			onSuccess: successCallbackWrapper,
			onFailure: failureCallbackWrapper
		  };
		  return this._request.get('/apps/tasks/collections', params);
		};

		Persistence.prototype.getSettings = function(onSuccess, showLoading) {
		  var failureCallbackWrapper, params, successCallbackWrapper,
			_this = this;
		  if (showLoading == null) {
			showLoading = true;
		  }
		  onSuccess || (onSuccess = function() {});
		  if (showLoading) {
			this._Loading.increase();
			successCallbackWrapper = function(data) {
			  onSuccess();
			  return _this._Loading.decrease();
			};
			failureCallbackWrapper = function(data) {
			  return _this._Loading.decrease();
			};
		  } else {
			successCallbackWrapper = function(data) {
			  return onSuccess();
			};
			failureCallbackWrapper = function(data) {};
		  }
		  params = {
			onSuccess: successCallbackWrapper,
			onFailure: failureCallbackWrapper
		  };
		  return this._request.get('/apps/tasks/settings', params);
		};

		Persistence.prototype.setVisibility = function(collectionID, visibility) {
		  var params;
		  params = {
			routeParams: {
			  collectionID: collectionID,
			  visibility: visibility
			}
		  };
		  return this._request.post('/apps/tasks/collection/\
			{collectionID}/visibility/{visibility}', params);
		};

		Persistence.prototype.setting = function(type, setting, value) {
		  var params;
		  params = {
			routeParams: {
			  type: type,
			  setting: setting,
			  value: +value
			}
		  };
		  return this._request.post('/apps/tasks/settings/\
			{type}/{setting}/{value}', params);
		};

		Persistence.prototype.getLists = function(onSuccess, showLoading, which) {
		  var failureCallbackWrapper, params, successCallbackWrapper,
			_this = this;
		  if (showLoading == null) {
			showLoading = true;
		  }
		  if (which == null) {
			which = 'all';
		  }
		  onSuccess || (onSuccess = function() {});
		  if (showLoading) {
			this._Loading.increase();
			successCallbackWrapper = function(data) {
			  onSuccess();
			  return _this._Loading.decrease();
			};
			failureCallbackWrapper = function(data) {
			  return _this._Loading.decrease();
			};
		  } else {
			successCallbackWrapper = function(data) {
			  return onSuccess();
			};
			failureCallbackWrapper = function(data) {};
		  }
		  params = {
			onSuccess: successCallbackWrapper,
			onFailure: failureCallbackWrapper,
			routeParams: {
			  request: which
			}
		  };
		  return this._request.get('/apps/tasks/lists', params);
		};

		Persistence.prototype.addList = function(list, onSuccess, onFailure) {
		  var params;
		  if (onSuccess == null) {
			onSuccess = null;
		  }
		  if (onFailure == null) {
			onFailure = null;
		  }
		  onSuccess || (onSuccess = function() {});
		  onFailure || (onFailure = function() {});
		  params = {
			data: {
			  name: list.displayname,
			  tmpID: list.tmpID
			},
			onSuccess: onSuccess,
			onFailure: onFailure
		  };
		  return this._request.post('/apps/tasks/lists/add', params);
		};

		Persistence.prototype.setListName = function(list) {
		  var params;
		  params = {
			routeParams: {
			  listID: list.id
			},
			data: {
			  name: list.displayname
			}
		  };
		  return this._request.post('/apps/tasks/lists/{listID}/name', params);
		};

		Persistence.prototype.deleteList = function(listID) {
		  var params;
		  params = {
			routeParams: {
			  listID: listID
			}
		  };
		  return this._request.post('/apps/tasks/lists/{listID}/delete', params);
		};

		Persistence.prototype.getTasks = function(type, listID, onSuccess, showLoading) {
		  var failureCallbackWrapper, params, successCallbackWrapper,
			_this = this;
		  if (type == null) {
			type = 'init';
		  }
		  if (listID == null) {
			listID = 'all';
		  }
		  if (showLoading == null) {
			showLoading = true;
		  }
		  onSuccess || (onSuccess = function() {});
		  if (showLoading) {
			this._Loading.increase();
			successCallbackWrapper = function(data) {
			  onSuccess();
			  return _this._Loading.decrease();
			};
			failureCallbackWrapper = function(data) {
			  return _this._Loading.decrease();
			};
		  } else {
			successCallbackWrapper = function(data) {
			  return onSuccess();
			};
			failureCallbackWrapper = function(data) {};
		  }
		  params = {
			onSuccess: successCallbackWrapper,
			onFailure: failureCallbackWrapper,
			routeParams: {
			  listID: listID,
			  type: type
			}
		  };
		  return this._request.get('/apps/tasks/tasks/{type}/{listID}', params);
		};

		Persistence.prototype.getTask = function(taskID, onSuccess, showLoading) {
		  var failureCallbackWrapper, params, successCallbackWrapper,
			_this = this;
		  if (showLoading == null) {
			showLoading = true;
		  }
		  onSuccess || (onSuccess = function() {});
		  if (showLoading) {
			this._Loading.increase();
			successCallbackWrapper = function() {
			  onSuccess();
			  return _this._Loading.decrease();
			};
			failureCallbackWrapper = function() {
			  return _this._Loading.decrease();
			};
		  } else {
			successCallbackWrapper = function() {
			  return onSuccess();
			};
			failureCallbackWrapper = function() {};
		  }
		  params = {
			onSuccess: successCallbackWrapper,
			onFailure: failureCallbackWrapper,
			routeParams: {
			  taskID: taskID
			}
		  };
		  return this._request.get('/apps/tasks/task/{taskID}', params);
		};

		Persistence.prototype.setPercentComplete = function(taskID, complete) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  complete: complete
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/percentcomplete', params);
		};

		Persistence.prototype.setPriority = function(taskID, priority) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  priority: priority
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/priority', params);
		};

		Persistence.prototype.setHideSubtasks = function(taskID, hide) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  hide: hide
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/hidesubtasks', params);
		};

		Persistence.prototype.addTask = function(task, onSuccess, onFailure) {
		  var params;
		  if (onSuccess == null) {
			onSuccess = null;
		  }
		  if (onFailure == null) {
			onFailure = null;
		  }
		  onSuccess || (onSuccess = function() {});
		  onFailure || (onFailure = function() {});
		  params = {
			data: {
			  name: task.name,
			  related: task.related,
			  calendarID: task.calendarid,
			  starred: task.starred,
			  due: task.due,
			  start: task.start,
			  tmpID: task.tmpID
			},
			onSuccess: onSuccess,
			onFailure: onFailure
		  };
		  return this._request.post('/apps/tasks/tasks/add', params);
		};

		Persistence.prototype.deleteTask = function(taskID) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/delete', params);
		};

		Persistence.prototype.setDueDate = function(taskID, due) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  due: due
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/due', params);
		};

		Persistence.prototype.setStartDate = function(taskID, start) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  start: start
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/start', params);
		};

		Persistence.prototype.setReminder = function(taskID, reminder) {
		  var params;
		  if (reminder === false) {
			params = {
			  routeParams: {
				taskID: taskID
			  },
			  data: {
				type: false
			  }
			};
		  } else if (reminder.type === 'DATE-TIME') {
			params = {
			  routeParams: {
				taskID: taskID
			  },
			  data: {
				type: reminder.type,
				action: reminder.action,
				date: moment(reminder.date, 'YYYYMMDDTHHmmss').unix()
			  }
			};
		  } else if (reminder.type === 'DURATION') {
			params = {
			  routeParams: {
				taskID: taskID
			  },
			  data: {
				type: reminder.type,
				action: reminder.action,
				week: reminder.duration.week,
				day: reminder.duration.day,
				hour: reminder.duration.hour,
				minute: reminder.duration.minute,
				second: reminder.duration.second,
				invert: reminder.duration.params.invert,
				related: reminder.duration.params.related
			  }
			};
		  } else {
			return;
		  }
		  return this._request.post('/apps/tasks/tasks/{taskID}/reminder', params);
		};

		Persistence.prototype.changeCalendarId = function(taskID, calendarID) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  calendarID: calendarID
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/calendar', params);
		};

		Persistence.prototype.changeParent = function(taskID, related) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  related: related
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/parent', params);
		};

		Persistence.prototype.setTaskName = function(taskID, name) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  name: name
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/name', params);
		};

		Persistence.prototype.setTaskNote = function(taskID, note) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  note: note
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/note', params);
		};

		Persistence.prototype.setShowHidden = function(showHidden) {
		  var params;
		  params = {
			routeParams: {
			  showHidden: +showHidden
			}
		  };
		  return this._request.post('/apps/tasks/settings/showhidden/{showHidden}', params);
		};

		Persistence.prototype.addComment = function(comment, onSuccess, onFailure) {
		  var params;
		  if (onSuccess == null) {
			onSuccess = null;
		  }
		  if (onFailure == null) {
			onFailure = null;
		  }
		  params = {
			routeParams: {
			  taskID: comment.taskID
			},
			data: {
			  comment: comment.comment,
			  tmpID: comment.tmpID
			},
			onSuccess: onSuccess,
			onFailure: onFailure
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/comment', params);
		};

		Persistence.prototype.deleteComment = function(taskID, commentID) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID,
			  commentID: commentID
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/comment/\
			{commentID}/delete', params);
		};

		Persistence.prototype.addCategory = function(taskID, category) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  category: category
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/category/add', params);
		};

		Persistence.prototype.removeCategory = function(taskID, category) {
		  var params;
		  params = {
			routeParams: {
			  taskID: taskID
			},
			data: {
			  category: category
			}
		  };
		  return this._request.post('/apps/tasks/tasks/{taskID}/category/remove', params);
		};

		return Persistence;

	  })();
	  return new Persistence(Request, Loading, $rootScope, CalendarService);
	}
  ]);

}).call(this);
