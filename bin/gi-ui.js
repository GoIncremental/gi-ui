angular.module('gi.ui', ['gi.util']);

angular.module('gi.ui').directive('giModal', [
  function() {
    return {
      restrict: 'E',
      scope: {
        title: '@',
        visible: '=',
        cancelClass: '@'
      },
      transclude: true,
      templateUrl: '/views/modal.html',
      controller: [
        '$scope', '$element', '$transclude', function($scope, $element, $transclude) {
          return $transclude(function(clone) {
            var bodyBlock, cancelButton, footerBlock, headerBlock, transcludedBody, transcludedFooter, transcludedHeader;
            headerBlock = $element.find('div.modal-header');
            transcludedHeader = clone.filter('div.header');
            angular.forEach(transcludedHeader, function(e) {
              return headerBlock.append(angular.element(e));
            });
            bodyBlock = $element.find('div.modal-body');
            transcludedBody = clone.filter('div.body');
            angular.forEach(transcludedBody, function(e) {
              return bodyBlock.append(angular.element(e));
            });
            footerBlock = $element.find('div.modal-footer');
            transcludedFooter = clone.filter('div.footer');
            angular.forEach(transcludedFooter, function(e) {
              return footerBlock.append(angular.element(e));
            });
            if ($scope.cancelClass != null) {
              cancelButton = $element.find('div.modal-footer button');
              cancelButton.addClass($scope.cancelClass);
            }
            $element.addClass('modal fade');
            $element.modal({
              show: false,
              backdrop: 'static',
              keyboard: false
            });
            $scope.$watch('visible', function(value) {
              var showModal;
              showModal = value ? 'show' : 'hide';
              return $element.modal(showModal);
            });
            return $scope.hide = function() {
              return $scope.visible = false;
            };
          });
        }
      ]
    };
  }
]);

angular.module('gi.ui').directive('giDtproperty', [
  '$compile', '$timeout', function($compile, $timeout) {
    return {
      restrict: 'A',
      compile: function(element, attrs) {
        var body;
        body = '{{item.' + attrs.giDtproperty + '}}';
        element.append(body);
        return function() {};
      }
    };
  }
]);

angular.module('gi.ui').directive('giDtbutton', [
  '$compile', function($compile) {
    return {
      restrict: 'A',
      compile: function(element, attrs) {
        var body;
        body = '<button class="btn btn-info" ng-click="click()">' + attrs.text + '</button>';
        element.append(body);
        return function(scope, elem, attrs) {
          return scope.click = function() {
            return scope.$emit(attrs.event, scope.item[attrs.arg]);
          };
        };
      }
    };
  }
]);

angular.module('gi.ui').directive('giDtfilter', [
  '$compile', function($compile) {
    return {
      restrict: 'A',
      compile: function(element, attrs) {
        var body;
        body = '{{item | ' + attrs.giDtfilter + '}}';
        element.append(body);
        return function() {};
      }
    };
  }
]);

angular.module('gi.ui').directive('giDtpropertyfilter', [
  '$compile', function($compile) {
    return {
      restrict: 'A',
      compile: function(element, attrs) {
        var body;
        body = '{{item.' + attrs.giDtpropertyfilter + '}}';
        element.append(body);
        return function() {};
      }
    };
  }
]);

angular.module('gi.ui').controller('giDtItemController', [
  '$scope', '$element', function($scope, $element) {
    return $scope.$watch(function() {
      return $scope.columns;
    }, function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $element.children().remove();
        render($element, $scope);
        return $compile($element.contents())($scope);
      }
    }, true);
  }
]);

