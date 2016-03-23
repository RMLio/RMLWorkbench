var method = ScheduleManager.prototype;
var schedule = require('node-schedule');

function ScheduleManager() {
	this._session;
}

method.loadSession = function(session) {
	this._session = session;
}

method.schedule = function(date) {
	schedule.scheduleJob(date, function() {

	});
}

module.exports = ScheduleManager;