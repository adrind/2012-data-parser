var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Q = require('q');

var formatViolations = function() {
	var pathName = path.join(__dirname, '../data/Violations-2012.csv');
	var dataMap;
	var numOfViolations = {};
	var earliestViolation = {};
	var latestViolation = {};
	var deferred = Q.defer();

	fs.readFile(pathName, 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}

		dataMap = data.split(/\n/);

		_.each(dataMap, function(el, i){
			if(i != 0) {
				var dataLine = el.split(',');
				var violationDate = Date.parse(dataLine[3]);
				var violation = dataLine[2];

				numOfViolations[violation] = numOfViolations[violation] ? numOfViolations[violation] + 1 : 1;

				if(earliestViolation[violation]) {
					if(earliestViolation[violation] > violationDate) {
						earliestViolation[violation] = violationDate;
					}
				} else {
					earliestViolation[violation] = violationDate;
				}

				if(latestViolation[violation]) {
					if(latestViolation[violation] < violationDate) {
						latestViolation[violation] = violationDate;
					}
				} else {
					latestViolation[violation] = violationDate;
				}
			}

		});
		_.each(earliestViolation, function(val, k){
			var dateTime = new Date(val).toDateString();
			earliestViolation[k] = dateTime;
		});

		_.each(latestViolation, function(val, k){
			var dateTime = new Date(val).toDateString();
			latestViolation[k] = dateTime;
		});

		deferred.resolve({
			'numOfViolations' : numOfViolations,
			'earliestViolation' : earliestViolation,
			'latestViolation' : latestViolation
		});

	});

	return deferred.promise;
}

/* GET home page. */
router.get('/', function(req, res, next) {
	formatViolations().then(function(data){
		res.render('index', { violations: data.numOfViolations, earliestViolation: data.earliestViolation, latestViolation: data.latestViolation });
	});
});

module.exports = router;