angular.module('gi.ui').directive('giDtItem', [
  '$compile', function($compile) {
    var createAttrList, createTdProperty, render;
    createAttrList = function(attrsObj) {
      var key, res, value;
      res = "";
      for (key in attrsObj) {
        value = attrsObj[key];
        if (value != null) {
          res += key + '="' + value + '" ';
        } else {
          res += key + ' ';
        }
      }
      return res;
    };
    createTdProperty = function(attrsObj) {
      return angular.element('<table><tr><td ' + createAttrList(attrsObj) + ' ></td></tr></table>').find('td');
    };
    render = function(element, scope) {
      var attrsObj, column, html, _i, _len, _ref, _results;
      _ref = scope.columns;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        column = _ref[_i];
        if (column.visible) {
          html = null;
          attrsObj = {};
          switch (column.type) {
            case 'gi-dtproperty':
            case 'gi-dtfilter':
            case 'gi-dtpropertyfilter':
              attrsObj[column.type] = column.property;
              break;
            case 'gi-dtbutton':
              attrsObj[column.type] = null;
              attrsObj.text = column.text;
              attrsObj.event = column.eventName;
              attrsObj.arg = column.property;
          }
          html = $compile(createTdProperty(attrsObj))(scope);
          _results.push(element.append(html));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    return {
      restrict: 'A',
      scope: {
        item: '=',
        columns: '='
      },
      controller: 'giDtItemController',
      compile: function() {
        return function(scope, element) {
          return render(element, scope);
        };
      }
    };
  }
]);

angular.module('gi.ui').directive('giDatatable', [
  '$filter', '$timeout', '$compile', function($filter, $timeout, $compile) {
    return {
      restrict: 'E',
      templateUrl: '/views/dataTable.html',
      scope: {
        items: '=',
        options: '='
      },
      link: function($scope, elem, attrs) {
        var aPromise, calculateCountMessage, groupToPages, refresh, selectionChanged;
        aPromise = null;
        $scope.filteredItems = [];
        $scope.groupedItems = [];
        $scope.itemsPerPage = 20;
        $scope.pagedItems = [];
        $scope.currentPage = 0;
        $scope.selectAll = "All";
        $scope.$watch('items.length', function() {
          return refresh();
        });
        $scope.$watch('query', function() {
          if (aPromise) {
            $timeout.cancel(aPromise);
          }
          aPromise = $timeout(refresh, 500);
          return aPromise;
        });
        $scope.$watch('currentPage', function() {
          return calculateCountMessage();
        });
        calculateCountMessage = function() {
          var end, start, total, _ref, _ref1;
          if (($scope.currentPage != null) && ($scope.items != null) && ($scope.pagedItems != null)) {
            start = $scope.currentPage * $scope.itemsPerPage + 1;
            end = $scope.currentPage * $scope.itemsPerPage;
            if (((_ref = $scope.pagedItems[$scope.currentPage]) != null ? _ref.length : void 0) != null) {
              end = start + ((_ref1 = $scope.pagedItems[$scope.currentPage]) != null ? _ref1.length : void 0) - 1;
            } else {
              start = 0;
              end = 0;
            }
            total = $scope.filteredItems.length;
            return $scope.countMessage = "Showing " + start + " to " + end + " of " + total;
          } else {
            return $scope.countMessage = "";
          }
        };
        groupToPages = function() {
          var i, thing, _i, _len, _ref, _results;
          if ($scope.filteredItems != null) {
            $scope.pagedItems = [];
            _ref = $scope.filteredItems;
            _results = [];
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              thing = _ref[i];
              if (i % $scope.itemsPerPage === 0) {
                _results.push($scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [$scope.filteredItems[i]]);
              } else {
                _results.push($scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]));
              }
            }
            return _results;
          }
        };
        refresh = function() {
          var sortDir;
          if ($scope.options.customSearch) {
            $scope.filteredItems = $scope.search({
              query: $scope.query
            });
          } else {
            $scope.filteredItems = $filter('filter')($scope.items, function(item) {
              var found;
              if (!$scope.query) {
                return true;
              }
              found = false;
              angular.forEach($scope.options.columns, function(column) {
                var filterName, filterProperty, searchString, splits;
                if (!found) {
                  if (column.search) {
                    switch (column.type) {
                      case 'gi-dtproperty':
                        searchString = "";
                        if (item[column.property] != null) {
                          searchString = item[column.property].toString();
                        }
                        if ($filter('lowercase')(searchString).indexOf($filter('lowercase')($scope.query)) !== -1) {
                          return found = true;
                        }
                        break;
                      case 'gi-dtfilter':
                        if ($filter('lowercase')($filter(column.property)(item)).indexOf($filter('lowercase')($scope.query)) !== -1) {
                          return found = true;
                        }
                        break;
                      case 'gi-dtpropertyfilter':
                        splits = column.property.split('|');
                        filterName = splits[1].replace(/\s/g, '');
                        filterProperty = splits[0].replace(/\s/g, '');
                        if ($filter('lowercase')($filter(filterName)(item[filterProperty])).indexOf($filter('lowercase')($scope.query)) !== -1) {
                          return found = true;
                        }
                    }
                  }
                }
              });
              return found;
            });
          }
          if ($scope.options.sortProperty) {
            if ($scope.options.sortDirection === "asc") {
              sortDir = false;
            } else {
              sortDir = true;
            }
            $scope.filteredItems = $filter('orderBy')($scope.filteredItems, function(item) {
              return item[$scope.options.sortProperty];
            }, sortDir);
          }
          if ($scope.options.customSort) {
            $scope.filteredItems = $scope.sort({
              items: $scope.filteredItems
            });
          }
          $scope.currentPage = 0;
          groupToPages();
          calculateCountMessage();
          $scope.options.refreshRequired = false;
        };
        selectionChanged = function(item) {
          $scope.$emit('selectionChanged', item);
          if (!$scope.options.multi) {
            angular.forEach($scope.items, function(other) {
              if (item._id !== other._id) {
                return other.selected = false;
              }
            });
          }
          return $scope.selectedItems = $filter('filter')($scope.items, function(item) {
            return item.selected;
          });
        };
        $scope.toggleSelectAll = function() {
          if ($scope.selectAll === "All") {
            angular.forEach($scope.items, function(item) {
              return item.selected = true;
            });
            $scope.selectedItems = $scope.items;
            return $scope.selectAll = "None";
          } else {
            angular.forEach($scope.items, function(item) {
              return item.selected = false;
            });
            $scope.selectedItems = [];
            return $scope.selectAll = "All";
          }
        };
        $scope.selectRow = function(item) {
          var eventName;
          item.selected = !item.selected;
          selectionChanged(item);
          eventName = 'row-selected';
          if ($scope.options.rowSelectedEvent != null) {
            eventName = $scope.options.rowSelectedEvent;
          }
          return $scope.$emit(eventName, item);
        };
        $scope.selectAllClick = function(e, item) {
          e.stopPropagation();
          return selectionChanged(item);
        };
        $scope.range = function(currentPage) {
          var end, max, num, result, start, _i;
          max = $scope.pagedItems.length - 1;
          if (max < 1) {
            return [];
          }
          end = max > currentPage + 1 ? currentPage + 2 : void 0;
          start = currentPage - 2;
          if (currentPage < 3) {
            start = 0;
            if (max > 3) {
              end = 4;
            }
          }
          if (currentPage > max - 3) {
            end = max;
            if (max > 3) {
              start = max - 4;
            }
          }
          result = [];
          for (num = _i = start; start <= end ? _i <= end : _i >= end; num = start <= end ? ++_i : --_i) {
            result.push(num);
          }
          return result;
        };
        $scope.prevPage = function() {
          if ($scope.currentPage > 0) {
            return $scope.currentPage = $scope.currentPage - 1;
          }
        };
        $scope.nextPage = function() {
          if ($scope.currentPage < $scope.pagedItems.length - 1) {
            return $scope.currentPage = $scope.currentPage + 1;
          }
        };
        return $scope.setPage = function(n) {
          return $scope.currentPage = n;
        };
      }
    };
  }
]);

