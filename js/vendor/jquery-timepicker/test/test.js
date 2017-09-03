/*global module, test, expect */
/*global ok, equal, deepEqual, start, stop */

/**
 * ======== A Handy Little QUnit Reference ========
 * http://docs.jquery.com/QUnit
 * Test methods:
 *   expect(numAssertions)
 *   stop(increment)
 *   start(decrement)
 * Test assertions:
 *   ok(value, [message])
 *   equal(actual, expected, [message])
 *   notEqual(actual, expected, [message])
 *   deepEqual(actual, expected, [message])
 *   notDeepEqual(actual, expected, [message])
 *   strictEqual(actual, expected, [message])
 *   notStrictEqual(actual, expected, [message])
 *   raises(block, [expected], [message])
 */

/* jQuery 1.4 queue - needed when testing with previos versions of jQuery */

// XXX: I think the tests can be rewritten to avoid using jQuery's queue
if (jQuery.fn.jquery < '1.4') {
    (function(jQuery) {

        jQuery.extend({
            queue: function( elem, type, data ) {
                if ( !elem ) {
                    return;
                }

                type = (type || 'fx') + 'queue';
                var q = jQuery.data( elem, type );

                // Speed up dequeue by getting out quickly if this is just a lookup
                if ( !data ) {
                    return q || [];
                }

                if ( !q || jQuery.isArray(data) ) {
                    q = jQuery.data( elem, type, jQuery.makeArray(data) );

                } else {
                    q.push( data );
                }

                return q;
            },

            dequeue: function( elem, type ) {
                type = type || 'fx';

                var queue = jQuery.queue( elem, type ), fn = queue.shift();

                // If the fx queue is dequeued, always remove the progress sentinel
                if ( fn === 'inprogress' ) {
                    fn = queue.shift();
                }

                if ( fn ) {
                    // Add a progress sentinel to prevent the fx queue from being
                    // automatically dequeued
                    if ( type === 'fx' ) {
                        queue.unshift('inprogress');
                    }

                    fn.call(elem, function() {
                        jQuery.dequeue(elem, type);
                    });
                }
            }
        });

        jQuery.fn.extend({
            queue: function( type, data ) {
                if ( typeof type !== 'string' ) {
                    data = type;
                    type = 'fx';
                }

                if ( data === undefined ) {
                    return jQuery.queue( this[0], type );
                }
                return this.each(function(/*i*/) {
                    var queue = jQuery.queue( this, type, data );

                    if ( type === 'fx' && queue[0] !== 'inprogress' ) {
                        jQuery.dequeue( this, type );
                    }
                });
            },
            dequeue: function( type ) {
                return this.each(function() {
                    jQuery.dequeue( this, type );
                });
            },

            // Based off of the plugin by Clint Helfers, with permission.
            // http://blindsignals.com/index.php/2009/07/jquery-delay/
            delay: function( time, type ) {
                time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
                type = type || 'fx';

                return this.queue( type, function() {
                    var elem = this;
                    setTimeout(function() {
                        jQuery.dequeue( elem, type );
                    }, time );
                });
            },

            clearQueue: function( type ) {
                return this.queue( type || 'fx', [] );
            }
        });

    })(jQuery);
}


