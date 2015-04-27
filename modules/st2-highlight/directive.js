/*global Prism:true*/
'use strict';

angular.module('main')
  .directive('st2Highlight', function ($filter) {

    function getType(string) {
      try {
        var o = JSON.parse(string);

        if (!o || typeof o !== 'object') {
          throw new Error();
        }

        return 'json';
      } catch (e) {}

      if (_.isString(string)) {
        return 'string';
      }

      return 'object';
    }

    function postLink(scope, element) {
      var shortElement = element[0].querySelector('.st2-highlight__well code')
        , fullElement = element[0].querySelector('.st2-highlight__fullscreen code');

      var LINES_TO_SHOW = scope.lines ? parseInt(scope.lines) : 5;

      scope.$watch('code', function (code) {

        if (!code) {
          return;
        }

        var string = (function () {
          if (scope.language && Prism.languages[scope.language]) {
            return Prism.highlight(code, Prism.languages[scope.language]);
          } else {
            var type = getType(code);

            if (type === 'json') {
              return Prism.highlight(code, Prism.languages['javascript']);
            }

            if (type === 'string') {
              return code.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#'+i.charCodeAt(0)+';';
              });
            }

            if (type === 'object') {
              return Prism.highlight($filter('json')(code, 2), Prism.languages['javascript']);
            }
          }

        })();

        var shortString;

        if (!scope.full) {
          var lines = string.split('\n');

          if (lines[lines.length - 1] === '') {
            lines.pop();
          }

          scope.lines_more = lines.length - LINES_TO_SHOW;

          if (scope.lines_more > 0) {
            lines = lines.slice(0,LINES_TO_SHOW);
          }

          shortString = lines.join('\n');
        }

        if (shortString) {
          shortElement.innerHTML = shortString;
          fullElement.innerHTML = string;
        } else {
          shortElement.innerHTML = string;
        }

      });
    }

    return {
      restrict: 'C',
      scope: {
        code: '=',
        full: '@',
        lines: '@',
        language: '@'
      },
      templateUrl: 'modules/st2-highlight/template.html',
      link: postLink
    };

  });