angular.module('gi.ui').directive('giSelect2', [
  '$timeout', function($timeout) {
    return {
      restrict: 'E',
      templateUrl: '/views/select2.html',
      scope: {
        selection: '=',
        options: '='
      },
      link: function(scope, elm, attrs, controller) {
        var createSearchChoice, escapeMarkup, markMatch, opts, textField;
        escapeMarkup = function(markup) {
          var replace_map;
          replace_map = {
            '\\': '&#92;',
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;',
            "/": '&#47;'
          };
          return String(markup).replace(/[&<>"'/\\]/g, function(match) {
            return replace_map[match[0]];
          });
        };
        markMatch = function(text, term, markup, escapeMarkup) {
          var match, tl;
          match = text.toUpperCase().indexOf(term.toUpperCase());
          tl = term.length;
          if (match < 0) {
            markup.push(escapeMarkup(text));
            return;
          }
          markup.push(escapeMarkup(text.substring(0, match)));
          markup.push("<span class='select2-match'>");
          markup.push(escapeMarkup(text.substring(match, match + tl)));
          markup.push("</span>");
          return markup.push(escapeMarkup(text.substring(match + tl, text.length)));
        };
        if (attrs.field != null) {
          textField = attrs.field;
        } else {
          textField = 'name';
        }
        opts = {
          multiple: attrs.tags != null,
          data: {
            results: scope.options,
            text: textField
          },
          width: 'copy',
          formatResult: function(result, container, query) {
            var markup;
            markup = [];
            markMatch(result[textField], query.term, markup, escapeMarkup);
            return markup.join("");
          },
          formatSelection: function(data, container) {
            return data[textField];
          },
          matcher: function(term, text, option) {
            return option[textField].toUpperCase().indexOf(term.toUpperCase()) >= 0;
          }
        };
        createSearchChoice = function(term, data) {
          var matchedItems, result;
          matchedItems = $(data).filter(function() {
            return this[textField].localeCompare(term) === 0;
          });
          if (matchedItems.length === 0) {
            result = {
              id: term
            };
            result[textField] = term;
            return result;
          } else {
            return {};
          }
        };
        if (attrs.custom != null) {
          opts.createSearchChoice = createSearchChoice;
        }
        attrs.$observe('disabled', function(value) {
          if (value) {
            return elm.select2('disable');
          } else {
            return elm.select2('enable');
          }
        });
        elm.bind("change", function() {
          if (attrs.debug != null) {
            console.log('in elem change 1');
          }
          return scope.$apply(function() {
            if (attrs.debug != null) {
              console.log('in elem change 2');
            }
            return scope.selection = elm.select2('data');
          });
        });
        if (attrs.debug != null) {
          console.log('select2 link');
        }
        scope.$watch('selection', function(newVal, oldVal) {
          if (attrs.debug != null) {
            console.log('selection watch hit');
            console.log('new:');
            console.log(newVal);
            console.log('old:');
            console.log(oldVal);
          }
          return elm.select2('data', newVal);
        });
        scope.$watch('options', function(newVal) {
          if (attrs.debug != null) {
            console.log('options watch hit');
            console.log('new:');
            console.log(newVal);
          }
          if (newVal) {
            if (scope.options) {
              opts.data.results = scope.options;
              return $timeout(function() {
                return elm.select2(opts);
              });
            }
          }
        });
        return $timeout(function() {
          return elm.select2(opts);
        });
      }
    };
  }
]);

