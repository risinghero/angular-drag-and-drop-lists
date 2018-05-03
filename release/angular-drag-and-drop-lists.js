var dndList;
(function (dndList) {
    function directive() {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i - 0] = arguments[_i];
        }
        return function (target) {
            var directive = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                return (function (classConstructor, args, ctor) {
                    ctor.prototype = classConstructor.prototype;
                    var child = new ctor;
                    var result = classConstructor.apply(child, args);
                    return typeof result === "object" ? result : child;
                })(target, args, function () {
                    return null;
                });
            };
            directive.$inject = values;
            return directive;
        };
    }
    dndList.directive = directive;
})(dndList || (dndList = {}));

var dndList;
(function (dndList) {
    var DndService = (function () {
        function DndService() {
        }
        return DndService;
    }());
    angular.module('dndLists', []).service('dndService', DndService);
})(dndList || (dndList = {}));

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var dndList;
(function (dndList) {
    var DndDraggable = (function () {
        function DndDraggable($parse, $timeout, dndService) {
            var _this = this;
            this.$parse = $parse;
            this.$timeout = $timeout;
            this.dndService = dndService;
            this.link = function (scope, element, attrs) {
                var self = _this;
                var mouseX = 0;
                var mouseY = 0;
                var transformX = 0;
                var transformY = 0;
                var parent;
                var nextElement;
                var initwidth;
                var initheight;
                var isDragging = false;
                var registerDrag = function (elements) {
                    if (typeof elements == 'string') {
                        elements = element[0].querySelectorAll(elements);
                        for (var i = 0; i < elements.length; i++)
                            registerDrag(elements[i]);
                        return;
                    }
                    draggableElements = elements;
                    interact(elements).draggable({
                        manualStart: true
                    }).on('move', function (event) {
                        if (isDragging)
                            return;
                        if (scope.disabled)
                            return;
                        var interaction = event.interaction;
                        if (!interaction.pointerIsDown || interaction.interacting())
                            return;
                        angular.element(document.body).addClass('dndDraggingBody');
                        isDragging = true;
                        var source = element[0];
                        var lists = source.querySelectorAll('[dnd-list]');
                        for (var i = 0; i < lists.length; i++) {
                            var list = lists[i];
                            interact(list).dropzone(false);
                        }
                        var rect = source.getBoundingClientRect();
                        mouseX = rect.left - event.clientX;
                        mouseY = rect.top - event.clientY;
                        transformX = 0;
                        transformY = 0;
                        var newNode = element[0].cloneNode(true);
                        var newElement = angular.element(newNode);
                        parent = element.parent()[0];
                        initheight = element.css('height');
                        initwidth = element.css('width');
                        nextElement = source.nextElementSibling;
                        newElement.addClass("dndDragging");
                        newElement.css('width', rect.width + "px");
                        newElement.css('height', rect.height + "px");
                        document.body.appendChild(newElement[0]);
                        rect = source.getBoundingClientRect();
                        transformX += event.clientX - rect.left + mouseX;
                        transformY += event.clientY - rect.top + mouseY;
                        newNode.style.webkitTransform =
                            newNode.style.transform =
                                'translate(' + transformX + 'px, ' + transformY + 'px)';
                        self.dndService.draggingObject = scope.$eval(attrs.dndDraggable);
                        self.dndService.isDroped = false;
                        self.dndService.draggingElementScope = scope;
                        self.dndService.draggingElement = newNode;
                        self.dndService.draggingSourceElement = element[0];
                        self.$timeout(function () {
                            self.$parse(attrs.dndDragstart)(scope, { event: event });
                        }, 0);
                        interact(newNode).draggable({
                            inertia: true,
                            autoScroll: false,
                        });
                        event.interaction.start({ name: 'drag' }, event.interactable, newNode);
                        source.style.display = 'none';
                    }).on('dragend', function (event) {
                        if (scope.disabled)
                            return;
                        event.interaction.stop();
                        if (!event.target || !event.target.parentNode)
                            return;
                        event.target.parentNode.removeChild(event.target);
                        var lists = element[0].querySelectorAll('[dnd-list]');
                        for (var i = 0; i < lists.length; i++) {
                            var list = lists[i];
                            interact(list).dropzone(true);
                        }
                        self.$timeout(function () {
                            scope.endDrag(event);
                            element[0].style.display = 'block';
                            angular.element(document.body).removeClass('dndDraggingBody');
                        }, 0);
                    }).on('dragmove', function (event) {
                        if (scope.disabled)
                            return;
                        var rect = event.target.getBoundingClientRect();
                        var target = event.target;
                        transformX += event.clientX - rect.left + mouseX;
                        transformY += event.clientY - rect.top + mouseY;
                        target.style.webkitTransform =
                            target.style.transform =
                                'translate(' + transformX + 'px, ' + transformY + 'px)';
                    });
                };
                if (attrs.ngDisabled) {
                    scope.disabled = scope.$eval(attrs.ngDisabled);
                    scope.$watch(attrs.ngDisabled, function (newValue, oldValue) {
                        scope.disabled = newValue;
                        if (!newValue)
                            registerDrag(draggableElements);
                        else {
                            unregisterDrag();
                            scope.endDrag(null);
                        }
                    });
                }
                var clickHandler = function (event) {
                    if (scope.disabled)
                        return;
                    if (!attrs.dndSelected)
                        return;
                    scope.$apply(function () {
                        self.$parse(attrs.dndSelected)(scope, { event: event });
                    });
                    event.stopPropagation();
                };
                var registerClick = function () {
                    element.off('click touchstart', clickHandler);
                    element.on('click touchstart', clickHandler);
                };
                registerClick();
                var draggableElements;
                var unregisterDrag = function () {
                    interact(draggableElements).draggable(false);
                };
                scope.endDrag = function (event) {
                    if (!isDragging)
                        return;
                    isDragging = false;
                    element.removeClass("dndDragging");
                    if (self.dndService.isDroped) {
                        if (!self.$parse(attrs.dndMoved)(scope, { event: event })) {
                            self.dndService.isDroped = false;
                            return false;
                        }
                    }
                    else {
                        self.$parse(attrs.dndCanceled)(scope, { event: event });
                        return false;
                    }
                    self.$parse(attrs.dndDragend)(scope, { event: event, isDroped: self.dndService.isDroped });
                    self.dndService.isDroped = false;
                    return true;
                };
                if (attrs.dndHandle) {
                    var handleString = scope.$eval(attrs.dndHandle);
                    registerDrag(handleString);
                    scope.$watch(attrs.dndHandle, function (newValue, oldValue, scope) {
                        unregisterDrag();
                        registerDrag(newValue);
                    });
                }
                else {
                    registerDrag(element[0]);
                }
            };
        }
        DndDraggable = __decorate([
            dndList.directive('$parse', '$timeout', 'dndService')
        ], DndDraggable);
        return DndDraggable;
    }());
    angular.module('dndLists').directive('dndDraggable', DndDraggable);
})(dndList || (dndList = {}));

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var dndList;
(function (dndList) {
    var DndList = (function () {
        function DndList($parse, $timeout, dndService) {
            var _this = this;
            this.$parse = $parse;
            this.$timeout = $timeout;
            this.dndService = dndService;
            this.link = function (scope, element, attrs) {
                var horizontal = attrs.dndHorizontalList && scope.$eval(attrs.dndHorizontalList);
                var placeholder = _this.getPlaceholderElement(element);
                var placeholderNode = placeholder[0];
                var listNode = element[0];
                placeholder.remove();
                var self = _this;
                var dropX = 0;
                var dropY = 0;
                var unsubscribeDragStart;
                var interactOptions = {};
                if (attrs.dndAccept)
                    interactOptions.accept = attrs.dndAccept;
                interact(element[0]).dropzone(interactOptions).on('dragenter', function (event) {
                    if (scope.disabled)
                        return;
                    dropX = 0;
                    dropY = 0;
                    self.dndService.isDroped = false;
                }).on('dragleave', function (event) {
                    return self.stopDragover(placeholder, element);
                }).on('dropmove', function (event) {
                    if (scope.disabled)
                        return self.stopDragover(placeholder, element);
                    var source = angular.element(self.dndService.draggingElement);
                    if (placeholderNode.parentNode != listNode) {
                        element.append(placeholder);
                    }
                    var dragTarget;
                    var display = source.css('display');
                    source.css('display', 'none');
                    dragTarget = document.elementFromPoint(event.dragEvent.clientX, event.dragEvent.clientY);
                    source.css('display', display);
                    if (dragTarget !== listNode) {
                        var listItemNode = dragTarget;
                        while (listItemNode.parentNode !== listNode && listItemNode.parentNode) {
                            listItemNode = listItemNode.parentNode;
                        }
                        if (listItemNode.parentNode === listNode && listItemNode !== placeholderNode) {
                            if (self.isMouseInFirstHalf(event, listItemNode)) {
                                listNode.insertBefore(placeholderNode, listItemNode);
                            }
                            else {
                                listNode.insertBefore(placeholderNode, listItemNode.nextElementSibling);
                            }
                        }
                    }
                    if (attrs.dndDragover &&
                        !self.invokeCallback(scope, attrs.dndDragover, event, self.getPlaceholderIndex(listNode, placeholderNode), self.dndService.draggingObject)) {
                        self.stopDragover(placeholder, element);
                    }
                    element.addClass("dndDragover");
                }).on('drop', function (event) {
                    if (self.dndService.isDroped)
                        return;
                    if (scope.disabled)
                        return self.stopDragover(placeholder, element);
                    var transferredObject = self.dndService.draggingObject;
                    if (!transferredObject)
                        return self.stopDragover(placeholder, element);
                    transferredObject = angular.copy(transferredObject);
                    self.$timeout(function () {
                        if (self.dndService.stopDrop) {
                            self.dndService.isDroped = false;
                            self.dndService.draggingElementScope.endDrag();
                            return self.stopDragover(placeholder, element);
                        }
                        var index = self.getPlaceholderIndex(listNode, placeholderNode);
                        if (index < 0)
                            return self.stopDragover(placeholder, element);
                        if (attrs.dndDragover &&
                            !self.invokeCallback(scope, attrs.dndDragover, event, index, transferredObject)) {
                            return self.stopDragover(placeholder, element);
                        }
                        if (attrs.dndBeforeDrop) {
                            var result = self.invokeCallback(scope, attrs.dndBeforeDrop, event, index, transferredObject);
                            if (!result) {
                                self.dndService.isDroped = false;
                                self.dndService.draggingElementScope.endDrag(event);
                                return self.stopDragover(placeholder, element);
                            }
                        }
                        self.dndService.isDroped = true;
                        if (!self.dndService.draggingElementScope.endDrag(event))
                            return self.stopDragover(placeholder, element);
                        index = self.getPlaceholderIndexWithoutNode(listNode, placeholderNode, self.dndService.draggingSourceElement);
                        if (attrs.dndDrop) {
                            transferredObject = self.invokeCallback(scope, attrs.dndDrop, event, index, transferredObject);
                        }
                        if (transferredObject !== true) {
                            scope.$eval(attrs.dndList).splice(index, 0, transferredObject);
                        }
                        self.invokeCallback(scope, attrs.dndInserted, event, index, transferredObject);
                        self.stopDragover(placeholder, element);
                    }, 0);
                });
                if (attrs.ngDisabled) {
                    scope.disabled = scope.$eval(attrs.ngDisabled);
                    if (scope.disabled)
                        interact(element[0]).dropzone(false);
                    scope.$watch(attrs.ngDisabled, function (newValue, oldValue) {
                        scope.disabled = newValue;
                        if (!newValue)
                            interact(element[0]).dropzone(true);
                        else {
                            interact(element[0]).dropzone(false);
                        }
                    });
                }
            };
        }
        DndList.prototype.isMouseInFirstHalf = function (event, targetNode, horizontal) {
            if (horizontal === void 0) { horizontal = false; }
            var dragEvent = event.dragEvent;
            var mousePointer = horizontal ? dragEvent.clientX
                : dragEvent.clientY;
            var rect = targetNode.getBoundingClientRect();
            var targetSize = horizontal ? rect.width : rect.height;
            var targetPosition = horizontal ? rect.left : rect.top;
            return mousePointer < targetPosition + targetSize / 2;
        };
        DndList.prototype.stopDragover = function (placeholder, element) {
            placeholder.remove();
            element.removeClass("dndDragover");
            return true;
        };
        DndList.prototype.getPlaceholderIndex = function (listNode, placeholderNode) {
            return Array.prototype.indexOf.call(listNode.children, placeholderNode);
        };
        DndList.prototype.getPlaceholderIndexWithoutNode = function (listNode, placeholderNode, ignoreNode) {
            var result = 0;
            for (var i = 0; i < listNode.children.length; i++, result++) {
                if (listNode.children[i] == placeholderNode)
                    return result;
                if (listNode.children[i] == ignoreNode)
                    result--;
            }
            return result;
        };
        DndList.prototype.invokeCallback = function (scope, expression, event, index, item) {
            if (item === void 0) { item = null; }
            return this.$parse(expression)(scope, {
                event: event,
                index: index,
                item: item || undefined
            });
        };
        DndList.prototype.getPlaceholderElement = function (element) {
            var placeholder;
            angular.forEach(element.children(), function (childNode) {
                var child = angular.element(childNode);
                if (child.hasClass('dndPlaceholder')) {
                    placeholder = child;
                }
            });
            return placeholder || angular.element("<li class='dndPlaceholder'></li>");
        };
        DndList = __decorate([
            dndList.directive('$parse', '$timeout', 'dndService')
        ], DndList);
        return DndList;
    }());
    angular.module('dndLists').directive('dndList', DndList);
})(dndList || (dndList = {}));
