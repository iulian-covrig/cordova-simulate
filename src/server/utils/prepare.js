// Copyright (c) Microsoft Corporation. All rights reserved.

var exec = require('child_process').exec,
    Q = require('q'),
    log = require('./log');

/**
 * @param {string} projectRoot
 * @param {string} platform
 * @return {Promise}
 */
function execCordovaPrepare(projectRoot, platform) {
    return retryAsync(getExecCordovaPrepareImpl(projectRoot, platform), 2);
}

function getExecCordovaPrepareImpl(projectRoot, platform) {
    return function () {
        var deferred = Q.defer();

        log.log('Preparing platform \'' + platform + '\'.');

        exec('cordova prepare ' + platform, {
            cwd: projectRoot
        }, function (err, stdout, stderr) {
            if (err || stderr) {
                deferred.reject(err || stderr);
            } else {
                deferred.resolve();
            }
        });

        return deferred.promise;
    };
}

function retryAsync(promiseFunc, maxTries, delay, iteration) {
    delay = delay || 100;
    iteration = iteration || 1;

    return promiseFunc().catch(function (err) {
        if (iteration < maxTries) {
            return Q.delay(delay)
                .then(function () {
                    return retryAsync(promiseFunc, maxTries, delay, iteration + 1);
                });
        }

        return Q.reject(err);
    });
}

module.exports.execCordovaPrepare = execCordovaPrepare;