angular.module('gi.ui').directive('giFileupload', [
  '$q', 'giFileManager', function($q, FileManager) {
    return {
      restrict: 'E',
      templateUrl: '/views/fileUpload.html',
      scope: {
        files: '=',
        parent: '='
      },
      link: function(scope, elem, attrs) {
        var downloadTemplate, extend, getResizedImage, optionsObj, previews, resized, uploadTemplate, uploadToS3;
        scope.addText = "Add an image";
        scope.pendingFiles = [];
        scope.uploadedFiles = [];
        scope.erroredFiles = [];
        downloadTemplate = function(o) {};
        uploadTemplate = function(o) {
          return scope.$apply(function() {
            return angular.forEach(o.files, function(file) {
              var fu;
              if (file.error) {
                fu = locale.fileupload;
                file.errorMessage = fu.errors[file.error] || file.error;
                scope.erroredFiles.push(file);
              } else {
                if (file.order == null) {
                  file.order = 0;
                }
                if (!file.exclude) {
                  file.exclude = true;
                }
                if (!file.primary) {
                  file.primary = true;
                }
                console.log(file);
                file.preview = previews[file.name];
                scope.pendingFiles.push(file);
              }
            });
          });
        };
        scope.formatFileSize = function(bytes) {
          if (!typeof bytes === 'number') {
            return 'N/A';
          } else if (bytes >= 1073741824) {
            return (bytes / 1073741824).toFixed(2) + ' GB';
          } else if (bytes >= 1048576) {
            return (bytes / 1048576).toFixed(2) + ' MB';
          } else {
            return (bytes / 1024).toFixed(2) + ' KB';
          }
        };
        getResizedImage = function(data, options) {
          var callback, deferred, file, img, name, newImg, param, that;
          deferred = $q.defer();
          options.canvas = true;
          img = data.canvas || data.img;
          if (img) {
            newImg = loadImage.scale(img, options);
          }
          if (newImg == null) {
            console.log('there is no resized image to get');
            deferred.resolve();
          } else {
            that = this;
            file = data.files[data.index];
            name = file.name;
            callback = function(blob) {
              if (blob.name == null) {
                if (file.type === blob.type) {
                  blob.name = options.prefix + file.name;
                } else if (file.name != null) {
                  blob.name = options.prefix;
                  +file.name.replace(/\..+$/, '.' + blob.type.substr(6));
                }
              }
              return deferred.resolve(blob);
            };
            if (newImg.mozGetAsFile) {
              if (/^image\/(jpeg|png)$/.test(file.type)) {
                param = options.prefix + name;
              } else if (name) {
                param = options.prefix + name.replace(/\..+$/, '') + '.png';
              } else {
                param = options.prefix + 'blob.png';
              }
              callback(newImg.mozGetAsFile(param, file.type));
            } else if (newImg.toBlob) {
              newImg.toBlob(callback, file.type);
            } else {
              console.log('THIS SHOULD NOT HAPPEN');
              deferred.resolve();
            }
          }
          return deferred.promise;
        };
        extend = function(object, properties) {
          var key, val;
          for (key in properties) {
            val = properties[key];
            object[key] = val;
          }
          return object;
        };
        optionsObj = {
          uploadTemplateId: null,
          downloadTemplateId: null,
          uploadTemplate: uploadTemplate,
          downloadTemplate: downloadTemplate,
          disableImagePreview: true,
          autoUpload: false,
          previewMaxWidth: 100,
          previewMaxHeight: 100,
          previewCrop: true,
          dropZone: elem,
          dataType: 'xml'
        };
        elem.fileupload(optionsObj);
        resized = {};
        previews = {};
        elem.bind('fileuploaddone', function(e, data) {
          return scope.$apply(function() {
            var name;
            name = data.files[0].name;
            if (name.indexOf('thumb') === 0) {
              console.log('resolving: ' + name);
              return data.files[0].promise.resolve();
            } else {
              scope.removeFromQueue(data.files[0]);
              console.log(data);
              return FileManager.save(data.files[0], scope.parent, data.formData).then(function(fileInfo) {
                var fu;
                console.log('resolving: ' + name);
                data.files[0].promise.resolve();
                if (data.files[0].error) {
                  fu = locale.fileupload;
                  file.errorMessage = fu.errors[file.error] || file.error;
                  return scope.erroredFiles.push(file);
                } else {
                  return scope.uploadedFiles.push(fileInfo);
                }
              });
            }
          });
        });
        elem.bind('fileuploadprocessdone', function(e, data) {
          return scope.$apply(function() {
            var name;
            name = data.files[0].name;
            data.files[0].s3alternates = [];
            resized[name] = [];
            return getResizedImage(data, {
              maxWidth: 940,
              maxHeight: 530,
              prefix: 'thumb/940/'
            }).then(function(blob) {
              resized[name].push(blob);
              data.files[0].s3alternates.push('thumb/940/');
              return getResizedImage(data, {
                maxWidth: 940,
                maxHeight: 300,
                prefix: 'thumb/300h/'
              }).then(function(blob) {
                resized[name].push(blob);
                data.files[0].s3alternates.push('thumb/300h/');
                return getResizedImage(data, {
                  maxWidth: 350,
                  maxHeight: 200,
                  prefix: 'thumb/350/'
                }).then(function(blob) {
                  resized[name].push(blob);
                  data.files[0].s3alternates.push('thumb/350/');
                  return getResizedImage(data, {
                    maxWidth: 150,
                    maxHeight: 150,
                    prefix: 'thumb/'
                  }).then(function(blob) {
                    var previewImg;
                    resized[name].push(blob);
                    data.files[0].s3alternates.push('thumb/');
                    previewImg = loadImage.scale(data.img, {
                      maxWidth: 80,
                      maxHeight: 80,
                      canvas: true
                    });
                    return previews[name] = previewImg;
                  });
                });
              });
            });
          });
        });
        scope.removeFromQueue = function(file) {
          var resultIndex;
          resultIndex = -1;
          angular.forEach(scope.pendingFiles, function(f, index) {
            if (f.name === file.name) {
              return resultIndex = index;
            }
          });
          if (resultIndex !== -1) {
            scope.pendingFiles.splice(resultIndex, 1);
            previews[file.name] = null;
            return resized[file.name] = null;
          }
        };
        scope.removeFromS3 = function(file, $event) {
          $event.preventDefault();
          console.log('remove from S3 called for:' + file.name);
          return FileManager.destroy(file._id).then(function() {
            var resultIndex;
            resultIndex = -1;
            angular.forEach(scope.uploadedFiles, function(f, index) {
              if (f._id === file._id) {
                return resultIndex = index;
              }
            });
            if (resultIndex !== -1) {
              return scope.uploadedFiles.splice(resultIndex, 1);
            }
          });
        };
        uploadToS3 = function(file) {
          var deferred;
          console.log('in send test');
          console.log(file);
          deferred = $q.defer();
          FileManager.getUploadToken(file, scope.parent).then(function(token) {
            var formData, mainFileDeferred, promises;
            elem.fileupload('option', 'url', token.url);
            formData = {
              key: token.path + '/' + file.name,
              AWSAccesskeyId: token.accessKey,
              acl: "public-read",
              policy: token.policy,
              signature: token.signature,
              success_action_status: "201",
              "Content-Type": file.type,
              primary: file.primary,
              exclude: file.exclude,
              order: file.order
            };
            elem.fileupload('send', {
              formData: formData,
              files: [file]
            });
            promises = [];
            promises.push(file.promise);
            mainFileDeferred = $q.defer();
            file.promise = mainFileDeferred;
            promises.push(mainFileDeferred.promise);
            angular.forEach(resized[file.name], function(f) {
              var resizeDeferred;
              resizeDeferred = $q.defer();
              f.promise = resizeDeferred;
              promises.push(resizeDeferred.promise);
              formData.key = token.path + "/" + f.name;
              return elem.fileupload('send', {
                files: [f],
                formData: formData
              });
            });
            resized[file.name] = null;
            return $q.all(promises).then(function() {
              console.log('all promises resolved for ' + file.name);
              return deferred.resolve();
            });
          });
          return deferred.promise;
        };
        scope.$watch('parent', function(newVal, oldVal) {
          if (newVal !== oldVal) {
            return FileManager.forParent(scope.parent).then(function(files) {
              scope.uploadedFiles = [];
              resized = {};
              return angular.forEach(files, function(file) {
                return scope.uploadedFiles.push(file);
              });
            });
          }
        });
        scope.$on('start-file-upload', function(e, parent, promise) {
          var promises;
          promises = [];
          angular.forEach(scope.pendingFiles, function(file) {
            return promises.push(uploadToS3(file));
          });
          console.log('waiting on ' + promises.length);
          +' files to be uploaded to S3';
          return $q.all(promises).then(function() {
            console.log('all files uploaded to S3');
            return promise.resolve();
          });
        });
      }
    };
  }
]);