/* jQuery Timepicker Tests */
(function($) {
    $(function() {
        var system = $({}),
            delay = 100, // ms
            teardown;

        teardown = function() {
            var instance = $('#timepicker').data('TimePicker');

            if (instance) {
                instance.destroy();
            }
        };


        module('TimePicker API', { teardown: teardown });

        test('timepicker instance', function() {
            var timepicker = $('#timepicker').timepicker(),
                instance = timepicker.timepicker();
            ok(typeof instance.widget !== 'undefined', 'Get access to the instance object.');
        });

        test('timepicker destroy', function() {
            var timepicker = $('#timepicker').timepicker();
            ok(timepicker.data('TimePicker') !== null, 'TimePicker instance exists.');
            timepicker.timepicker().destroy();
            ok(timepicker.data('TimePicker') === null, 'TimePicker instance no longer exists.');
        });

        test('chainable methods: next, previous open, close, destroy', function() {
            var timepicker = $('#timepicker').timepicker(),
                instance = timepicker.timepicker(),
                object = null;

            object = instance.open();
            ok(object.jquery, 'open() method returns a jQuery instance.');

            object = timepicker.timepicker('next');
            ok(object.jquery, 'next() method returns a jQuery instance.');

            object = timepicker.timepicker('previous');
            ok(object.jquery, 'previous() method returns a jQuery instance.');

            object = instance.close();
            ok(object.jquery, 'close() method returns a jQuery instance.');

            object = instance.destroy();
            ok(object.jquery, 'destroy() method returns a jQuery instance.');
        });

        test('selected, first, last', function() {
            var timepicker = $('#timepicker').timepicker(),
                instance = timepicker.timepicker(),
                selected = false,
                expected = 5;

            expect(expected);
            stop();

            system.queue('test', []);
            system.queue('test', function(next) {
                selected = instance.selected();
                ok(selected === null, 'No item is selected at the beginning!.');
                timepicker.simulate('keydown', {keyCode: $.TimePicker.prototype.keyCode.DOWN});
                next();
            });

            system.delay(delay, 'test');
            system.queue('test', function(next) {
                selected = instance.selected();
                ok(selected !== null, 'An element is selected after the DOWN key is pressed.');
                ok(instance.first(), 'That element is the first element.');
                timepicker.simulate('keydown', {keyCode: $.TimePicker.prototype.keyCode.UP});
                next();
            });

            system.delay(delay, 'test');
            system.queue('test', function(next) {
                selected = instance.selected();
                ok(selected !== null, 'Another element is selected after the UP key is pressed.');
                ok(instance.last(), 'That element is the last element.');
                next();
            });

            system.queue('test', function(/*next*/) { start(); }).dequeue('test');
        });

        test('parse', function() {
            var timepicker = $('#timepicker').timepicker(),
                instance = timepicker.timepicker(),
                now = new Date(),
                value, parsed, result, expected, message, k, n, t;

            function time(hours, minutes, seconds) {
                hours = hours || 0;
                minutes = minutes || 0;
                seconds = seconds || 0;

                var t = new Date();
                t.setTime(now.valueOf());
                t.setHours(hours, minutes, seconds, 0, 0);

                return t;
            }

            var input = ['1', time(1),
                         '11', time(11),
                         '111', time(1, 11),
                         '1234', time(12, 34),
                         '12345', time(1, 23, 45),
                         '123456', time(12, 34, 56),
                         '441234', time(4, 41, 23),
                         '4412345', time(4, 41, 23),
                         '44123456', time(4, 41, 23),
                         '441234567', time(4, 41, 23),
                         '446161', time(4, 46, 16),
                         '6666', time(7, 07, 0),
                         '66666', time(7, 07, 06),
                         '666666', time(7, 07, 06),
                         '6666666', time(7, 07, 06),
                         '46', time(5),
                         ':1', time(10),
                         ':2', time(20),
                         ':3', time(3),
                         ':4', time(4),
                         ':5', time(5),
                         ':6', time(6),
                         ':7', time(7),
                         ':8', time(8),
                         ':9', time(9),
                         ':12', time(12),
                         ':123', time(1, 23),
                         ':1234', time(12, 34),
                         ':12345', time(1, 23, 45),
                         ':123456', time(12, 34, 56),
                         ':1234567', time(12, 34, 56),
                         ':61', time(6, 10),
                         ':62', time(6, 20),
                         ':1261', time(13, 1),
                         ':1271', time(13, 11),
                         '1:7', time(1, 7),
                         '2:8', time(2, 8),
                         '3:9', time(3, 9),
                         '1:1', time(1, 10),
                         '6:1', time(6, 10),
                         '1:6', time(2),
                         '7:1', time(7, 10),
                         '8:60', time(9),
                         '8:59', time(8, 59),
                         '7:35', time(7, 35),
                         '3:45', time(3, 45),
                         '10:7', time(10, 7),
                         '21:08', time(21, 8),
                         '10:10', time(10, 10),
                         '10:60', time(10, 60),
                         '10:1', time(10, 10),
                         '10:3', time(10, 30),
                         '10:5', time(10, 50),
                         '12:77', time(13, 17),
                         '6:0660', time(6, 7),
                         '6:032', time(6,3,20),
                         '1:23', time(1, 23),
                         '2:345', time(2, 34, 50),
                         '3:4567', time(3, 46, 7),
                         '4:56012', time(4, 56, 1),
                         '123:4', time(1, 23, 4),
                         '1234:5', time(12, 34, 5),
                         '123:45', time(1, 23, 45),
                         '1234:56', time(12, 34, 56),
                         '1:2:3', time(1,2,3),
                         '1:2:30', time(1,2,30),
                         '10:2:30', time(10,2,30),
                         '1:20:30', time(1,20,30),
                         '11:15:03', time(11,15,3),
                         undefined, null];

            for (k = 0, n = input.length; k < n; k = k+2) {
                value = input[k];
                expected = input[k+1];
                t = instance.parse(value);
                result = t ? time(t.getHours(), t.getMinutes(), t.getSeconds()) : false;
                parsed = result ? result.toLocaleTimeString() : false;
                message = expected ? expected.toLocaleTimeString() : 'false';

                equal(result ? result.toLocaleTimeString() : null, expected ? expected.toLocaleTimeString() : null, 'Input: ' + value);
                // ok(result >= expected && result <= expected, 'Input:' + value + ' | Parsed: ' + parsed + ' | Expected: ' + message);
            }
        });

        test('format', function() {
            var timepicker = $('#timepicker').timepicker(),
                instance = timepicker.timepicker(),
                time = new Date(1988, 8, 24, 19, 30, 0),
                k, n, formats, result, format, expected;

            formats = [['hh:mm:ss p', '07:30:00 PM'],
                       ['hh:mm:ss a', '07:30:00 pm'],
                       ['HH:mm:ss', '19:30:00'],
                       ['h:m:s p', '7:30:0 PM'],
                       ['h:m:s a', '7:30:0 pm'],
                       ['H:m:s', '19:30:0']];

            for (k = 0, n = formats.length; k < n; k = k + 1) {
                format = formats[k][0];
                expected = formats[k][1];
                result = instance.format(time, format);

                ok(result === expected, 'Object: ' + time.toLocaleTimeString() + ' | Format: ' + format + ' | Result: ' + result);
            }
        });

        test('getTime/setTime', function() {
            var element = $('#timepicker').timepicker({
                    'timeFormat': 'hh:mm p'
                }),
                instance = element.timepicker(),
                date = new Date(0,0,0,12,50,34),
                object = null;

            object = instance.setTime(date);
            ok(object.jquery, 'setTime() method returns a jQuery instance');
            equal(element.val(), '12:50 PM', 'passing a Date object to setTime.');

            equal(instance.getTime().toLocaleTimeString(), date.toLocaleTimeString(), 'getTime return the time set by setTime using a Date object.');

            element.timepicker('setTime', '1:20p');
            equal(element.val(), '01:20 PM', 'passing a string to setTime.');

            date = new Date(0,0,0,13,20,0);
            equal(instance.getTime().toLocaleTimeString(), date.toLocaleTimeString(), 'getTime returns the time set by setTime using a string.');

            date = new Date(0,0,0,13,30,0);
            equal(element.val('1:30 PM').timepicker('getTime').toLocaleTimeString(), date.toLocaleTimeString(), 'getTime returns the time set by jQuery.fn.val.');
        });

        test('option', function() {
            var element = $('#timepicker').timepicker({
                    'timeFormat': 'hh:mm p'
                }),
                instance = element.timepicker();

            instance.setTime('11:40');

            equal(instance.option('timeFormat'), 'hh:mm p', 'timeFormat: value succesfully retrieved (instance).');

            instance.option('timeFormat', 'h p');
            equal(instance.format(instance.getTime()), '11 AM', 'timeFormat: value succesfully updated (instance).');
            equal(element.val(), '11 AM', 'timeFormat: input field value was properly updated with the new format (instance).');

            equal(element.timepicker('option', 'timeFormat'), 'h p', 'timeFormat: value succesfully retrieved (plugin).');

            element.timepicker('option', 'timeFormat', 'h:mm p');
            equal(instance.format(instance.getTime()), '11:40 AM', 'timeFormat: value succesfully updated (plugin).');
            equal(element.val(), '11:40 AM', 'timeFormat: input field value was properly updated with the new format (plugin).');
        });


        module('TimePicker Options', { teardown: teardown });

        test('defaultTime:string', function() {
            var timepicker = $('#timepicker').timepicker({ defaultTime: '10p', timeFormat: 'hh:mm:ss a' });

            equal(timepicker.val(), '10:00:00 pm', 'A default time can be passed in the `defaultTime` option.');
            deepEqual(timepicker.timepicker('getTime'), new Date(0, 0, 0, 22, 0, 0), 'A default time can be passed in the `defaultTime` option.');
        });

        test('defaultTime:Date', function() {
            var now = new Date(), timepicker;

            now = new Date(0, 0, 0, now.getHours(), now.getMinutes(), now.getSeconds());
            timepicker = $('#timepicker').timepicker({ defaultTime: now, timeFormat: 'hh:mm:ss a' });

            deepEqual(timepicker.timepicker('getTime'), now, 'A default time can be passed in the `defaultTime` option.');
        });

        test('defaultTime:now', function() {
            var now = new Date(), timepicker;

            now = new Date(0, 0, 0, now.getHours(), now.getMinutes(), now.getSeconds());
            timepicker = $('#timepicker').timepicker({ defaultTime: 'now', timeFormat: 'hh:mm:ss a' });

            deepEqual(timepicker.timepicker('getTime'), now, 'A default time can be passed in the `defaultTime` option.');
        });

        test('minTime', function() {
            var timepicker, instance;

            timepicker = $('#timepicker').timepicker({ minTime: '2p' });
            instance = timepicker.timepicker();

            timepicker.val('13:59:59');
            equal(instance.getTime(), null, 'An invalid time cannot be set using $.fn.val().');

            timepicker.val('2p');
            deepEqual(instance.getTime(), new Date(0, 0, 0, 14, 0, 0), 'A time equal to minTime can be set using $.fn.val().');
        });

        test('interval', function() {
            var timepicker, instance;
            timepicker = $('#timepicker').timepicker({ interval:30, timeFormat: 'h' });
            instance = timepicker.timepicker();

            ok(instance.options.interval === 30, 'interval was properly set to 30.');
            timepicker.focus();
            ok(instance.options.interval === 60, 'interval was changed to 60, because the timeFormat does not include m or mm.');
            timepicker.blur();

            instance.option('interval', 90);
            timepicker.focus();
            ok(instance.options.interval === 120, 'interval was changed to 120, after the interval was updated, because the timeFormat does not include m or mm.');
            timepicker.blur();

            instance.option('interval', 45);
            instance.option('timeFormat', 'hh:mm');
            timepicker.focus();
            ok(instance.options.interval === 45, 'interval was not changed to 60, after the interval and timeFormat were updated, because the timeFormat includes m or mm.');
            timepicker.blur();
        });

        test('dropdown', function() {
            var timepicker, instance;
            timepicker = $('#timepicker').timepicker({ dropdown: false });
            instance = timepicker.timepicker();
            timepicker.focus();
            ok(instance.closed(), 'dropdown is not opened if dropdown was set to false.');
            timepicker.blur();

            instance.option('dropdown', true);
            timepicker.focus();
            ok(!instance.closed(), 'dropdown is opened if dropdown was set to true.');
        });

        test('callbacks', function() {
            var expected = 1, timepicker;

            timepicker = $('#timepicker').timepicker({
                change: function(/*time*/) {
                    ok(true, 'change() callback executed.');
                    start();
                }
            });

            expect(expected);
            stop();

            timepicker.val('46').change();
        });



        module('TimePicker Event Handlers');

        test('opened/closed', function() {
            var timepicker = $('#timepicker').timepicker(),
                instance = timepicker.timepicker(),
                selected = null,
                expected = 10;

            expect(expected);
            stop();

            system.queue('test', []);
            system.queue('test', function(next) {
                ok(instance.closed(), 'TimePicker starts closed.');
                timepicker.focus();
                next();
            });

            system.delay(delay, 'test');
            system.queue('test', function(next) {
                ok(!instance.closed(), 'TimePicker opens when input field gains focus.');
                timepicker.simulate('keydown', {keyCode: 65});
                next();
            });

            system.delay(delay, 'test');
            system.queue('test', function(next) {
                ok(instance.closed(), 'TimePicker is closed after the \'a\' key is pressed.');
                timepicker.simulate('keydown', {keyCode: $.TimePicker.prototype.keyCode.DOWN});
                next();
            });

            system.delay(delay, 'test');
            system.queue('test', function(next) {
                ok(!instance.closed(), 'TimePicker opens when DOWN key is pressed.');
                selected = instance.selected();
                timepicker.simulate('keydown', {keyCode: 65});
                timepicker.simulate('keydown', {keyCode: $.TimePicker.prototype.keyCode.UP});
                next();
            });

            system.delay(delay, 'test');
            system.queue('test', function(next) {
                ok(!instance.closed(), 'TimePicker opens when UP key is pressed.');
                selected = instance.selected();
                timepicker.simulate('keydown', {keyCode: $.TimePicker.prototype.keyCode.ENTER});
                next();
            });

            system.delay(delay, 'test');
            system.queue('test', function(next) {
                ok(instance.closed(), 'TimePicker is closed after an item has been selected pressing ENTER key.');
                ok(selected !== null, 'An element is selected after the DOWN key is pressed.');
                ok(selected ? timepicker.val() === selected.text() : false, 'The value in the input field is the text of the selected item.');

                timepicker.focus();
                timepicker.simulate('blur');

                next();
            }, 50);

            system.delay(300, 'test');
            system.queue('test', function(next) {
                ok(!instance.closed(), 'TimePicker is not closed after blur event. It requires a click outside the form element.');

                instance.widget.ui.find('a').first().simulate('click');

                next();
            });

            system.delay(delay, 'test');
            system.queue('test', function(next) {
                ok(instance.closed(), 'TimePicker is closed after click event.');
                next();
            });

            system.queue('test', function(/*next*/) { start(); }).dequeue('test');
        });
    });
})(jQuery);