angular.module('gi.ui').directive('giMin', [
  function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function($scope, $elem, $attrs, $ctrl) {
        var minValidator;
        $scope.$watch($attrs.giMin, function() {
          return $ctrl.$setViewValue($ctrl.$viewValue);
        });
        minValidator = function(value) {
          var min;
          min = $scope.$eval($attrs.giMin);
          if ((value != null) && (min != null)) {
            if (value < min) {
              $ctrl.$setValidity('giMin', false);
              return void 0;
            } else {
              $ctrl.$setValidity('giMin', true);
              return value;
            }
          }
        };
        $ctrl.$parsers.push(minValidator);
        return $ctrl.$formatters.push(minValidator);
      }
    };
  }
]);

angular.module('gi.ui').directive('giMax', [
  function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function($scope, $elem, $attrs, $ctrl) {
        var maxValidator;
        $scope.$watch($attrs.giMax, function() {
          return $ctrl.$setViewValue($ctrl.$viewValue);
        });
        maxValidator = function(value) {
          var max;
          max = $scope.$eval($attrs.giMax);
          if ((value != null) && (max != null)) {
            if (value > max) {
              $ctrl.$setValidity('giMax', false);
              return void 0;
            } else {
              $ctrl.$setValidity('giMax', true);
              return value;
            }
          }
        };
        $ctrl.$parsers.push(maxValidator);
        return $ctrl.$formatters.push(maxValidator);
      }
    };
  }
]);

angular.module('gi.ui').directive('giInteger', [
  function() {
    var intRegex;
    intRegex = /^\-?\d+$/;
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function($scope, $elem, $attrs, $ctrl) {
        return $ctrl.$parsers.unshift(function(value) {
          if (intRegex.test(value)) {
            $ctrl.$setValidity('giInteger', true);
            return value;
          } else {
            $ctrl.$setValidity('giInteger', false);
            return void 0;
          }
        });
      }
    };
  }
]);

angular.module('gi.ui').directive('giFloat', [
  function() {
    var intRegex;
    intRegex = /^\-?\d+((\.|\,)\d+)?$/;
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function($scope, $elem, $attrs, $ctrl) {
        return $ctrl.$parsers.unshift(function(viewValue) {
          if (intRegex.test(viewValue)) {
            $ctrl.$setValidity('giFloat', true);
            return parseFloat(viewValue.replace(',', '.'));
          } else {
            $ctrl.$setValidity('giFloat', false);
            return void 0;
          }
        });
      }
    };
  }
]);

angular.module('gi.ui').filter('giShorten', [
  function() {
    return function(str, len) {
      var result;
      result = '';
      if (str != null) {
        if (str.length > len) {
          result = str.substring(0, len) + '...';
        } else {
          result = str;
        }
      }
      return result;
    };
  }
]);

angular.module('gi.ui').factory('giFileManager', [
  '$q', '$http', 'giCrud', function($q, $http, Crud) {
    var crudService, forParent, getCDN, getPath, getToken, save;
    crudService = Crud.factory('files', true);
    getPath = function(parent) {
      var deferred;
      deferred = $q.defer();
      getCDN().then(function(cdn) {
        var path;
        path = cdn + '/public/images/' + parent.resourceType + '/' + parent.key + '/';
        return deferred.resolve(path);
      });
      return deferred.promise;
    };
    forParent = function(parent) {
      var deferred;
      deferred = $q.defer();
      getPath(parent).then(function(path) {
        return crudService.query({
          'parentId': parent.key
        }).then(function(files) {
          angular.forEach(files, function(file) {
            file.url = path + file.name;
            file.thumb = path + 'thumb/' + file.name;
            return file.del = "/FileManager/" + parent.resourceType + '/' + parent.key;
          });
          return deferred.resolve(files);
        });
      });
      return deferred.promise;
    };
    getCDN = function() {
      var deferred;
      deferred = $q.defer();
      $http.get('/api/s3token').success(function(data, status, headers, config) {
        return deferred.resolve(data.cdn);
      }).error(function(data, status, headers, config) {
        console.log('something went wrong getting CDN');
        return deferred.resolve();
      });
      return deferred.promise;
    };
    save = function(file, parent, formData) {
      var deferred;
      deferred = $q.defer();
      console.log('about to save file with alternates');
      console.log(file.s3alternates);
      getPath(parent).then(function(path) {
        var fileInfo;
        console.log('bob1');
        fileInfo = {
          name: file.name,
          parentId: parent.key,
          parentType: parent.resourceType,
          size: file.size,
          primary: file.primary,
          order: file.order,
          exclude: file.exclude,
          s3alternates: file.s3alternates
        };
        return crudService.save(fileInfo).then(function(result) {
          console.log('bob2');
          console.log('file is saved in mongo');
          result.thumb = path + 'thumb/' + file.name;
          return deferred.resolve(result);
        });
      });
      return deferred.promise;
    };
    getToken = function(file, parent, type) {
      var data, deferred;
      deferred = $q.defer();
      data = {
        filename: file.name,
        contentType: file.type,
        parent: parent
      };
      $http.post('/api/s3token', data).success(function(data, status, headers, config) {
        return deferred.resolve(data);
      }).error(function(data, status, headers, config) {
        console.log('something went wrong getting token');
        return deferred.resolve();
      });
      return deferred.promise;
    };
    return {
      all: crudService.all,
      forParent: forParent,
      getUploadToken: getToken,
      save: save,
      destroy: crudService.destroy
    };
  }
]);

angular.module('gi.ui').run(['$templateCache', function ($templateCache) {
	$templateCache.put('/views/dataTable.html', '<div class="row"> <div class="col-md-6"> <div ng-show="options.displayCounts"> {{ countMessage }} </div> </div> <div class="col-md-6" ng-hide="options.disableSearch"> <input class="search-query pull-right" placeholder="Search" ng-model="query"> </div> </div> <div class="row"> <div class="col-md-12"> <table class="table table-striped table-condensed table-hover"> <thead> <tr> <th ng-show="options.selectAll"><a ng-click="toggleSelectAll()" ng-model="selectAll">{{selectAll}}</a></th> <th ng-repeat="column in options.columns">{{column.header}}</th> </tr> </thead> <tbody> <tr ng-repeat="item in pagedItems[currentPage]" ng-click="selectRow(item)" gi-dt-item item="item" columns="options.columns" ng-class="{info: item.selected}"> </tr> </tbody> <tfoot> <td colspan="{{ options.columns.length }} "> <div class="pull-right"> <ul class="pagination"> <li ng-class="{disabled: currentPage==0}"> <a href ng-click="prevPage()">« Prev</a> </li> <li ng-repeat="n in range(currentPage)" ng-class="{active: n==currentPage}" ng-click="setPage(n)"> <a href ng-click="setPage(n)" ng-bind="n + 1"></a> </li> <li ng-class="{disabled: currentPage==pagedItems.length - 2}"> <a href ng-click="nextPage()">Next »</a> </li> </ul> </div> </td> </tfoot> </table> </div> </div>');
	$templateCache.put('/views/fileUpload.html', '<form> <div class="row-fluid fileupload-buttonbar"> <div class="col-md-7"> <span class="btn btn-success fileinput-button"> <i class="icon-plus icon-white"></i> <span>{{addText}}</span> <input id="fileupload" type="file" name="file" multiple> </span> </div> <div class="span5 fileupload-progress fade"> <div class="progress progress-success progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100"> <div class="bar" style="width:0%;"></div> </div> <div class="progress-extended">&nbsp;</div> </div> </div> <table class="table table-striped"> <thead> <tr> <th></th> <th>Name</th> <th>Size</th> <th>Primary</th> <th>Exclude From Detail</th> <th>Order</th> <th></th> <th></th> <th></th> </tr> </thead> <tbody class="files"> <tr ng-repeat="f in erroredFiles"> <td></td> <td>{{f.name}}</td> <td>{{formatFileSize(f.size)}}</td> <td colspan="2"><span class="label label-important error">{{f.errorMessage}}</span></td> </tr> <tr ng-repeat="f in pendingFiles"> <td><image-preview file="f"></image-preview></td> <td>{{f.name}}</td> <td>{{formatFileSize(f.size)}}</td> <td><input type="radio" name="primary" ng-checked="f.primary"></td> <td><input type="checkbox" ng-model="f.exclude"></td> <td><input type="number" class="input-mini" ng-model="f.order"></td> <td><button ng-click="removeFromQueue(f)" class="btn btn-warning"> <i class="icon-trash icon-white"></i> <span>Cancel</span> </button></td> </tr> <tr ng-repeat="f in uploadedFiles"> <td><img ng-src="{{f.thumb}}"></td> <td>{{f.name}}</td> <td>{{formatFileSize(f.size)}}</td> <td><input type="radio" name="primary" ng-checked="f.primary"></td> <td><input type="checkbox" ng-model="f.exclude"></td> <td><input type="number" class="input-mini" ng-model="f.order"></td> <td><button ng-click="removeFromS3(f, $event)" class="btn btn-danger"> <i class="icon-trash icon-white"></i> <span>Remove</span> </button></td> </tr> </tbody> </table> </form> ');
	$templateCache.put('/views/modal.html', '<div class="modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" ng-click="hide()" class="close">x</button> <h3>{{title}}</h3> </div> <div class="modal-body"> </div> <div class="modal-footer"> <button class="btn btn-default pull-right" ng-click="hide()">Cancel</button> </div> </div> </div> ');
	$templateCache.put('/views/select2.html', '<input type="text" class="form-control"/>');
}]);
;
